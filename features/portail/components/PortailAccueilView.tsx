// ============================================================
// features/portail/components/PortailAccueilView.tsx
// Vue de l'accueil du portail (indépendante de l'authentification)
// ============================================================

"use client";

import { useState } from "react";
import type { PortailApp } from "../data/catalogue";
import { APPLICATIONS } from "../data/catalogue";
import {
  ACTUALITES,
  COLLABORATEURS,
  IS_DEMO_DATA,
  getAnniversairesDuMois,
  getNouveauxArrivants,
  type Collaborateur,
} from "../data/portail.mock";
import { AppsCatalogue } from "./AppsCatalogue";
import { NewsFeed } from "./NewsFeed";
import { PersonModal } from "./PersonModal";
import { PortailBackground } from "./PortailBackground";
import { PortailFooter } from "./PortailFooter";
import { PortailHeader } from "./PortailHeader";
import { TeamWidget } from "./TeamWidget";
import { WelcomeHero } from "./WelcomeHero";

interface Props {
  prenom: string;
  nom: string;
  libelleRole: string;
  onLogout: () => void;
  onOpenApp: (app: PortailApp) => void;
}

export function PortailAccueilView({ prenom, nom, libelleRole, onLogout, onOpenApp }: Props) {
  const [personne, setPersonne] = useState<Collaborateur | null>(null);

  const now = new Date();
  const dateDuJour = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const salutation = now.getHours() < 18 ? "Bonjour" : "Bonsoir";

  return (
    <div className="relative isolate min-h-screen flex flex-col">
      <PortailBackground />

      <PortailHeader
        prenom={prenom}
        nom={nom}
        libelleRole={libelleRole}
        onLogout={onLogout}
        onOpenApp={onOpenApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-14">
        <WelcomeHero
          prenom={prenom}
          dateDuJour={dateDuJour}
          salutation={salutation}
          stats={[
            { valeur: APPLICATIONS.filter((a) => a.statut === "DISPONIBLE").length, label: "Applications disponibles" },
            { valeur: COLLABORATEURS.length, label: "Collaborateurs" },
            { valeur: ACTUALITES.length, label: "Actualités récentes" },
          ]}
        />

        <AppsCatalogue onOpen={onOpenApp} />

        <div className="grid gap-10 lg:gap-8 lg:grid-cols-[1fr_360px] items-start">
          <NewsFeed actualites={ACTUALITES} />
          <TeamWidget
            equipe={COLLABORATEURS}
            nouveaux={getNouveauxArrivants()}
            anniversaires={getAnniversairesDuMois()}
            onSelect={setPersonne}
          />
        </div>

        {IS_DEMO_DATA && (
          <p className="text-center text-[11px] text-slate-400">
            Aperçu : actualités et trombinoscope en données de démonstration, en attendant la connexion à Microsoft 365 et LinkedIn.
          </p>
        )}
      </main>

      <PortailFooter />
      <PersonModal personne={personne} onClose={() => setPersonne(null)} />
    </div>
  );
}
