// ============================================================
// app/absences/layout.tsx
// Coque applicative commune pour Absences & Missions Agilly
// Sidebar 240px + Topbar 56px + Drawer Démo + AbsencesProvider
// ============================================================

import React from "react";
import { AbsencesProvider } from "@/features/absences/context/AbsencesContext";
import { AbsencesSidebar } from "@/features/absences/components/AbsencesSidebar";
import { AbsencesTopBar } from "@/features/absences/components/AbsencesTopBar";

export const metadata = {
  title: "Absences & Congés | Agilly Portails",
  description: "Plateforme officielle de dématérialisation et validation des absences Agilly",
};

export default function AbsencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbsencesProvider>
      <div className="min-h-screen bg-[#F4F5F7] flex flex-row font-sans text-slate-900 antialiased selection:bg-[#FFF4EB] selection:text-[#F0822A]">
        {/* Barre latérale fixe 240px */}
        <AbsencesSidebar />

        {/* Espace central de contenu */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barre supérieure fixe 56px */}
          <AbsencesTopBar />

          {/* Corps de la page */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AbsencesProvider>
  );
}

