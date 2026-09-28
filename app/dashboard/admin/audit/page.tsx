// ============================================================
// app/dashboard/admin/audit/page.tsx
// Page "Journal d'Audit & Sécurité" Admin — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { adminApi, type AuditLog } from "@/lib/api/admin.api";
import { Skeleton } from "@/components/ui";
import { ArrowPathIcon, CheckCircleIcon } from "@/components/ui/Icons";

export default function AuditAdminPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data || []);
    } catch (err: any) {
      console.error("[AuditAdminPage] Error fetching logs:", err);
      setError("Impossible de récupérer les événements d'audit.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com" notifCount={0}>
      <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto font-sans">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <PageHeader
            title="Journal d'Audit & Traçabilité Sécurité"
            subtitle={`${logs.length} événement(s) horodaté(s) dans la base PostgreSQL`}
            breadcrumbs={[{ label: "Administration" }, { label: "Journal d'Audit" }]}
          />

          <button
            onClick={fetchLogs}
            title="Rafraîchir"
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowPathIcon size={14} />
            Actualiser
          </button>
        </div>

        <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Journal d'Audit Système (Traçabilité légale & conformité)</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Enregistrement sécurisé des événements en temps réel</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-xs font-bold">
            ⚠️ {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center">
            <CheckCircleIcon size={36} color="#94A3B8" />
            <h4 className="text-base font-extrabold text-slate-800 mt-3 mb-1">Aucun événement d'audit</h4>
            <p className="text-xs text-slate-500 font-semibold m-0">
              Les actions effectuées sur les fiches d'évaluation et les comptes utilisateurs seront consignées ici.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-3.5 font-extrabold">Horodatage</th>
                  <th className="p-3.5 font-extrabold">Acteur</th>
                  <th className="p-3.5 font-extrabold">Événement</th>
                  <th className="p-3.5 font-extrabold">Cible</th>
                  <th className="p-3.5 font-extrabold">Détails</th>
                  <th className="p-3.5 font-extrabold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-3.5 font-bold text-[#F0822A]">{log.acteurNom}</td>
                    <td className="p-3.5 font-bold text-slate-800">{log.action}</td>
                    <td className="p-3.5 font-sans text-slate-600">{log.cible}</td>
                    <td className="p-3.5 font-sans text-slate-500">{log.nouvelleValeur || "-"}</td>
                    <td className="p-3.5 text-slate-400">{log.ipAdresse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
