// ============================================================
// features/portail/hooks/usePortailNotifications.ts
// Toutes les notifications de l'écosystème, pour la cloche du portail
// et les badges des tuiles d'applications.
// ============================================================

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationsApi, type AppNotification } from "@/lib/api/notifications.api";
import { applicationDe, type ApplicationNotif } from "@/lib/utils/notificationScope";

const RAFRAICHISSEMENT_MS = 60_000;

export interface NotificationsPortail {
  notifications: AppNotification[];
  nonLues: number;
  /** Non lues par application : { rheval: 2, absences: 1 } */
  nonLuesParApp: Partial<Record<ApplicationNotif, number>>;
  chargement: boolean;
  marquerLue: (n: AppNotification) => Promise<void>;
  toutMarquerLu: () => Promise<void>;
  rafraichir: () => Promise<void>;
}

export function usePortailNotifications(): NotificationsPortail {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chargement, setChargement] = useState(true);

  const rafraichir = useCallback(async () => {
    const liste = await notificationsApi.getAll();
    setNotifications(liste);
    setChargement(false);
  }, []);

  useEffect(() => {
    let actif = true;
    const charger = () =>
      notificationsApi.getAll().then((liste) => {
        if (!actif) return;
        setNotifications(liste);
        setChargement(false);
      });
    charger();
    const t = setInterval(charger, RAFRAICHISSEMENT_MS);
    window.addEventListener("notifications-updated", charger);
    return () => {
      actif = false;
      clearInterval(t);
      window.removeEventListener("notifications-updated", charger);
    };
  }, []);

  const { nonLues, nonLuesParApp } = useMemo(() => {
    const parApp: Partial<Record<ApplicationNotif, number>> = {};
    let total = 0;
    for (const n of notifications) {
      if (n.lu) continue;
      total++;
      const app = applicationDe(n);
      parApp[app] = (parApp[app] ?? 0) + 1;
    }
    return { nonLues: total, nonLuesParApp: parApp };
  }, [notifications]);

  const marquerLue = useCallback(async (n: AppNotification) => {
    if (n.lu) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
    await notificationsApi.markAsRead(n.id);
  }, []);

  const toutMarquerLu = useCallback(async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, lu: true })));
    // Cloche du portail = vue globale : toutes les applications
    await notificationsApi.markAllAsRead();
  }, []);

  return { notifications, nonLues, nonLuesParApp, chargement, marquerLue, toutMarquerLu, rafraichir };
}
