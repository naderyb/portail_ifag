import { Shell } from "@/components/layout/Shell";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { getAdminDashboardStats } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  const stats = await getAdminDashboardStats();

  return (
    <Shell
      title="Espace Administration"
      subtitle="Pilotage des étudiants, enseignants, classes et indicateurs."
      variant="admin"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-800">
            Statistiques globales
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <StatCard
              label="Étudiants actifs"
              value={stats.students_count}
              trend="+2% vs. N-1"
            />
            <StatCard label="Enseignants" value={stats.teachers_count} />
            <StatCard
              label="Taux d'assiduité"
              value={`${stats.attendance_rate}%`}
              trend={stats.attendance_rate >= 90 ? "Stable" : "À surveiller"}
            />
            <StatCard
              label="Annonces publiées ce mois"
              value={stats.announcements_this_month}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Gestion des étudiants">
            <ul className="text-sm text-slate-800">
              <li>• Liste, recherche et filtrage par classe/groupe.</li>
              <li>• Consultation des notes et absences.</li>
              <li>• Export CSV / PDF.</li>
            </ul>
          </Card>
          <Card title="Gestion des enseignants">
            <ul className="text-sm text-slate-800">
              <li>• Répartition des charges horaires.</li>
              <li>• Affectation aux modules et groupes.</li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Classes & groupes">
            <ul className="text-sm text-slate-800">
              <li>• Création / édition des classes et groupes.</li>
              <li>• Affectation des étudiants.</li>
              <li>• Synchronisation avec les emplois du temps.</li>
            </ul>
          </Card>
          <Card title="Notes & absences">
            <ul className="text-sm text-slate-800">
              <li>• Vue d&apos;ensemble des moyennes par module.</li>
              <li>• Alertes sur les absences critiques.</li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Publication d'annonces">
            <p className="text-sm text-slate-800">
              Interface simple pour rédiger, cibler (classe, spécialité, niveau)
              et planifier les annonces officielles de l&apos;établissement.
            </p>
          </Card>
          <Card title="Tableau de bord académique">
            <p className="text-sm text-slate-800">
              Vue synthétique des taux de réussite, redoublement, progression
              par spécialité et par cohorte.
            </p>
          </Card>
        </section>
      </div>
    </Shell>
  );
}
