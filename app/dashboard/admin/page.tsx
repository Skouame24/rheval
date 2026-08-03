// ============================================================
// app/dashboard/admin/page.tsx
// Console d'Administration Système & Gouvernance AGILLY RHEVAL
// Charte Agilly Bords Carrés (rounded-none)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import {
  UsersIcon,
  CheckCircleIcon,
  ScaleIcon,
  GridIcon,
  ListIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@/components/ui/Icons";

// ─── Données de démo Admin ─────────────────────────────────

const INITIAL_USERS = [
  { id: "u-1", nom: "KOUAME", prenom: "Ebenezer Samuel", email: "e.kouame@agilly.com", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "Aujourd'hui 14:22" },
  { id: "u-2", nom: "AKOUMIA", prenom: "Sevan", email: "s.akoumia@agilly.com", role: "N1", direction: "Executive", n1: "Alexis BAMBA", statut: "ACTIF", derniereConnexion: "Aujourd'hui 14:15" },
  { id: "u-3", nom: "BAMBA", prenom: "Koffi Alexis", email: "a.bamba@agilly.com", role: "N2", direction: "Technique", n1: "Direction Générale", statut: "ACTIF", derniereConnexion: "Hier 16:45" },
  { id: "u-4", nom: "KOUASSI", prenom: "Marie-Claire", email: "mc.kouassi@agilly.com", role: "DRH", direction: "Ressources Humaines", n1: "Direction Générale", statut: "ACTIF", derniereConnexion: "Aujourd'hui 11:30" },
  { id: "u-5", nom: "SYSTEM", prenom: "Admin AGILLY", email: "admin@agilly.com", role: "ADMIN", direction: "Informatique & Sécurité", n1: "Root", statut: "ACTIF", derniereConnexion: "En cours" },
  { id: "u-6", nom: "Koné", prenom: "Mariam", email: "m.kone@agilly.com", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "02/08/2026 10:14" },
  { id: "u-[#]", nom: "Bah", prenom: "Oumar", email: "o.bah@agilly.com", role: "SALARIE", direction: "Technique", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "01/08/2026 18:00" },
];

const AUDIT_LOGS = [
  { id: "log-1", date: "2026-08-03 14:25:12", utilisateur: "Sevan AKOUMIA (Manager N+1)", action: "SOUMISSION_OBJECTIFS", details: "Transmission des 3 objectifs de performance pour Ebenezer KOUAME", ip: "197.230.12.44", type: "Évaluation" },
  { id: "log-2", date: "2026-08-03 12:14:05", utilisateur: "Marie-Claire KOUASSI (DRH)", action: "ARBITRAGE_RH_VALIDE", details: "Arbitrage RH rendu pour le dossier Mariam Koné (Note finale: 16.0/20)", ip: "197.230.12.18", type: "Arbitrage" },
  { id: "log-3", date: "2026-08-03 11:02:30", utilisateur: "Admin AGILLY (SysAdmin)", action: "CHANGEMENT_ROLE", details: "Affectation du rôle DRH au compte mc.kouassi@agilly.com", ip: "197.230.12.1", type: "Sécurité" },
  { id: "log-4", date: "2026-08-03 09:45:00", utilisateur: "Koffi Alexis BAMBA (N+2)", action: "VALIDATION_N2", details: "Validation de la fiche d'évaluation de Oumar Bah", ip: "197.230.12.82", type: "Évaluation" },
  { id: "log-5", date: "2026-08-03 08:30:19", utilisateur: "Ebenezer KOUAME (Salarié)", action: "SIGNATURE_ELECTRONIQUE", details: "Signature de la fiche d'évaluation annuelle 2026", ip: "197.230.12.99", type: "Signature" },
  { id: "log-6", date: "2026-08-02 17:10:44", utilisateur: "Admin AGILLY (SysAdmin)", action: "OUVERTURE_CYCLE", details: "Lancement officiel de la Campagne Annuelle d'Évaluation 2026", ip: "197.230.12.1", type: "Système" },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"utilisateurs" | "audit" | "parametres">("utilisateurs");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("TOUT");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Formulaire Nouvel Utilisateur
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "SALARIE",
    direction: "Executive",
    n1: "Sevan AKOUMIA",
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom || !newUser.prenom || !newUser.email) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const created = {
      id: `u-${Date.now()}`,
      ...newUser,
      statut: "ACTIF",
      derniereConnexion: "Jamais connecté",
    };
    setUsers((prev) => [created, ...prev]);
    setIsAddUserOpen(false);
    setNewUser({ nom: "", prenom: "", email: "", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA" });
    alert(`Le compte utilisateur de ${created.prenom} ${created.nom} a été créé avec succès !`);
  };

  const handleToggleStatut = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, statut: u.statut === "ACTIF" ? "SUSPENDU" : "ACTIF" } : u
      )
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = (u.prenom + " " + u.nom + " " + u.email + " " + u.direction)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "TOUT" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com" notifCount={2}>
      <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto">
        
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
                    <p className="text-xs text-[#F0822A] font-semibold m-0 mt-0.5">Affectation des droits & rattachement N+1</p>
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
                    <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
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
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                      value={newUser.direction}
                      onChange={(e) => setNewUser({ ...newUser, direction: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm font-semibold outline-none focus:border-[#F0822A] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600 uppercase block mb-1">Manager Supérieur N+1</label>
                  <input
                    type="text"
                    value={newUser.n1}
                    onChange={(e) => setNewUser({ ...newUser, n1: e.target.value })}
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
                    className="px-5 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none hover:bg-[#d97220] transition-colors cursor-pointer"
                  >
                    ✓ Enregistrer l'Utilisateur
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── HEADER CONSOLE ADMIN ── */}
        <PageHeader
          title="Console d'Administration & Gouvernance Système"
          subtitle="Gestion centralisée des comptes, contrôle des rôles, journal d'audit et sécurité AGILLY RHEVAL"
          breadcrumbs={[{ label: "Accueil" }, { label: "Console Administration" }]}
        />

        {/* ── KPIs SYSTEME ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-[#F0822A]">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">COMPTES ACTIFS</span>
            <p className="text-2xl font-extrabold text-slate-900 m-0">{users.length}</p>
            <span className="text-xs font-bold text-slate-500 mt-1 block">Salariés, Managers & RH</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">CONFORMITÉ SÉCURITÉ</span>
            <p className="text-2xl font-extrabold text-emerald-600 m-0">100%</p>
            <span className="text-xs font-bold text-emerald-700 mt-1 block">0 anomalie détectée</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-blue-600">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">JOURNAL AUDIT</span>
            <p className="text-2xl font-extrabold text-blue-600 m-0">{AUDIT_LOGS.length}</p>
            <span className="text-xs font-bold text-slate-500 mt-1 block">Événements traçés</span>
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-none shadow-sm border-l-4 border-l-slate-900">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">VERSION AGILLY</span>
            <p className="text-2xl font-extrabold text-slate-900 m-0">v2.4.0</p>
            <span className="text-xs font-bold text-[#F0822A] mt-1 block">Charte Bords Carrés Active</span>
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
            🛡️ Journal d'Audit & Sécurité ({AUDIT_LOGS.length})
          </button>

          <button
            onClick={() => setActiveTab("parametres")}
            className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "parametres"
                ? "border-[#F0822A] text-[#F0822A] bg-orange-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚙️ Paramètres Système & SMTP
          </button>
        </div>

        {/* ── CONTENU : ONGLET 1 - GESTION UTILISATEURS ── */}
        {activeTab === "utilisateurs" && (
          <div className="flex flex-col gap-6">
            {/* Barre d'action & Filtres */}
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

            {/* Tableau des utilisateurs */}
            <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800">
                    <th className="p-3.5 text-xs font-extrabold">Utilisateur</th>
                    <th className="p-3.5 text-xs font-extrabold">Email Pro</th>
                    <th className="p-3.5 text-xs font-extrabold">Rôle Assigné</th>
                    <th className="p-3.5 text-xs font-extrabold">Direction</th>
                    <th className="p-3.5 text-xs font-extrabold">Manager N+1</th>
                    <th className="p-3.5 text-xs font-extrabold">Statut</th>
                    <th className="p-3.5 text-xs font-extrabold text-right">Actions Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-[#FFF7ED] text-[#F0822A] font-extrabold flex items-center justify-center border border-[#FFEDD5]">
                            {u.prenom.charAt(0)}
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

                      <td className="p-3.5 font-semibold text-slate-700">{u.direction}</td>

                      <td className="p-3.5 font-bold text-[#F0822A]">{u.n1}</td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold border ${
                          u.statut === "ACTIF" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          ● {u.statut}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert(`Mot de passe réinitialisé pour ${u.email}. Un lien sécurisé a été envoyé.`)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold border border-slate-300 text-[11px] hover:bg-slate-200 cursor-pointer"
                          >
                            🔑 Reset Pass
                          </button>
                          <button
                            onClick={() => handleToggleStatut(u.id)}
                            className={`px-2.5 py-1 font-bold text-[11px] border cursor-pointer ${
                              u.statut === "ACTIF" ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {u.statut === "ACTIF" ? "🚫 Suspendre" : "✓ Réactiver"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CONTENU : ONGLET 2 - JOURNAL D'AUDIT ── */}
        {activeTab === "audit" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 m-0">Journal d'Audit et Traçabilité Sécurité (Horodaté)</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Enregistrement inaltérable de toutes les opérations du système AGILLY RHEVAL</p>
              </div>
              <button
                onClick={() => alert("Exportation du Registre d'Audit complet au format CSV sécurisé...")}
                className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-none cursor-pointer flex items-center gap-2"
              >
                📥 Exporter Logs CSV
              </button>
            </div>

            <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-3 font-extrabold">Horodatage (UTC)</th>
                    <th className="p-3 font-extrabold">Utilisateur & Rôle</th>
                    <th className="p-3 font-extrabold">Événement</th>
                    <th className="p-3 font-extrabold">Détails de l'Opération</th>
                    <th className="p-3 font-extrabold">Adresse IP</th>
                    <th className="p-3 font-extrabold">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.date}</td>
                      <td className="p-3 font-bold text-[#F0822A]">{log.utilisateur}</td>
                      <td className="p-3 font-bold text-slate-800">{log.action}</td>
                      <td className="p-3 font-sans text-slate-600">{log.details}</td>
                      <td className="p-3 text-slate-500">{log.ip}</td>
                      <td className="p-3 font-sans">
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
                💾 Sauvegarde & Restauration Système
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Effectuez une sauvegarde complète de la base de données PostgreSQL ou restaurez un snapshot antérieur de la campagne 2026.
              </p>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={() => alert("Génération du Dump PostgreSQL complet en cours... Fichier sauvegardé sur le serveur sécurisé.")}
                  className="py-2.5 px-4 bg-slate-900 text-white font-extrabold text-xs rounded-none cursor-pointer flex items-center justify-center gap-2"
                >
                  💾 Générer un Dump SQL Complet
                </button>
                <button
                  onClick={() => alert("Maintenance planifiée lancée : nettoyage du cache et optimisation des index.")}
                  className="py-2.5 px-4 bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs rounded-none hover:bg-slate-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  🧹 Optimiser Index & Purger Cache
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
