// ============================================================
// features/portail/components/PortailAccueilView.tsx
// Vue de l'accueil du portail (indépendante de l'authentification)
// ============================================================

"use client";

import { AssistantWidget } from "@/features/assistant/components/AssistantWidget";
import { useCallback, useState } from "react";
import type { PortailApp } from "../data/catalogue";
import { APPLICATIONS } from "../data/catalogue";
import {
  ACTUALITES,
  IS_DEMO_DATA,
  getAnniversairesDuJour,
  getAnniversairesDuMois,
  getNouveauxArrivants,
  type Collaborateur,
} from "../data/portail.mock";
import { useAnnuaire } from "../hooks/useAnnuaire";
import { AppsCatalogue } from "./AppsCatalogue";
import { BirthdayCelebration } from "./BirthdayCelebration";
import { NewsSpotlight } from "./NewsSpotlight";
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
  const fermer = useCallback(() => setPersonne(null), []);
  const { collaborateurs, source } = useAnnuaire();

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
        personnes={collaborateurs}
        onLogout={onLogout}
        onOpenApp={onOpenApp}
        onSelectPerson={setPersonne}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <WelcomeHero
          prenom={prenom}
          dateDuJour={dateDuJour}
          salutation={salutation}
          stats={[
            { valeur: APPLICATIONS.filter((a) => a.statut === "DISPONIBLE").length, label: "Applications disponibles" },
            { valeur: collaborateurs.length || "—", label: "Collaborateurs" },
            { valeur: ACTUALITES.length, label: "Actualités récentes" },
          ]}
        />

        <BirthdayCelebration personnes={getAnniversairesDuJour(collaborateurs)} onSelect={setPersonne} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-stretch">
          <NewsSpotlight actualites={ACTUALITES} />
          <TeamWidget
            equipe={collaborateurs}
            nouveaux={getNouveauxArrivants(collaborateurs)}
            anniversaires={getAnniversairesDuMois(collaborateurs)}
            onSelect={setPersonne}
          />
        </div>

        <div className="pt-6">
          <AppsCatalogue onOpen={onOpenApp} />
        </div>

        {IS_DEMO_DATA && (
          <p className="text-center text-[11px] text-slate-400">
            Aperçu : actualités{source === "demo" ? " et trombinoscope" : ""} en données de démonstration, en attendant la connexion {source === "demo" ? "à Microsoft 365 et " : ""}à LinkedIn.
          </p>
        )}
      </main>

      <PortailFooter />
      <PersonModal personne={personne} onClose={fermer} />
      <AssistantWidget prenom={prenom} />
    </div>
  );
}
