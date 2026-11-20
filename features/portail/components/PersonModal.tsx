// ============================================================
// features/portail/components/PersonModal.tsx
// Fiche collaborateur (trombinoscope)
// ============================================================

"use client";

import { Modal } from "@/components/ui";
import type { Collaborateur } from "../data/portail.mock";
import { PersonAvatar } from "./PersonAvatar";
import { ChatIcon, MailIcon, PhoneIcon } from "./PortailIcons";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

interface Props {
  personne: Collaborateur | null;
  onClose: () => void;
}

export function PersonModal({ personne, onClose }: Props) {
  if (!personne) return null;

  const arrivee = new Date(personne.dateArrivee).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <Modal isOpen={!!personne} onClose={onClose} title="Fiche collaborateur" size="md">
      <div className="flex flex-col items-center text-center pt-2">
        <PersonAvatar prenom={personne.prenom} nom={personne.nom} size="xl" />
        <h3 className="mt-4 text-xl font-extrabold text-agilly-black">
          {personne.prenom} {personne.nom}
        </h3>
        <p className="text-sm font-semibold text-agilly-primary mt-0.5">{personne.poste}</p>
        <p className="text-xs font-medium text-agilly-gray mt-1">{personne.direction}</p>

        <div className="flex gap-2 mt-5">
          <a
            href={`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(personne.email)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-soft-primary gap-2"
          >
            <ChatIcon size={16} /> Teams
          </a>
          <a href={`mailto:${personne.email}`} className="btn-soft-secondary gap-2">
            <MailIcon size={16} /> E-mail
          </a>
        </div>
      </div>

      <dl className="mt-6 border-t border-slate-100 divide-y divide-slate-100 text-sm">
        <Ligne label="E-mail" valeur={personne.email} />
        {personne.telephone && (
          <Ligne label="Téléphone" valeur={<span className="inline-flex items-center gap-1.5"><PhoneIcon size={13} />{personne.telephone}</span>} />
        )}
        {personne.manager && <Ligne label="Responsable" valeur={personne.manager} />}
        <Ligne label="Chez Agilly depuis" valeur={arrivee} />
        <Ligne label="Anniversaire" valeur={`${personne.anniversaire.jour} ${MOIS[personne.anniversaire.mois - 1]}`} />
      </dl>
    </Modal>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-agilly-gray font-medium">{label}</dt>
      <dd className="text-agilly-black font-semibold text-right break-all">{valeur}</dd>
    </div>
  );
}
