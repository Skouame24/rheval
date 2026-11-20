// ============================================================
// features/portail/components/PersonAvatar.tsx
// Avatar doux (photo Microsoft 365 si dispo, sinon initiales teintées)
// ============================================================

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
};

interface Props {
  prenom: string;
  nom: string;
  photoUrl?: string;
  size?: keyof typeof TAILLES;
  className?: string;
}

export function PersonAvatar({ prenom, nom, photoUrl, size = "md", className }: Props) {
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  const teinte = TEINTES[(prenom.charCodeAt(0) + nom.charCodeAt(0)) % TEINTES.length];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`${prenom} ${nom}`}
        className={cn("object-cover shrink-0 border border-slate-200", TAILLES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold shrink-0 select-none border border-white ring-1 ring-slate-200/70",
        TAILLES[size],
        teinte,
        className,
      )}
      aria-label={`${prenom} ${nom}`}
    >
      {initiales}
    </div>
  );
}
