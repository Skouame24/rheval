import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/proxy/* est servi par app/api/proxy/[...chemin]/route.ts (proxy authentifié)
  async redirects() {
    return [
      {
        source: "/dashboard/mon-espace/demandes",
        destination: "/absences/demandes",
        permanent: false,
      },
      // Anciennes pages « interventions » (doublons) → espace Missions
      {
        source: "/absences/interventions/nouvelle",
        destination: "/absences/missions/nouvelle?type=INTERVENTION_TERRAIN&univers=MISSIONS",
        permanent: false,
      },
      {
        source: "/absences/interventions",
        destination: "/absences/missions/demandes",
        permanent: false,
      },
      {
        source: "/dashboard/mon-equipe/demandes",
        destination: "/absences/validations",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
