// ============================================================
// app/dashboard/admin/utilisateurs/page.tsx
// Page "Gestion Utilisateurs & Rôles" Admin
// Charte Agilly Bords Carrés (rounded-none)
// ============================================================

"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

const INITIAL_USERS = [
  { id: "u-1", nom: "KOUAME", prenom: "Ebenezer Samuel", email: "e.kouame@agilly.com", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "Aujourd'hui 14:22" },
  { id: "u-2", nom: "AKOUMIA", prenom: "Sevan", email: "s.akoumia@agilly.com", role: "N1", direction: "Executive", n1: "Alexis BAMBA", statut: "ACTIF", derniereConnexion: "Aujourd'hui 14:15" },
  { id: "u-3", nom: "BAMBA", prenom: "Koffi Alexis", email: "a.bamba@agilly.com", role: "N2", direction: "Technique", n1: "Direction Générale", statut: "ACTIF", derniereConnexion: "Hier 16:45" },
  { id: "u-4", nom: "KOUASSI", prenom: "Marie-Claire", email: "mc.kouassi@agilly.com", role: "DRH", direction: "Ressources Humaines", n1: "Direction Générale", statut: "ACTIF", derniereConnexion: "Aujourd'hui 11:30" },
  { id: "u-5", nom: "SYSTEM", prenom: "Admin AGILLY", email: "admin@agilly.com", role: "ADMIN", direction: "Informatique & Sécurité", n1: "Root", statut: "ACTIF", derniereConnexion: "En cours" },
  { id: "u-6", nom: "Koné", prenom: "Mariam", email: "m.kone@agilly.com", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "02/08/2026 10:14" },
  { id: "u-7", nom: "Bah", prenom: "Oumar", email: "o.bah@agilly.com", role: "SALARIE", direction: "Technique", n1: "Sevan AKOUMIA", statut: "ACTIF", derniereConnexion: "01/08/2026 18:00" },
];

export default function UtilisateursAdminPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("TOUT");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    nom: "", prenom: "", email: "", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA",
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom || !newUser.prenom || !newUser.email) return;
    const created = { id: `u-${Date.now()}`, ...newUser, statut: "ACTIF", derniereConnexion: "Jamais connecté" };
    setUsers([created, ...users]);
    setIsAddUserOpen(false);
    setNewUser({ nom: "", prenom: "", email: "", role: "SALARIE", direction: "Executive", n1: "Sevan AKOUMIA" });
  };

  const handleToggleStatut = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, statut: u.statut === "ACTIF" ? "SUSPENDU" : "ACTIF" } : u));
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = (u.prenom + " " + u.nom + " " + u.email + " " + u.direction).toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "TOUT" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppShell role="ADMIN" userName="Administrateur Système" userEmail="admin@agilly.com" notifCount={2}>
      <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto font-sans">
        
        {/* MODAL CRÉATION UTILISATEUR */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-none border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
              <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                <h3 className="text-base font-extrabold text-white m-0">Créer un Compte Utilisateur</h3>
                <button onClick={() => setIsAddUserOpen(false)} className="w-8 h-8 rounded-none border border-slate-700 bg-slate-800 text-white font-bold">✕</button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4 bg-[#F7F8FA]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Prénom *</label>
                    <input type="text" required value={newUser.prenom} onChange={e => setNewUser({ ...newUser, prenom: e.target.value })} className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Nom *</label>
                    <input type="text" required value={newUser.nom} onChange={e => setNewUser({ ...newUser, nom: e.target.value })} className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Email Pro *</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Rôle *</label>
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white">
                      <option value="SALARIE">Salarié</option>
                      <option value="N1">Manager N+1</option>
                      <option value="N2">Direction N+2</option>
                      <option value="RH">Pôle RH</option>
                      <option value="DRH">DRH</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Direction</label>
                    <input type="text" value={newUser.direction} onChange={e => setNewUser({ ...newUser, direction: e.target.value })} className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between">
                  <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-bold text-xs rounded-none">Annuler</button>
                  <button type="submit" className="px-5 py-2 bg-[#F0822A] text-white font-extrabold text-xs rounded-none">✓ Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <PageHeader
          title="Gestion des Utilisateurs & Rôles"
          subtitle="Contrôle des comptes d'accès, privilèges et affectations hiérarchiques AGILLY RHEVAL"
          breadcrumbs={[{ label: "Administration" }, { label: "Gestion Utilisateurs" }]}
        />

        {/* Barre d'Action & Recherche */}
        <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-4 border border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Rechercher utilisateur, email..."
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
            className="px-4 py-2.5 bg-[#F0822A] text-white font-extrabold text-xs rounded-none hover:bg-[#d97220] transition-colors cursor-pointer"
          >
            + Créer un Utilisateur
          </button>
        </div>

        {/* Tableau */}
        <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="p-3.5 font-extrabold">Utilisateur</th>
                <th className="p-3.5 font-extrabold">Email Pro</th>
                <th className="p-3.5 font-extrabold">Rôle Assigné</th>
                <th className="p-3.5 font-extrabold">Direction</th>
                <th className="p-3.5 font-extrabold">Manager N+1</th>
                <th className="p-3.5 font-extrabold">Statut</th>
                <th className="p-3.5 font-extrabold text-right">Actions Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
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
                    <span className="px-2.5 py-1 text-[10px] font-extrabold border bg-slate-100 text-slate-700 border-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{u.direction}</td>
                  <td className="p-3.5 font-bold text-[#F0822A]">{u.n1}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold border ${u.statut === "ACTIF" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                      ● {u.statut}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => alert(`Reset pass envoyé à ${u.email}`)} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold border border-slate-300 text-[11px]">🔑 Reset Pass</button>
                      <button onClick={() => handleToggleStatut(u.id)} className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px]">{u.statut === "ACTIF" ? "🚫 Suspendre" : "✓ Réactiver"}</button>
                    </div>
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
