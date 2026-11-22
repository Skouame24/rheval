// ============================================================
// features/portail/components/NotificationBell.tsx
// Bouton cloche du portail + panneau déroulant
// ============================================================

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { AppNotification } from "@/lib/api/notifications.api";
import type { NotificationsPortail } from "../hooks/usePortailNotifications";
import { NotificationsPanel } from "./NotificationsPanel";

export function NotificationBell({ notif }: { notif: NotificationsPortail }) {
  const [ouvert, setOuvert] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setOuvert(false);
    };
    const touche = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert]);

  const ouvrir = (n: AppNotification) => {
    notif.marquerLue(n);
    setOuvert(false);
    if (n.lien) router.push(n.lien);
  };

  return (
    <div ref={zoneRef} className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        aria-label={notif.nonLues > 0 ? `Notifications (${notif.nonLues} non lues)` : "Notifications"}
        aria-expanded={ouvert}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center transition-colors cursor-pointer",
          ouvert ? "bg-orange-50 text-agilly-primary" : "text-slate-500 hover:text-agilly-black hover:bg-slate-100",
        )}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {notif.nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-agilly-primary text-white text-[10px] font-extrabold ring-2 ring-white">
            {notif.nonLues > 99 ? "99+" : notif.nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-[68px] sm:top-12 sm:right-0 sm:w-[400px] z-50 bg-white border border-slate-200 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] animate-pop-in"
          style={{ transformOrigin: "top right" }}
        >
          <NotificationsPanel
            notifications={notif.notifications}
            chargement={notif.chargement}
            onOuvrir={ouvrir}
            onToutLire={notif.toutMarquerLu}
          />
        </div>
      )}
    </div>
  );
}
