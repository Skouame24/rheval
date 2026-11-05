// ============================================================
// features/absences/components/AbsencesTopBar.tsx
// Barre supérieure : titre de page + cloche de notifications dédiées absences + switch persona
// ============================================================

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAbsences } from "@/features/absences/context/AbsencesContext";
import { notificationsApi, AppNotification } from "@/lib/api/notifications.api";

const TITLES: [string, string][] = [
  ["/absences/demandes", "Mes demandes"],
  ["/absences/nouvelle", "Nouvelle demande"],
  ["/absences/validations", "À valider"],
  ["/absences/planning", "Agenda"],
  ["/absences/soldes", "Mes soldes"],
  ["/absences/workflows", "Circuits & Workflows RH"],
  ["/absences/registre", "Archives & GED"],
  ["/absences/rapports", "Rapports & SLA"],
];

const isAbsenceNotif = (n: AppNotification) =>
  Boolean(
    n.lien?.startsWith("/absences") ||
    n.lien?.includes("demandes") ||
    n.titre?.toLowerCase().includes("demande rh") ||
    n.titre?.toLowerCase().includes("congé") ||
    n.titre?.toLowerCase().includes("permission") ||
    n.titre?.toLowerCase().includes("ordre de mission") ||
    n.titre?.toLowerCase().includes("intervention")
  );

export function AbsencesTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentPersona, setCurrentPersona, allPersonas, pendingValidationsCount, isLoading, refreshDemandes } = useAbsences();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Boîte de notifications Absences
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [absenceNotifs, setAbsenceNotifs] = useState<AppNotification[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? "Accueil";

  const fetchAbsenceNotifs = useCallback(async () => {
    setIsNotifLoading(true);
    try {
      const list = await notificationsApi.getAll();
      const onlyAbsences = list.filter(isAbsenceNotif);
      setAbsenceNotifs(onlyAbsences);
    } catch {
      setAbsenceNotifs([]);
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbsenceNotifs();
  }, [fetchAbsenceNotifs]);

  const unreadCount = absenceNotifs.filter((n) => !n.lu).length;

  const toggleNotifBox = () => {
    if (!isNotifOpen) {
      fetchAbsenceNotifs();
      setIsNotifOpen(true);
    } else {
      setIsNotifOpen(false);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.lu) {
      await notificationsApi.markAsRead(notif.id);
      setAbsenceNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n)));
    }
    setIsNotifOpen(false);
    const targetLink = notif.lien?.startsWith("/absences") ? notif.lien : "/absences/demandes";
    router.push(targetLink);
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setAbsenceNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  // Fermeture des dropdowns au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 relative">
      {/* ── BARRE DE CHARGEMENT ANIMÉE UX (EN HAUT DU HEADER) ── */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-100 overflow-hidden z-30">
          <div className="h-full bg-[#F0822A] w-full origin-left animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C25E00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-none">
            <svg className="animate-spin h-2.5 w-2.5 text-[#F0822A]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Actualisation...
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* ── SÉLECTEUR DE COMPTE CONNECTÉ ── */}
        <div className="relative" ref={switcherRef}>
          <button
            type="button"
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs px-3 py-1.5 transition-all shadow-2xs cursor-pointer rounded-none"
            title="Profil actif"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-none">
              {currentPersona.prenom} {currentPersona.nom}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {currentPersona.labelRole}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`text-slate-400 transition-transform ${isSwitcherOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Menu Dropdown de sélection des acteurs */}
          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-white border border-slate-200 shadow-xl z-50 p-2 text-xs rounded-none">
              <div className="p-2 border-b border-orange-100 bg-gradient-to-r from-orange-50/60 to-white">
                <span className="text-[10px] font-black uppercase text-[#C25E00] tracking-wider block">
                  Direction Juridique & Conformité (Test Workflow)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Basculez de profil pour tester les circuits de validation
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-1">
                {allPersonas.map((p) => {
                  const isSelected = p.matricule === currentPersona.matricule;
                  return (
                    <button
                      key={p.matricule}
                      type="button"
                      onClick={() => {
                        setCurrentPersona(p);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full text-left p-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 border-l-2 border-[#F0822A]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className={`font-bold truncate ${isSelected ? "text-[#C25E00]" : "text-slate-900"}`}>
                          {p.prenom} {p.nom}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {p.poste || p.departement || "Collaborateur"} &bull; <strong className="font-mono">{p.matricule}</strong>
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 border shrink-0 ${
                        isSelected
                          ? "bg-[#F0822A] text-white border-[#F0822A]"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {p.labelRole}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bouton Rafraîchir */}
        <button
          type="button"
          onClick={() => refreshDemandes()}
          disabled={isLoading}
          className="text-slate-500 hover:text-slate-900 transition-colors p-1"
          title="Actualiser les demandes"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? "animate-spin text-[#F0822A]" : ""}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>

        {/* Bouton À valider si validations en attente */}
        {pendingValidationsCount > 0 && (
          <Link
            href="/absences/validations"
            className="text-xs font-bold text-[#C25E00] bg-orange-50 border border-orange-200 px-2.5 py-1 hover:bg-orange-100 transition-colors shadow-2xs whitespace-nowrap"
          >
            {pendingValidationsCount} à valider
          </Link>
        )}

        {/* ── CLOCHE DE NOTIFICATIONS DÉDIÉE ABSENCES & MISSIONS ── */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotifBox}
            className={`relative p-1.5 transition-colors cursor-pointer border ${
              isNotifOpen
                ? "bg-slate-100 text-slate-900 border-[#F0822A]"
                : "text-slate-500 hover:text-[#F0822A] border-transparent hover:border-slate-200"
            }`}
            title="Notifications Absences & Missions"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-[#F0822A] rounded-full shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Boîte déroulante des notifications Absences */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 shadow-xl z-50 flex flex-col overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Notifications Absences
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F0822A] text-white">
                      {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Tout lire
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {isNotifLoading ? (
                  <div className="p-6 text-center text-slate-400">Chargement...</div>
                ) : absenceNotifs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <span className="text-xl block mb-1">✓</span>
                    <span className="font-bold block">Aucune notification</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Toutes vos demandes sont à jour.
                    </span>
                  </div>
                ) : (
                  absenceNotifs.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer ${
                        !n.lu ? "bg-orange-50/50" : ""
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.lu ? "bg-[#F0822A]" : "bg-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`font-bold block text-xs truncate ${!n.lu ? "text-slate-900" : "text-slate-600"}`}>
                          {n.titre}
                        </span>
                        <p className="text-[11px] text-slate-600 m-0 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  href="/absences/demandes"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-[#F0822A] hover:underline"
                >
                  Voir toutes mes demandes &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar initiales */}
        <div
          className="w-8 h-8 bg-gradient-to-br from-[#F0822A] to-[#D96F1D] text-white text-xs font-black flex items-center justify-center shadow-xs border border-orange-200"
          title={`${currentPersona.prenom} ${currentPersona.nom}`}
        >
          {currentPersona.prenom.charAt(0)}
          {currentPersona.nom.charAt(0)}
        </div>
      </div>
    </header>
  );
}
