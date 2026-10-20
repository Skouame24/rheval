// ============================================================
// components/layout/Header.tsx
// ============================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_METADATA } from "@/lib/constants/roles";
import type { Role } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { detectRoleFromPoste } from "@/lib/utils/roleDetector";
import { notificationsApi, type AppNotification } from "@/lib/api";

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "À l'instant";
    if (diffSec < 3600) return `Il y a ${Math.max(1, Math.floor(diffSec / 60))} min`;
    if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)} h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

interface HeaderProps {
  role: Role;
  userName: string;
  pageTitle?: string;
  notifCount?: number;
}

export function Header({ role: initialRole, userName: initialUserName, pageTitle, notifCount = 0 }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const currentRole = user?.role || initialRole;
  const userName = user ? `${user.prenom} ${user.nom}` : initialUserName;
  const roleInfo = ROLE_METADATA[currentRole] || { labelCourt: currentRole };
  const detected = detectRoleFromPoste(user?.poste, user?.email);
  const isPdg =
    detected.displayRole === "PDG" ||
    (user?.poste || "").toLowerCase().includes("pdg") ||
    (user?.email || "").toLowerCase().includes("christian.bamba");
  const displayLabel =
    user?.poste?.toLowerCase().includes("assistante")
      ? "Assistante RH"
      : detected.displayRole === "PDG"
      ? "PDG"
      : detected.displayRole === "RESPONSABLE"
      ? "Responsable"
      : detected.displayRole === "DIRECTEUR"
      ? (user?.poste?.toLowerCase().includes("directrice") ? "Directrice" : "Directeur")
      : detected.displayRole === "STAGIAIRE"
      ? "Stagiaire"
      : roleInfo.labelCourt;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Boîte de notifications
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [headerNotifs, setHeaderNotifs] = useState<AppNotification[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchHeaderNotifs = useCallback(async () => {
    setIsNotifLoading(true);
    try {
      const list = await notificationsApi.getAll();
      setHeaderNotifs(list);
    } catch {
      setHeaderNotifs([]);
    } finally {
      setIsNotifLoading(false);
    }
  }, []);

  const toggleNotifBox = () => {
    if (!isNotifOpen) {
      fetchHeaderNotifs();
      setIsNotifOpen(true);
    } else {
      setIsNotifOpen(false);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.lu) {
      await notificationsApi.markAsRead(notif.id);
      setHeaderNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n)));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }
    }
    setIsNotifOpen(false);
    if (notif.lien) {
      router.push(notif.lien);
    }
  };

  const handleMarkAllHeaderAsRead = async () => {
    await notificationsApi.markAllAsRead();
    setHeaderNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pathname = usePathname();
  const notifHref = pathname?.startsWith("/dashboard/mon-equipe")
    ? "/dashboard/mon-equipe/notifications"
    : "/dashboard/mon-espace/notifications";

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 h-18 shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Gauche — Titre de Page & Bouton Switch Rapide de Rôle */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight m-0">
          {pageTitle || "AGILLY RHEVAL"}
        </h1>

        {/* Boutons de bascule rapide standardisés */}
        {currentRole === "DRH" && (
          <div className="flex items-center gap-2">
            {!pathname?.startsWith("/dashboard/pilotage-rh") && !pathname?.startsWith("/dashboard/personnel") && (
              <Link
                href="/dashboard/pilotage-rh"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFF7ED] text-[#F0822A] hover:bg-orange-100 border border-[#F0822A]/40 transition-all rounded-none shadow-2xs"
              >
                <span>⚙️ Pilotage RH</span>
              </Link>
            )}
            {!pathname?.startsWith("/dashboard/mon-equipe") && (
              <Link
                href="/dashboard/mon-equipe"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#F0822A] border border-slate-300 hover:border-[#F0822A] transition-all rounded-none shadow-2xs"
              >
                <span>👥 Tableau de bord Équipe</span>
              </Link>
            )}
            {!pathname?.startsWith("/dashboard/mon-espace") && (
              <Link
                href="/dashboard/mon-espace"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#F0822A] border border-slate-300 hover:border-[#F0822A] transition-all rounded-none shadow-2xs"
              >
                <span>👤 Mon Espace Salarié</span>
              </Link>
            )}
          </div>
        )}

        {currentRole === "RH" && (
          pathname?.startsWith("/dashboard/pilotage-rh") || pathname?.startsWith("/dashboard/personnel") ? (
            <Link
              href="/dashboard/mon-espace"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#F0822A] border border-slate-300 hover:border-[#F0822A] transition-all rounded-none shadow-2xs"
            >
              <span>👤 Mon Espace Salarié</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/pilotage-rh"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFF7ED] text-[#F0822A] hover:bg-orange-100 border border-[#F0822A]/40 transition-all rounded-none shadow-2xs"
            >
              <span>⚙️ Pilotage RH</span>
            </Link>
          )
        )}

        {currentRole === "N2" && (
          isPdg ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold bg-[#FFF7ED] text-[#F0822A] border border-[#F0822A]/40 rounded-none shadow-2xs">
                <span>👑 Direction Générale · Vue d'Ensemble</span>
              </span>
            </div>
          ) : (
            pathname?.startsWith("/dashboard/mon-equipe") ? (
              <Link
                href="/dashboard/mon-espace"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#F0822A] border border-slate-300 hover:border-[#F0822A] transition-all rounded-none shadow-2xs"
              >
                <span>👤 Mon Espace Salarié</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/mon-equipe"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFF7ED] text-[#F0822A] hover:bg-orange-100 border border-[#F0822A]/40 transition-all rounded-none shadow-2xs"
              >
                <span>👔 Tableau de bord Direction</span>
              </Link>
            )
          )
        )}

        {currentRole === "N1" && (
          pathname?.startsWith("/dashboard/mon-equipe") ? (
            <Link
              href="/dashboard/mon-espace"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-slate-700 hover:text-[#F0822A] border border-slate-300 hover:border-[#F0822A] transition-all rounded-none shadow-2xs"
            >
              <span>👤 Mon Espace Salarié</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/mon-equipe"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFF7ED] text-[#F0822A] hover:bg-orange-100 border border-[#F0822A]/40 transition-all rounded-none shadow-2xs"
            >
              <span>👥 Tableau de bord Équipe</span>
            </Link>
          )
        )}
      </div>





      {/* Droite — Cloche & Profil */}
      <div className="flex items-center gap-4">
        {/* Cloche de Notifications avec Boîte Déroulante */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifBox}
            className={`relative w-10 h-10 flex items-center justify-center transition-all rounded-none border cursor-pointer ${
              isNotifOpen
                ? "bg-slate-100 text-slate-900 border-[#F0822A]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200"
            }`}
            title="Boîte de notifications"
            aria-label="Boîte de notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white bg-[#F0822A] rounded-none shadow-sm">
                {notifCount}
              </span>
            )}
          </button>

          {/* Boîte de notifications déroulante */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 shadow-xl rounded-none z-50 flex flex-col overflow-hidden animate-fade-in">
              {/* En-tête de la boîte */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Boîte de notifications
                  </span>
                  {notifCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#F0822A] text-white">
                      {notifCount} non lue{notifCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {notifCount > 0 && (
                  <button
                    onClick={handleMarkAllHeaderAsRead}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 cursor-pointer underline"
                  >
                    Tout lire
                  </button>
                )}
              </div>

              {/* Corps / Liste des notifications */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {isNotifLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-medium">
                    <span className="w-4 h-4 border-2 border-[#F0822A] border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Chargement...
                  </div>
                ) : headerNotifs.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-2">
                      ✓
                    </div>
                    <p className="text-xs font-bold text-slate-800 m-0">Aucune notification</p>
                    <p className="text-[11px] text-slate-400 m-0 mt-0.5">Votre boîte est parfaitement à jour.</p>
                  </div>
                ) : (
                  headerNotifs.slice(0, 8).map((notif) => {
                    const isUnread = !notif.lu;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                          isUnread ? "bg-orange-50/40" : "bg-white"
                        }`}
                      >
                        {/* Indicateur ou icône */}
                        <div className="mt-0.5 shrink-0">
                          {notif.type === "ACTION" ? (
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] font-black">
                              ⚡
                            </span>
                          ) : notif.type === "VALIDATION" ? (
                            <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-700 text-[10px] font-black">
                              ✓
                            </span>
                          ) : notif.type === "ALERTE" ? (
                            <span className="w-6 h-6 flex items-center justify-center bg-rose-100 text-rose-700 text-[10px] font-black">
                              !
                            </span>
                          ) : (
                            <span className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-700 text-[10px] font-black">
                              i
                            </span>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs truncate m-0 ${isUnread ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
                              {notif.titre}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#F0822A] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 m-0 mt-0.5 leading-snug">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-slate-400 m-0 mt-1">
                            {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pied de la boîte */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  href={notifHref}
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-[#F0822A] hover:underline inline-flex items-center gap-1"
                >
                  <span>Accéder à toutes les notifications</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Ligne séparatrice */}
        <div className="w-px h-6 bg-slate-200" />

        {/* Profil Utilisateur avec Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none cursor-pointer p-1.5 -m-1.5 rounded-none hover:bg-slate-100 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-[#F0822A] uppercase tracking-wider mt-0.5">
                {displayLabel}
              </p>
            </div>

            <div className="w-10 h-10 flex items-center justify-center text-[#F0822A] text-sm font-extrabold bg-[#FFF7ED] border border-[#F0822A]/30 rounded-none hover:border-[#F0822A] transition-all">
              {userName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
            </div>
          </button>

          {/* Menu Déroulant */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-300 shadow-md rounded-none z-50 flex flex-col py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compte Connecté</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{userName}</p>
                <p className="text-xs text-slate-500">{user?.email || "utilisateur@agilly.com"}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold bg-[#FFF7ED] text-[#F0822A] border border-[#F0822A]/30">
                  Rôle actuel : {displayLabel}
                </div>
              </div>

              <div className="py-1 border-b border-slate-100">
                {(currentRole === "RH" || currentRole === "DRH") && (
                  <Link
                    href="/dashboard/pilotage-rh"
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#F0822A] hover:bg-orange-50 transition-colors"
                  >
                    <span>⚙️ Espace Pilotage RH</span>
                  </Link>
                )}
                {(currentRole === "N2") && (
                  <Link
                    href="/dashboard/mon-equipe"
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#F0822A] hover:bg-orange-50 transition-colors"
                  >
                    <span>👔 Espace Direction</span>
                  </Link>
                )}
                {(currentRole === "N1") && (
                  <Link
                    href="/dashboard/mon-equipe"
                    className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-[#F0822A] hover:bg-orange-50 transition-colors"
                  >
                    <span>👥 Mon Équipe (Collaborateurs)</span>
                  </Link>
                )}
                {(currentRole === "SALARIE" || currentRole === "N1" || currentRole === "N2" || currentRole === "RH" || currentRole === "DRH") && (
                  <Link
                    href="/dashboard/mon-espace"
                    className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>👤 Mon Espace Salarié</span>
                  </Link>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/mon-espace/profil"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#F0822A] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mon Profil
                </Link>
                <Link
                  href="/dashboard/mon-espace/parametres"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#F0822A] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Paramètres
                </Link>
              </div>

              <div className="py-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


