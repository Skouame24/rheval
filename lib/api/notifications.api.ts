// ============================================================
// lib/api/notifications.api.ts
// Service Notifications In-App & Workflow
// ============================================================

import { client } from "./client";

/** ?application=a,b — limite la requête à certaines applications */
function filtreApps(applications?: string[]): string {
  return applications && applications.length > 0 ? `?application=${encodeURIComponent(applications.join(","))}` : "";
}

export interface AppNotification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: "INFO" | "ACTION" | "VALIDATION" | "ALERTE";
  /** Application émettrice (rheval, absences, missions, caisse, portail) */
  application?: string;
  lu: boolean;
  lien?: string | null;
  ficheId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  /**
   * GET /api/notifications
   * Récupère la liste de toutes les notifications de l'utilisateur connecté.
   */
  getAll: async (applications?: string[]): Promise<AppNotification[]> => {
    try {
      const res = await client.get<any>(`/notifications${filtreApps(applications)}`);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.notifications)) return res.notifications;
      return [];
    } catch (err) {
      console.error("[notificationsApi.getAll] Erreur:", err);
      return [];
    }
  },

  /**
   * GET /api/notifications/unread-count
   * Récupère le nombre de notifications non lues.
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await client.get<any>("/notifications/unread-count");
      if (typeof res?.count === "number") return res.count;
      if (typeof res?.unreadCount === "number") return res.unreadCount;
      if (typeof res === "number") return res;
      return 0;
    } catch (err) {
      console.error("[notificationsApi.getUnreadCount] Erreur:", err);
      return 0;
    }
  },

  /**
   * PATCH /api/notifications/:id/read
   * Marque une notification spécifique comme lue.
   */
  markAsRead: async (id: string): Promise<AppNotification | null> => {
    try {
      return await client.patch<AppNotification>(`/notifications/${id}/read`, {});
    } catch (err) {
      console.error("[notificationsApi.markAsRead] Erreur:", err);
      return null;
    }
  },

  sendTestMail: async (to: string): Promise<any> => {
    return await client.post("/mail/test", { to });
  },

  /**
   * POST /api/notifications/read-all?application=…
   * Marque comme lues les notifications des applications indiquées
   * (toutes si aucune — à réserver à la cloche du portail).
   */
  markAllAsRead: async (applications?: string[]): Promise<number> => {
    try {
      const res = await client.post<{ success: boolean; count?: number }>(`/notifications/read-all${filtreApps(applications)}`, {});
      return res?.count ?? 0;
    } catch (err) {
      console.error("[notificationsApi.markAllAsRead] Erreur:", err);
      return 0;
    }
  },
};

