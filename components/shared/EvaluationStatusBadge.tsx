// ============================================================
// components/shared/EvaluationStatusBadge.tsx
// Badge de statut d'évaluation — connecté à STATUT_METADATA
// ============================================================

import { Badge } from "@/components/ui";
import { STATUT_METADATA } from "@/lib/constants/statuts";
import type { StatutEvaluation } from "@/types";

interface EvaluationStatusBadgeProps {
  statut: StatutEvaluation;
  size?: "sm" | "md";
  dot?: boolean;
}

export function EvaluationStatusBadge({ statut, size = "md", dot = true }: EvaluationStatusBadgeProps) {
  const meta = STATUT_METADATA[statut] || {
    label: (statut as string) ? String(statut).replace(/_/g, " ").toLowerCase() : "Non démarré",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#CBD5E1",
  };

  return (
    <Badge
      label={meta.label}
      size={size}
      dot={dot}
      customColor={meta.color}
      customBg={meta.bg}
      customBorder={meta.border}
    />
  );
}
