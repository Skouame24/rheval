"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertTriangleIcon, ArrowPathIcon } from "@/components/ui/Icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-200/60">
          <AlertTriangleIcon size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Un problème est survenu
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Une erreur temporaire est survenue lors du chargement de cette section.
          Vous pouvez recharger la page ou réessayer immédiatement.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowPathIcon size={16} />}
            onClick={() => reset()}
          >
            Réessayer
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => window.location.reload()}
          >
            Actualiser la page
          </Button>
        </div>
      </div>
    </div>
  );
}

