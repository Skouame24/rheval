// ============================================================
// features/notifications/components/NotificationsView.tsx
// Centre de notifications dynamique Agilly RHEVAL
// ============================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notificationsApi, type AppNotification } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { CheckIcon, ClockIcon, CheckCircleIcon } from "@/components/ui/Icons";

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return `Hier à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`;
  }
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface NotificationsViewProps {
  title?: string;
  subtitle?: string;
}

export function NotificationsView({
  title = "Centre de notifications",
  subtitle = "Toutes vos alertes et activités relatives au cycle d'évaluation",
}: NotificationsViewProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ACTION">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (e) {
      console.error("Erreur chargement notifications:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.lu).length;
  }, [notifications]);

  const actionCount = useMemo(() => {
    return notifications.filter((n) => !n.lu && (n.type === "ACTION" || n.type === "VALIDATION")).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.lu);
    }
    if (activeTab === "ACTION") {
      return notifications.filter((n) => n.type === "ACTION" || n.type === "VALIDATION");
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAsRead = async (notif: AppNotification, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (notif.lu) return;

    setProcessingId(notif.id);
    try {
      await notificationsApi.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, lu: true } : n))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (err) {
      console.error("Erreur marquage notification:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (err) {
      console.error("Erreur marquage tout comme lu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async (notif: AppNotification) => {
    if (!notif.lu) {
      await handleMarkAsRead(notif);
    }
    if (notif.lien) {
      router.push(notif.lien);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barre de Filtres et Actions Rapides */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("UNREAD")}
            className={`px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "UNREAD"
                ? "bg-[#F0822A] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Non lues
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === "UNREAD" ? "bg-white text-[#F0822A]" : "bg-[#F0822A] text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("ACTION")}
            className={`px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "ACTION"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Actions requises
            {actionCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === "ACTION" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                }`}
              >
                {actionCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="text-xs font-semibold"
          >
            Rafraîchir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="text-xs font-semibold"
          >
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      {/* Liste des Notifications */}
      <Card padding="none" className="overflow-hidden bg-white border border-slate-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#F0822A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Chargement de vos notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
              <CheckCircleIcon size={28} />
            </div>
            <h4 className="text-base font-bold text-slate-900 m-0">
              {activeTab === "UNREAD" ? "Aucune notification non lue" : "Aucune notification"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {activeTab === "UNREAD"
                ? "Vous avez consulté toutes vos alertes récentes."
                : "Votre boîte de notification est vide pour le moment. Vous serez alerté dès qu'une action ou information sera disponible."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.lu;
              const hasLink = Boolean(notif.lien);

              return (
                <div
                  key={notif.id}
                  onClick={() => hasLink && handleNavigate(notif)}
                  className={`p-5 flex items-start gap-4 transition-all ${
                    hasLink ? "cursor-pointer hover:bg-slate-50/80" : ""
                  } ${isUnread ? "bg-amber-50/20 border-l-4 border-l-[#F0822A]" : "bg-white"}`}
                >
                  {/* Icône de type */}
                  <div className="shrink-0 mt-0.5">
                    {notif.type === "ACTION" && (
                      <div className="w-10 h-10 flex items-center justify-center bg-[#FFF0E0] text-[#F0822A] border border-[#F0822A33]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </div>
                    )}
                    {notif.type === "VALIDATION" && (
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
                        <CheckCircleIcon size={20} />
                      </div>
                    )}
                    {notif.type === "ALERTE" && (
                      <div className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                    )}
                    {notif.type === "INFO" && (
                      <div className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 border border-slate-200">
                        <ClockIcon size={20} />
                      </div>
                    )}
                  </div>

                  {/* Contenu textuel */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm m-0 ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                          {notif.titre}
                        </h4>
                        {/* Badge de Type */}
                        {notif.type === "ACTION" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FFF0E0] text-[#F0822A] border border-[#F0822A33]">
                            Action Requise
                          </span>
                        )}
                        {notif.type === "VALIDATION" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                            Validation
                          </span>
                        )}
                        {notif.type === "ALERTE" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200">
                            Alerte
                          </span>
                        )}
                        {notif.type === "INFO" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                            Info
                          </span>
                        )}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#F0822A]" title="Non lu" />
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1">
                      {notif.message}
                    </p>

                    {/* Actions de la notification */}
                    <div className="flex items-center gap-3 mt-3">
                      {hasLink && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(notif);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0822A] hover:underline"
                        >
                          Accéder au dossier
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif, e)}
                          disabled={processingId === notif.id}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <CheckIcon size={12} />
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
