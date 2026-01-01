"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Role = {
  id: "scolarite" | "enseignant" | "administration" | "etudiant";
  label: string;
  description: string;
  accent: string;
};

const roles: Role[] = [
  {
    id: "scolarite",
    label: "Scolarité",
    description: "Gérer les emplois du temps, inscriptions et documents.",
    accent: "from-emerald-400 to-emerald-500",
  },
  {
    id: "enseignant",
    label: "Enseignant",
    description: "Consulter vos cours, notes et communications.",
    accent: "from-cyan-400 to-sky-500",
  },
  {
    id: "administration",
    label: "Administration",
    description: "Piloter l’activité globale et les indicateurs.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    id: "etudiant",
    label: "Étudiant",
    description: "Dashboard gamifié, notes, absences, annonces.",
    accent: "from-violet-400 to-fuchsia-500",
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleClick = (role: Role) => {
    if (role.id === "scolarite" || role.id === "enseignant") {
      window.location.href = "https://ifag-edu.com/auth";
    } else if (role.id === "administration") {
      router.push("/administration");
    } else if (role.id === "etudiant") {
      router.push("/student");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1c87ff33,_#020617)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10">
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
          >
            Portail universitaire privé &nbsp;
            <span className="font-semibold text-brand-300">IFAG</span>
          </motion.div>
          <motion.h1
            className="mt-6 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Choisissez votre espace
          </motion.h1>
          <motion.p
            className="mt-3 max-w-xl text-sm text-slate-300 md:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Centralisation des services, emplois du temps, notes, absences et
            communications internes.
          </motion.p>
        </header>

        <main className="flex-1">
          <div className="grid gap-5 md:grid-cols-2">
            {roles.map((role, idx) => (
              <motion.button
                key={role.id}
                onClick={() => handleClick(role)}
                className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left shadow-soft transition hover:-translate-y-1 hover:border-brand-400/80 hover:shadow-xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <div
                  className={`mb-3 inline-flex rounded-full bg-gradient-to-r ${role.accent} px-3 py-1 text-xs font-semibold text-slate-950`}
                >
                  {role.label}
                </div>
                <div className="text-sm text-slate-300">{role.description}</div>
                <div className="mt-4 text-xs font-medium text-brand-300">
                  Accéder à l’espace →
                </div>
              </motion.button>
            ))}
          </div>
        </main>

        <footer className="mt-10 text-xs text-slate-500">
          © {new Date().getFullYear()} IFAG – Portail interne.
        </footer>
      </div>
    </div>
  );
}
