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
  const meta = STATUT_METADATA[statut];
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
