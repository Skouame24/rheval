// ============================================================
// app/layout.tsx — Layout racine avec AuthProvider
// ============================================================

import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGILLY RHEVAL | Gestion des Évaluations",
  description: "Plateforme digitale de gestion des cycles d'évaluation de performance des salariés AGILLY.",
  keywords: "AGILLY, évaluation, performance, RH, ressources humaines",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
