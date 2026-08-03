// ============================================================
// app/dashboard/admin/audit/page.tsx
// Page "Journal d'Audit & Sécurité" Admin
// Charte Agilly Bords Carrés (rounded-none)
// ============================================================

"use client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

const AUDIT_LOGS = [
  { id: "log-1", date: "2026-08-03 14:25:12", utilisateur: "Sevan AKOUMIA (Manager N+1)", action: "SOUMISSION_OBJECTIFS", details: "Transmission des 3 objectifs de performance pour Ebenezer KOUAME", ip: "197.230.12.44", type: "Évaluation" },
  { id: "log-2", date: "2026-08-03 12:14:05", utilisateur: "Marie-Claire KOUASSI (DRH)", action: "ARBITRAGE_RH_VALIDE", details: "Arbitrage RH rendu pour le dossier Mariam Koné (Note finale: 16.0/20)", ip: "197.230.12.18", type: "Arbitrage" },
  { id: "log-3", date: "2026-08-03 11:02:30", utilisateur: "Admin AGILLY (SysAdmin)", action: "CHANGEMENT_ROLE", details: "Affectation du rôle DRH au compte mc.kouassi@agilly.com", ip: "197.230.12.1", type: "Sécurité" },
  { id: "log-4", date: "2026-08-03 09:45:00", utilisateur: "Koffi Alexis BAMBA (N+2)", action: "VALIDATION_N2", details: "Validation de la fiche d'évaluation de Oumar Bah", ip: "197.230.12.82", type: "Évaluation" },
  { id: "log-5", date: "2026-08-03 08:30:19", utilisateur: "Ebenezer KOUAME (Salarié)", action: "SIGNATURE_ELECTRONIQUE", details: "Signature de la fiche d'évaluation annuelle 2026", ip: "197.230.12.99", type: "Signature" },
  { id: "log-6", date: "2026-08-02 17:10:44", utilisateur: "Admin AGILLY (SysAdmin)", action: "OUVERTURE_CYCLE", details: "Lancement officiel de la Campagne Annuelle d'Évaluation 2026", ip: "197.230.12.1", type: "Système" },
];

export default function AuditAdminPage() {
  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com" notifCount={2}>
      <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto font-sans">
        <PageHeader
          title="Journal d'Audit & Traçabilité Sécurité"
          subtitle="Historique inaltérable et horodaté de toutes les actions enregistrées sur la plateforme AGILLY RHEVAL"
          breadcrumbs={[{ label: "Administration" }, { label: "Journal d'Audit" }]}
        />

        <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Journal d'Audit Système (Traçabilité légale & conformité)</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Enregistrement sécurisé des événements en temps réel</p>
          </div>
          <button
            onClick={() => alert("Exportation des logs au format CSV sécurisé en cours...")}
            className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-none cursor-pointer flex items-center gap-2"
          >
            📥 Exporter Registre CSV
          </button>
        </div>

        <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="p-3.5 font-extrabold">Horodatage (UTC)</th>
                <th className="p-3.5 font-extrabold">Utilisateur & Rôle</th>
                <th className="p-3.5 font-extrabold">Événement</th>
                <th className="p-3.5 font-extrabold">Détails de l'Opération</th>
                <th className="p-3.5 font-extrabold">Adresse IP</th>
                <th className="p-3.5 font-extrabold">Catégorie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{log.date}</td>
                  <td className="p-3.5 font-bold text-[#F0822A]">{log.utilisateur}</td>
                  <td className="p-3.5 font-bold text-slate-800">{log.action}</td>
                  <td className="p-3.5 font-sans text-slate-600">{log.details}</td>
                  <td className="p-3.5 text-slate-500">{log.ip}</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 font-bold text-[10px] text-slate-700">
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AppShell>
  );
}
