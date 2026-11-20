"use client";

// ============================================================
// app/portail/page.tsx — Accueil du Portail Agilly
// Applications par département · Actualités · Trombinoscope
// ============================================================

import { useState } from "react";
import Link from "next/link";
import PortailLoading from "./loading";
import { usePortailSession } from "@/features/portail/hooks/usePortailSession";
import { PortailHeader } from "@/features/portail/components/PortailHeader";
import { AppsCatalogue } from "@/features/portail/components/AppsCatalogue";
import { NewsFeed } from "@/features/portail/components/NewsFeed";
import { TeamWidget } from "@/features/portail/components/TeamWidget";
import { PersonModal } from "@/features/portail/components/PersonModal";
import {
  ACTUALITES,
  COLLABORATEURS,
  IS_DEMO_DATA,
  getAnniversairesDuMois,
  getNouveauxArrivants,
  type Collaborateur,
} from "@/features/portail/data/portail.mock";

function salutation(): string {
  const h = new Date().getHours();
  return h < 18 ? "Bonjour" : "Bonsoir";
}

export default function PortailPage() {
  const { user, role, isLoading, logout, libelleRole, openApp } = usePortailSession();
  const [personne, setPersonne] = useState<Collaborateur | null>(null);

  if (isLoading) return <PortailLoading />;
  if (!user || !role) return null;

  const aujourdHui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-agilly-bg flex flex-col">
      <PortailHeader
        prenom={user.prenom}
        nom={user.nom}
        libelleRole={libelleRole}
        onLogout={logout}
        onOpenApp={openApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10 space-y-10">
        {/* ─── Bienvenue ─── */}
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold text-agilly-gray first-letter:uppercase">{aujourdHui}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-agilly-black tracking-tight mt-1">
              {salutation()}, <span className="text-agilly-primary">{user.prenom}</span>
            </h1>
            <p className="text-sm text-agilly-gray mt-1">Bienvenue sur l&apos;espace collaborateur Agilly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/absences/nouvelle" className="btn-soft-primary">+ Nouvelle demande</Link>
            <Link href="/absences/validations" className="btn-soft-secondary">Mes validations</Link>
          </div>
        </section>

        {IS_DEMO_DATA && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5">
            Aperçu : les actualités et le trombinoscope affichent des <strong>données de démonstration</strong>, en attendant la connexion à Microsoft 365 et LinkedIn.
          </p>
        )}

        {/* ─── Applications par département ─── */}
        <AppsCatalogue onOpen={openApp} />

        {/* ─── Actualités + Équipe ─── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
          <NewsFeed actualites={ACTUALITES} />
          <TeamWidget
            nouveaux={getNouveauxArrivants()}
            anniversaires={getAnniversairesDuMois()}
            total={COLLABORATEURS.length}
            onSelect={setPersonne}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>© {new Date().getFullYear()} Agilly — Portail collaborateur</span>
          <span>Connexion sécurisée Microsoft</span>
        </div>
      </footer>

      <PersonModal personne={personne} onClose={() => setPersonne(null)} />
    </div>
  );
}
