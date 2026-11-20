// ============================================================
// features/portail/components/PersonModal.tsx
// Fiche collaborateur (trombinoscope)
// ============================================================

"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { couleurDirection, libelleCourt } from "../data/directions";
import type { Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { ChatIcon, MailIcon, PhoneIcon } from "./PortailIcons";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

interface Props {
  personne: Collaborateur | null;
  onClose: () => void;
}

export function PersonModal({ personne, onClose }: Props) {
  useEffect(() => {
    if (!personne) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [personne, onClose]);

  if (!personne) return null;

  const c = couleurDirection(personne.direction);
  const arrivee = personne.dateArrivee
    ? new Date(personne.dateArrivee).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  const infos: { label: string; valeur: string }[] = [
    { label: "E-mail", valeur: personne.email },
    ...(personne.telephone ? [{ label: "Téléphone", valeur: personne.telephone }] : []),
    ...(personne.manager ? [{ label: "Responsable", valeur: personne.manager }] : []),
    ...(personne.bureau ? [{ label: "Bureau", valeur: personne.bureau }] : []),
    ...(arrivee ? [{ label: "Chez Agilly depuis", valeur: arrivee }] : []),
    ...(personne.anniversaire
      ? [{ label: "Anniversaire", valeur: `${personne.anniversaire.jour} ${MOIS[personne.anniversaire.mois - 1]}` }]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-agilly-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Fiche de ${personne.prenom} ${personne.nom}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Bandeau */}
        <div className={cn("relative h-32 bg-gradient-to-br", c.gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 border-2 border-white/70 rotate-12" />
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-slate-600 text-lg font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-7 pb-7">
          <div className="-mt-14 relative">
            <PersonAvatar
              prenom={personne.prenom}
              nom={personne.nom}
              photoUrl={personne.photoUrl}
              size="xl"
              teinte={cn(c.soft, c.text)}
              className="w-28 h-28 text-3xl ring-4 ring-white shadow-lg"
            />
          </div>

          <h3 className="mt-4 text-2xl font-extrabold text-agilly-black tracking-tight">
            {personne.prenom} {personne.nom}
          </h3>
          {personne.poste && <p className="text-sm font-semibold text-agilly-gray mt-0.5">{personne.poste}</p>}
          <span className={cn("inline-flex items-center gap-1.5 mt-3 text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 border", c.soft, c.softBorder, c.text)}>
            <span className={cn("w-1.5 h-1.5", c.dot)} />
            {libelleCourt(personne.direction)}
          </span>

          <div className={cn("grid gap-2 mt-6", personne.telephone ? "grid-cols-3" : "grid-cols-2")}>
            <a
              href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(personne.email)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 bg-agilly-primary text-white text-xs font-bold hover:bg-agilly-primary-hover transition-colors"
            >
              <ChatIcon size={18} /> Teams
            </a>
            <a
              href={`mailto:${personne.email}`}
              className="flex flex-col items-center gap-1.5 py-3 bg-slate-50 border border-slate-200 text-agilly-black text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              <MailIcon size={18} /> E-mail
            </a>
            {personne.telephone && (
              <a
                href={`tel:${personne.telephone.replace(/\s/g, "")}`}
                className="flex flex-col items-center gap-1.5 py-3 bg-slate-50 border border-slate-200 text-agilly-black text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                <PhoneIcon size={18} /> Appeler
              </a>
            )}
          </div>

          <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100 text-sm">
            {infos.map((i) => (
              <div key={i.label} className="flex justify-between gap-4 py-3">
                <dt className="text-agilly-gray font-medium shrink-0">{i.label}</dt>
                <dd className="text-agilly-black font-semibold text-right break-all">{i.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
