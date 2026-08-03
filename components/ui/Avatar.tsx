// ============================================================
// components/ui/Avatar.tsx — IBM Carbon Style
// ============================================================

import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  nom: string;
  prenom: string;
  avatarUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  role?: string; 
  className?: string;
}

const sizeMap = {
  xs: { container: "w-6 h-6", text: "text-[9px]" },
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
  xl: { container: "w-16 h-16", text: "text-xl" },
};

const roleColors: Record<string, string> = {
  RH:     "bg-blue-600 text-white",
  N1:     "bg-green-600 text-white",
  N2:     "bg-purple-600 text-white",
  SALARIE:"bg-agilly-primary text-white",
  ADMIN:  "bg-red-600 text-white",
};

export function Avatar({ nom, prenom, avatarUrl, size = "md", role, className }: AvatarProps) {
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  const s = sizeMap[size];
  const roleClass = role ? roleColors[role] : "bg-agilly-black text-white";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${prenom} ${nom}`}
        className={cn("rounded-sm object-cover flex-shrink-0 border border-gray-200", s.container, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-sm flex items-center justify-center font-bold flex-shrink-0 select-none",
        s.container,
        s.text,
        roleClass,
        className
      )}
      title={`${prenom} ${nom}`}
    >
      {initiales}
    </div>
  );
}

// ─── Avatar + nom (pour les listes) ─────────────────────────

interface AvatarWithNameProps extends AvatarProps {
  poste?: string;
  reverse?: boolean;
}

export function AvatarWithName({ poste, reverse = false, ...props }: AvatarWithNameProps) {
  return (
    <div className={cn("flex items-center gap-3", reverse && "flex-row-reverse")}>
      <Avatar {...props} />
      <div className={cn(reverse && "text-right")}>
        <p className="text-sm font-semibold text-agilly-black m-0 leading-tight">
          {props.prenom} {props.nom}
        </p>
        {poste && (
          <p className="text-xs font-medium text-agilly-gray m-0 mt-0.5">
            {poste}
          </p>
        )}
      </div>
    </div>
  );
}
