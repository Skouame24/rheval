// ============================================================
// lib/utils/simulation.ts
// Simulateur de profils (comptes de test) : environnements de TEST uniquement.
// Activé par NEXT_PUBLIC_AUTORISER_SIMULATION=true au moment du build.
// En production, les comptes de test ne doivent jamais apparaître.
// ============================================================

export const SIMULATION_ACTIVE = process.env.NEXT_PUBLIC_AUTORISER_SIMULATION === "true";
