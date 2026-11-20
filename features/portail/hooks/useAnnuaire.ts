// ============================================================
// features/portail/hooks/useAnnuaire.ts
// Collaborateurs depuis Microsoft 365 (via /api/portail/annuaire),
// avec repli sur les données de démonstration si indisponible.
// Le résultat est mis en cache pour la session de navigation.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { COLLABORATEURS, type Collaborateur } from "../data/portail.mock";

export type SourceAnnuaire = "microsoft" | "demo";

interface EtatAnnuaire {
  collaborateurs: Collaborateur[];
  source: SourceAnnuaire;
  chargement: boolean;
  /** Code d'erreur si repli sur la démo (ex. JETON_EXPIRE, GRAPH_403) */
  erreur?: string;
}

let cache: Promise<Omit<EtatAnnuaire, "chargement">> | null = null;

function charger() {
  if (!cache) {
    cache = fetch("/api/portail/annuaire")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(data.collaborateurs) || data.collaborateurs.length === 0) {
          throw new Error(data.erreur ?? `HTTP_${res.status}`);
        }
        return { collaborateurs: data.collaborateurs as Collaborateur[], source: "microsoft" as const };
      })
      .catch((e: Error) => {
        cache = null; // nouvel essai à la prochaine visite
        return { collaborateurs: COLLABORATEURS, source: "demo" as const, erreur: e.message };
      });
  }
  return cache;
}

export function useAnnuaire(): EtatAnnuaire {
  const [etat, setEtat] = useState<EtatAnnuaire>({ collaborateurs: [], source: "demo", chargement: true });

  useEffect(() => {
    let actif = true;
    charger().then((r) => {
      if (actif) setEtat({ ...r, chargement: false });
    });
    return () => {
      actif = false;
    };
  }, []);

  return etat;
}
