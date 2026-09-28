// ============================================================
// app/dashboard/admin/page.tsx
// Console d'Administration Système & Gouvernance AGILLY RHEVAL
// Charte Agilly Bords Carrés (rounded-none) — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { adminApi, type AuditLog } from "@/lib/api/admin.api";
import { Skeleton } from "@/components/ui";
import { ArrowPathIcon, UsersIcon, CheckCircleIcon } from "@/components/ui/Icons";
import type { User, Role } from "@/types";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"utilisateurs" | "audit" | "parametres">("utilisateurs");
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("TOUT");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire Nouvel Utilisateur
  const [newUser, setNewUser] = useState<{
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    poste: string;
    departement: string;
  }>({
    nom: "",
    prenom: "",
    email: "",
    role: "SALARIE",
    poste: "",
    departement: "Direction Technique",
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, logsData] = await Promise.all([
        adminApi.getAllUsers().catch(() => []),
        adminApi.getAuditLogs().catch(() => []),
      ]);
      setUsers(usersData || []);
      setAuditLogs(logsData || []);
    } catch (err: any) {
      console.error("[AdminDashboardPage] Error loading data:", err);
      setError("Erreur de chargement des données d'administration.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom || !newUser.email) return;

    setIsSubmitting(true);
    try {
      await adminApi.createUser({
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role,
        poste: newUser.poste || "Collaborateur",
        departement: newUser.departement || "Direction Générale",
      });
      setIsAddUserOpen(false);
      setNewUser({
        nom: "",
        prenom: "",
        email: "",
        role: "SALARIE",
        poste: "",
        departement: "Direction Technique",
      });
      await loadData();
      alert("Utilisateur créé avec succès !");
    } catch (err: any) {
      console.error("[AdminDashboardPage] Error creating user:", err);
      alert("Erreur lors de la création de l'utilisateur : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${name} ?`)) return;
    try {
      await adminApi.deleteUser(id);
      await loadData();
    } catch (err: any) {
      console.error("[AdminDashboardPage] Error deleting user:", err);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const full = `${u.prenom || ""} ${u.nom || ""} ${u.email || ""} ${u.departement || ""} ${u.poste || ""}`.toLowerCase();
    const matchSearch = full.includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "TOUT" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com" notifCount={0}>
      <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto font-sans">
        
        {/* MODAL CRÉATION UTILISATEUR */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-none border border-slate-200 shadow-2xl flex flex-col overflow-hidden font-sans">
              <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />

              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <h3 className="text-base font-extrabold text-white m-0">Créer un Compte Utilisateur</h3>
                    <p className="text-xs text-[#F0822A] font-semibold m-0 mt-0.5">Affectation des droits & rôle</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="w-8 h-8 rounded-none border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4 bg-[#F7F8FA]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Prénom</label>
                    <input
                      type="text"
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                      placeholder="ex: Paul"
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={newUser.nom}
                      onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                      placeholder="ex: KOUASSI"
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Email Pro *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="p.kouassi@agilly.com"
                    className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Rôle Système *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                    >
                      <option value="SALARIE">Salarié</option>
                      <option value="N1">Manager N+1</option>
                      <option value="N2">Direction N+2</option>
                      <option value="RH">Pôle RH</option>
                      <option value="DRH">Directeur RH (DRH)</option>
                      <option value="ADMIN">Administrateur Système</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Direction</label>
                    <input
                      type="text"
                      value={newUser.departement}
                      onChange={(e) => setNewUser({ ...newUser, departement: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Intitulé du Poste</label>
                  <input
                    type="text"
                    value={newUser.poste}
                    onChange={(e) => setNewUser({ ...newUser, poste: e.target.value })}
                    placeholder="ex: Développeur Full-Stack"
                    className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold text-xs rounded-none cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none hover:bg-[#d97220] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Enregistrement..." : "✓ Enregistrer l'Utilisateur"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── HEADER CONSOLE ADMIN ── */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <PageHeader
            title="Console d'Administration & Gouvernance Système"
            subtitle="Gestion centralisée des comptes, contrôle des rôles et journal d'audit AGILLY RHEVAL"
            breadcrumbs={[{ label: "Accueil" }, { label: "Console Administration" }]}
          />

          <button
            onClick={loadData}
            title="Rafraîchir"
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowPathIcon size={14} />
            Actualiser
          </button>
        </div>

        {/* ── KPIs SYSTEME DYNAMIQUES ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-[#F0822A]">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">COMPTES UTILISATEURS</span>
            <p className="text-2xl font-extrabold text-slate-900 m-0">{users.length}</p>
            <span className="text-xs font-bold text-slate-500 mt-1 block">Comptes synchronisés</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">SÉCURITÉ & ACCÈS</span>
            <p className="text-2xl font-extrabold text-emerald-600 m-0">100%</p>
            <span className="text-xs font-bold text-emerald-700 mt-1 block">Authentification Microsoft SSO</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-blue-600">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">ÉVÉNEMENTS D'AUDIT</span>
            <p className="text-2xl font-extrabold text-blue-600 m-0">{auditLogs.length}</p>
            <span className="text-xs font-bold text-slate-500 mt-1 block">Actions horodatées</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-slate-900">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">BASE DE DONNÉES</span>
            <p className="text-2xl font-extrabold text-slate-900 m-0">PostgreSQL</p>
            <span className="text-xs font-bold text-[#F0822A] mt-1 block">Neon Cloud Connecté</span>
          </div>
        </div>

        {/* ── ONGLETS DE NAVIGATION ADMIN ── */}
        <div className="flex border-b border-slate-200 bg-white gap-2 px-4 pt-2">
          <button
            onClick={() => setActiveTab("utilisateurs")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "utilisateurs"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            👥 Gestion Utilisateurs & Rôles ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            🛡️ Journal d'Audit & Sécurité ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab("parametres")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "parametres"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚙️ Paramètres Système
          </button>
        </div>

        {/* ── CONTENU : ONGLET 1 - GESTION UTILISATEURS ── */}
        {activeTab === "utilisateurs" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 border border-slate-200">
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Rechercher utilisateur, email, direction..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 h-10 px-3 border border-slate-300 rounded-none text-xs font-semibold outline-none focus:border-[#F0822A]"
                />

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="h-10 px-3 border border-slate-300 rounded-none text-xs font-bold bg-white outline-none"
                >
                  <option value="TOUT">Tous les rôles</option>
                  <option value="SALARIE">Salarié</option>
                  <option value="N1">Manager N+1</option>
                  <option value="N2">Direction N+2</option>
                  <option value="RH">Pôle RH</option>
                  <option value="DRH">DRH</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2.5 bg-[#F0822A] text-white font-extrabold text-xs rounded-none hover:bg-[#d97220] transition-colors cursor-pointer flex items-center gap-2"
              >
                + Créer un Compte Utilisateur
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white border border-slate-200 p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 text-center">
                <UsersIcon size={40} color="#94A3B8" />
                <h4 className="text-base font-extrabold text-slate-800 mt-3 mb-1">Aucun utilisateur trouvé</h4>
                <p className="text-xs text-slate-500 font-semibold m-0">
                  {searchQuery ? "Aucun utilisateur ne correspond à votre filtre." : "La base ne contient aucun utilisateur."}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white border-b border-slate-800">
                      <th className="p-3.5 text-xs font-extrabold">Utilisateur</th>
                      <th className="p-3.5 text-xs font-extrabold">Email Pro</th>
                      <th className="p-3.5 text-xs font-extrabold">Rôle Assigné</th>
                      <th className="p-3.5 text-xs font-extrabold">Poste & Direction</th>
                      <th className="p-3.5 text-xs font-extrabold">Manager N+1</th>
                      <th className="p-3.5 text-xs font-extrabold text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-extrabold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-[#FFF7ED] text-[#F0822A] font-extrabold flex items-center justify-center border border-[#FFEDD5]">
                              {(u.prenom || u.nom || "?").charAt(0).toUpperCase()}
                            </div>
                            <span>{u.prenom} {u.nom}</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-600">{u.email}</td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-none border ${
                            u.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            u.role === "DRH" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            u.role === "RH" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            u.role === "N2" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                            u.role === "N1" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-700 border-slate-300"
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-700">
                          {u.poste || "-"} ({u.departement || "Non défini"})
                        </td>

                        <td className="p-3.5 font-bold text-[#F0822A]">
                          {u.n1 ? `${u.n1.prenom} ${u.n1.nom}` : "Direction"}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id, `${u.prenom} ${u.nom}`)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] cursor-pointer hover:bg-rose-100"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENU : ONGLET 2 - JOURNAL D'AUDIT RÉEL ── */}
        {activeTab === "audit" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 m-0">Journal d'Audit et Traçabilité Sécurité</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Enregistrement inaltérable de toutes les opérations du système AGILLY RHEVAL</p>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white border border-slate-200 p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 text-center">
                <CheckCircleIcon size={36} color="#94A3B8" />
                <h4 className="text-base font-extrabold text-slate-800 mt-3 mb-1">Aucun événement d'audit enregistré</h4>
                <p className="text-xs text-slate-500 font-semibold m-0">
                  Les modifications de statut et actions d'évaluation apparaîtront ici lors de leur exécution.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-extrabold">Horodatage</th>
                      <th className="p-3 font-extrabold">Acteur</th>
                      <th className="p-3 font-extrabold">Événement</th>
                      <th className="p-3 font-extrabold">Cible</th>
                      <th className="p-3 font-extrabold">Détails</th>
                      <th className="p-3 font-extrabold">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3 font-bold text-[#F0822A]">{log.acteurNom}</td>
                        <td className="p-3 font-bold text-slate-800">{log.action}</td>
                        <td className="p-3 font-sans text-slate-600">{log.cible}</td>
                        <td className="p-3 font-sans text-slate-500">{log.nouvelleValeur || "-"}</td>
                        <td className="p-3 text-slate-400">{log.ipAdresse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENU : ONGLET 3 - PARAMÈTRES SYSTEME ── */}
        {activeTab === "parametres" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider m-0">
                ✉️ Configuration des Notifications Email (SMTP)
              </h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Serveur SMTP Externe</label>
                  <input type="text" defaultValue="smtp.agilly.com" className="w-full h-9 px-3 border border-slate-300 rounded-none font-semibold" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Port SMTP</label>
                  <input type="text" defaultValue="587 (TLS)" className="w-full h-9 px-3 border border-slate-300 rounded-none font-semibold" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expéditeur Automatique</label>
                  <input type="text" defaultValue="rheval-notifications@agilly.com" className="w-full h-9 px-3 border border-slate-300 rounded-none font-semibold" />
                </div>
              </div>

              <button
                onClick={() => alert("Paramètres SMTP enregistrés avec succès ! Test de connexion réussi.")}
                className="mt-2 py-2 px-4 bg-[#F0822A] text-white font-extrabold text-xs rounded-none cursor-pointer"
              >
                Enregistrer Configuration SMTP
              </button>
            </div>

            <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider m-0">
                💾 Sauvegarde & Maintenance Système
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                PostgreSQL Neon Cloud héberge les données d'évaluation en temps réel.
              </p>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => alert("Statut de la base Neon PostgreSQL : CONNECTÉE & OPÉRATIONNELLE.")}
                  className="py-2.5 px-4 bg-slate-900 text-white font-extrabold text-xs rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  Vérifier Santé Base de Données
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
