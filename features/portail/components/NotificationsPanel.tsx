// ============================================================
// features/portail/components/NotificationsPanel.tsx
// Cloche du portail : toutes les applications, filtrables par onglet
// ============================================================

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { AppNotification } from "@/lib/api/notifications.api";
import { applicationDe, type ApplicationNotif } from "@/lib/utils/notificationScope";
import { NOTIF_APPS, ORDRE_APPS } from "../data/notifApps";

function depuis(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "Hier";
  if (j < 7) return `Il y a ${j} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface Props {
  notifications: AppNotification[];
  chargement: boolean;
  onOuvrir: (n: AppNotification) => void;
  onToutLire: () => void;
}

export function NotificationsPanel({ notifications, chargement, onOuvrir, onToutLire }: Props) {
  const [onglet, setOnglet] = useState<"toutes" | ApplicationNotif>("toutes");

  const appsPresentes = useMemo(() => {
    const presentes = new Set(notifications.map(applicationDe));
    return ORDRE_APPS.filter((a) => presentes.has(a));
  }, [notifications]);

  const nonLuesPar = (app: "toutes" | ApplicationNotif) =>
    notifications.filter((n) => !n.lu && (app === "toutes" || applicationDe(n) === app)).length;

  const liste = onglet === "toutes" ? notifications : notifications.filter((n) => applicationDe(n) === onglet);
  const totalNonLues = nonLuesPar("toutes");

  return (
    <div className="flex flex-col max-h-[min(560px,calc(100vh-6rem))]">
      {/* En-tête */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-[15px] font-extrabold text-agilly-black">Notifications</p>
          <p className="text-xs text-agilly-gray">
            {totalNonLues > 0 ? `${totalNonLues} non lue${totalNonLues > 1 ? "s" : ""}` : "Vous êtes à jour"}
          </p>
        </div>
        {totalNonLues > 0 && (
          <button onClick={onToutLire} className="text-xs font-bold text-agilly-primary hover:text-agilly-primary-hover cursor-pointer">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Onglets par application */}
      {appsPresentes.length > 1 && (
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto border-b border-slate-100">
          {(["toutes", ...appsPresentes] as const).map((a) => {
            const actif = onglet === a;
            const n = nonLuesPar(a);
            return (
              <button
                key={a}
                onClick={() => setOnglet(a)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer",
                  actif ? "bg-agilly-black text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {a !== "toutes" && <span className={cn("w-1.5 h-1.5", actif ? "bg-white" : NOTIF_APPS[a].dot)} />}
                {a === "toutes" ? "Toutes" : NOTIF_APPS[a].label}
                {n > 0 && <span className={cn("font-semibold", actif ? "text-white/60" : "text-slate-400")}>{n}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {chargement ? (
          <div className="p-5 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-1/3 animate-shimmer" />
                <div className="h-3.5 w-4/5 animate-shimmer" />
              </div>
            ))}
          </div>
        ) : liste.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-3xl">🔔</p>
            <p className="mt-2 text-sm font-bold text-agilly-black">Aucune notification</p>
            <p className="text-xs text-slate-400 mt-0.5">Vous serez prévenu ici dès qu&apos;une action vous concerne.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {liste.map((n) => {
              const app = NOTIF_APPS[applicationDe(n)];
              const action = n.type === "ACTION" || n.type === "VALIDATION";
              return (
                <li key={n.id}>
                  <button
                    onClick={() => onOuvrir(n)}
                    className={cn(
                      "relative w-full text-left px-5 py-3.5 transition-colors cursor-pointer",
                      n.lu ? "hover:bg-slate-50" : "bg-orange-50/40 hover:bg-orange-50/70",
                    )}
                  >
                    {!n.lu && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-agilly-primary" />}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5", app.soft, app.text)}>
                        <span className={cn("w-1.5 h-1.5", app.dot)} />
                        {app.label}
                      </span>
                      {action && !n.lu && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Action requise</span>
                      )}
                      <span className="ml-auto text-[11px] text-slate-400 whitespace-nowrap">{depuis(n.createdAt)}</span>
                    </div>
                    <p className={cn("text-[13px] leading-snug", n.lu ? "font-semibold text-slate-600" : "font-extrabold text-agilly-black")}>
                      {n.titre}
                    </p>
                    <p className="text-xs text-agilly-gray leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Réglages */}
      <Link
        href="/portail/preferences"
        className="px-5 py-3 border-t border-slate-100 text-xs font-semibold text-slate-500 hover:text-agilly-primary transition-colors"
      >
        ✉️ Choisir quand recevoir des e-mails
      </Link>
    </div>
  );
}
