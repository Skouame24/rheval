// ============================================================
// features/portail/components/PersonAvatar.tsx
// Avatar : photo Microsoft 365 si disponible, sinon initiales teintées
// ============================================================

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const TEINTES = [
  "bg-orange-50 text-agilly-primary",
  "bg-emerald-50 text-emerald-700",
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
  "bg-slate-100 text-slate-700",
];

const TAILLES = {
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-20 h-20 text-xl",
  xl: "w-24 h-24 text-2xl",
  full: "w-full h-full text-5xl",
};

interface Props {
  prenom: string;
  nom: string;
  photoUrl?: string;
  size?: keyof typeof TAILLES;
  className?: string;
  /** Classes de teinte imposées (sinon teinte dérivée du nom) */
  teinte?: string;
}

export function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "?";
}

export function PersonAvatar({ prenom, nom, photoUrl, size = "md", className, teinte }: Props) {
  const [photoKo, setPhotoKo] = useState(false);
  const couleur = teinte ?? TEINTES[((prenom.charCodeAt(0) || 0) + (nom.charCodeAt(0) || 0)) % TEINTES.length];

  if (photoUrl && !photoKo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${prenom} ${nom}`}
        loading="lazy"
        onError={() => setPhotoKo(true)}
        className={cn("object-cover shrink-0 bg-slate-100", TAILLES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center font-extrabold shrink-0 select-none tracking-tight", TAILLES[size], couleur, className)}
      aria-label={`${prenom} ${nom}`}
    >
      {initiales(prenom, nom)}
    </div>
  );
}
