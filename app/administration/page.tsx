export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { query } from "@/lib/db";
import Link from "next/link";

async function AdministrationDashboardPage() {
  // Paiements: agrégats principaux
  const { rows: paymentStatsRows } = await query<{
    total_collected: string | null;
    pending: number;
    overdue: number;
  }>(
    `
    SELECT
      COALESCE((
        SELECT SUM(amount)::numeric
        FROM payments
        WHERE status = 'completed'
          AND date_trunc('month', payment_date) = date_trunc('month', now())
      ), 0)::text AS total_collected,
      (SELECT COUNT(*)::int FROM payments WHERE status = 'pending') AS pending,
      (SELECT COUNT(*)::int FROM payments WHERE status = 'failed')  AS overdue
    `,
  );
  const paymentStatsRow = paymentStatsRows[0] || {
    total_collected: "0",
    pending: 0,
    overdue: 0,
  };
  const paymentStats = {
    totalCollectedThisMonth: Number(paymentStatsRow.total_collected || 0),
    pendingPayments: paymentStatsRow.pending,
    overduePayments: paymentStatsRow.overdue,
  };

  // Demandes administratives: agrégats principaux
  const { rows: requestStatsRows } = await query<{
    pending_administrative_requests: number;
    transcripts_paper_pending: number;
    duplicates_pending: number;
  }>(
    `
    SELECT
      (SELECT COUNT(*)::int FROM admin_requests WHERE status = 'pending') AS pending_administrative_requests,
      (SELECT COUNT(*)::int FROM admin_requests WHERE status = 'pending' AND request_type = 'Relevé papier') AS transcripts_paper_pending,
      (SELECT COUNT(*)::int FROM admin_requests WHERE status = 'pending' AND request_type = 'Duplicata') AS duplicates_pending
    `,
  );
  const requestStatsRow = requestStatsRows[0] || {
    pending_administrative_requests: 0,
    transcripts_paper_pending: 0,
    duplicates_pending: 0,
  };
  const requestsStats = {
    pendingAdministrativeRequests:
      requestStatsRow.pending_administrative_requests,
    transcriptsPaperPending: requestStatsRow.transcripts_paper_pending,
    duplicatesPending: requestStatsRow.duplicates_pending,
  };

  // Derniers paiements
  const { rows: latestPaymentsRows } = await query<{
    id: number;
    student_full_name: string | null;
    class_name: string | null;
    amount: string; // NUMERIC as text
    status: string;
    date: string;
  }>(
    `
    SELECT
      p.id,
      sp.full_name AS student_full_name,
      sp.class_name,
      p.amount::text AS amount,
      p.status,
      to_char(p.payment_date, 'YYYY-MM-DD') AS date
    FROM payments p
    LEFT JOIN v_student_profile sp ON sp.id = p.student_id
    ORDER BY p.payment_date DESC, p.id DESC
    LIMIT 5
    `,
  );

  const latestPayments = latestPaymentsRows.map((p) => ({
    id: `PAY-${p.id.toString().padStart(4, "0")}`,
    student: p.student_full_name ?? `Étudiant #${p.id}`,
    className: p.class_name ?? "—",
    amount: `${Number(p.amount || 0).toLocaleString("fr-DZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DA`,
    status: p.status,
    date: p.date,
  }));

  // Dernières demandes administratives
  const { rows: latestRequestsRows } = await query<{
    id: number;
    student_full_name: string | null;
    request_type: string;
    status: string;
    date: string;
  }>(
    `
    SELECT
      ar.id,
      sp.full_name AS student_full_name,
      ar.request_type,
      ar.status,
      to_char(ar.submitted_at, 'YYYY-MM-DD') AS date
    FROM admin_requests ar
    LEFT JOIN v_student_profile sp ON sp.id = ar.student_id
    ORDER BY ar.submitted_at DESC, ar.id DESC
    LIMIT 5
    `,
  );

  const latestRequests = latestRequestsRows.map((r) => ({
    id: `ADM-${r.id.toString().padStart(4, "0")}`,
    student: r.student_full_name ?? `Étudiant #${r.id}`,
    type: r.request_type,
    status:
      r.status === "approved"
        ? "Traité"
        : r.status === "rejected"
          ? "Rejeté"
          : "En cours",
    date: r.date,
  }));

  const adminNav = [
    { label: "Vue globale", href: "/administration" },
    { label: "Paiements", href: "/administration/paiements" },
    { label: "Demandes administratives", href: "/administration/demandes" },
    { label: "Dossiers étudiants", href: "/administration/dossiers" },
    { label: "Personnel", href: "/administration/personnel" },
    { label: "Annonces", href: "/administration/annonces" },
  ];

  return (
    <Shell
      title="Administration"
      subtitle="Suivi des paiements et des démarches administratives des étudiants"
      variant="admin"
    >
      <div className="space-y-4">
        {/* Mobile nav (collapsible) */}
        <div className="md:hidden">
          <Card>
            <details className="text-xs text-slate-200">
              <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Menu administration
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-100 hover:border-sky-500 hover:text-sky-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </Card>
        </div>

        <div className="flex gap-4">
          {/* Desktop sidebar */}
          <aside className="hidden w-52 shrink-0 md:block">
            <Card>
              <nav className="flex flex-col gap-2 text-xs">
                {adminNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 hover:border-sky-500 hover:text-sky-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-6">
            {/* Bandeau synthèse */}
            <Card>
              <div className="flex flex-col gap-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-50">
                    Vue globale • Administration
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Gestion des paiements, demandes administratives, duplicata
                    et relevés de notes (version papier). Les effectifs, classes
                    et organisation pédagogique sont sous la responsabilité de
                    la scolarité.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Paiements collectés (mois en cours)
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">
                      {paymentStats.totalCollectedThisMonth.toLocaleString(
                        "fr-DZ",
                      )}{" "}
                      DA
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-4 py-2 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Demandes admin. en attente
                    </p>
                    <p className="mt-1 text-lg font-semibold text-amber-300">
                      {requestsStats.pendingAdministrativeRequests}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats principales */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card title="Statut des paiements">
                <div className="space-y-3 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Paiements en attente</span>
                    <span className="font-semibold text-amber-300">
                      {paymentStats.pendingPayments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Paiements en retard</span>
                    <span className="font-semibold text-rose-300">
                      {paymentStats.overduePayments}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] italic text-slate-500">
                    Les relances automatiques peuvent être configurées dans le
                    module paiements.
                  </p>
                </div>
              </Card>

              <Card title="Demandes administratives">
                <div className="space-y-3 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Total demandes en attente
                    </span>
                    <span className="font-semibold text-amber-300">
                      {requestsStats.pendingAdministrativeRequests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Relevés papier en préparation
                    </span>
                    <span className="font-semibold text-sky-300">
                      {requestsStats.transcriptsPaperPending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duplicata à traiter</span>
                    <span className="font-semibold text-sky-300">
                      {requestsStats.duplicatesPending}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] italic text-slate-500">
                    Inclut les demandes de duplicata, attestations et relevés de
                    notes version papier.
                  </p>
                </div>
              </Card>

              <Card title="Coordination avec la scolarité">
                <div className="space-y-3 text-xs text-slate-200">
                  <p className="text-slate-300">
                    La scolarité est en charge des éléments académiques :
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-slate-300">
                    <li>Effectifs et listes des étudiants</li>
                    <li>Classes, groupes et spécialités</li>
                    <li>Organisation du calendrier pédagogique</li>
                  </ul>
                  <p className="mt-2 text-[10px] italic text-slate-500">
                    L&apos;administration reste focalisée sur les aspects
                    financiers et les documents administratifs.
                  </p>
                </div>
              </Card>
            </div>

            {/* Tableaux récents */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card title="Derniers paiements enregistrés">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900/80">
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Réf.
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Étudiant
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Classe
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-right font-semibold text-slate-100">
                          Montant
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-center font-semibold text-slate-100">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {p.id}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {p.student}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {p.className}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-right text-slate-100">
                            {p.amount}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                p.status === "completed"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                                  : p.status === "failed"
                                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                                    : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {p.status === "completed"
                                ? "Validé"
                                : p.status === "failed"
                                  ? "Échoué"
                                  : "En attente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Dernières demandes administratives">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-900/80">
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Réf.
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Étudiant
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-left font-semibold text-slate-100">
                          Type
                        </th>
                        <th className="border-b border-slate-700 px-3 py-2 text-center font-semibold text-slate-100">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRequests.map((r) => (
                        <tr key={r.id}>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {r.id}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {r.student}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-slate-100">
                            {r.type}
                          </td>
                          <td className="border-b border-slate-800 px-3 py-2 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                r.status === "Traité"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                                  : r.status === "En cours"
                                    ? "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                                    : "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[10px] italic text-slate-500">
                  Ce tableau récapitule les dernières demandes reçues. Pour le
                  détail complet et le suivi individuel, utilisez le module
                  &quot;Demandes administratives&quot;.
                </p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </Shell>
  );
}

export default function AdministrationPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 text-slate-200">
          Chargement du tableau de bord administration...
        </div>
      }
    >
      <AdministrationDashboardPage />
    </Suspense>
  );
}
