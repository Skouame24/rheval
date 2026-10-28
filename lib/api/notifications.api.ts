// ============================================================
// lib/api/notifications.api.ts
// Service Notifications In-App & Workflow
// ============================================================

import { client } from "./client";

export interface AppNotification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: "INFO" | "ACTION" | "VALIDATION" | "ALERTE";
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
  getAll: async (): Promise<AppNotification[]> => {
    try {
      const res = await client.get<any>("/notifications");
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

  /**
   * POST /api/notifications/read-all
   * Marque toutes les notifications comme lues.
   */
  sendTestMail: async (to: string): Promise<any> => {
    return await client.post("/mail/test", { to });
  },

  markAllAsRead: async (): Promise<number> => {
    try {
      const res = await client.post<{ success: boolean; count?: number }>("/notifications/read-all", {});
      return res?.count ?? 0;
    } catch (err) {
      console.error("[notificationsApi.markAllAsRead] Erreur:", err);
      return 0;
    }
  },
};

