import { DemandeRHItem } from "@/types/absences.types";

export function isMissionDemande(demande: Pick<DemandeRHItem, "typeDemande">) {
  return (
    demande.typeDemande === "MISSION_DEPLACEMENT" ||
    demande.typeDemande === "INTERVENTION_TERRAIN"
  );
}
