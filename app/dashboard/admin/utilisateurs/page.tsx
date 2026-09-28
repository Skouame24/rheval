// ============================================================
// app/dashboard/admin/utilisateurs/page.tsx
// Page "Gestion Utilisateurs & Rôles" Admin — 100% Données Réelles
// ============================================================

"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { adminApi } from "@/lib/api/admin.api";
import { Skeleton } from "@/components/ui";
import { ArrowPathIcon, UsersIcon } from "@/components/ui/Icons";
import type { User, Role } from "@/types";

export default function UtilisateursAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("TOUT");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data || []);
    } catch (err: any) {
      console.error("[UtilisateursAdminPage] Error fetching users:", err);
      setError("Impossible de charger les utilisateurs du système.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      await fetchUsers();
      alert("Utilisateur créé avec succès !");
    } catch (err: any) {
      console.error("[UtilisateursAdminPage] Error creating user:", err);
      alert("Erreur lors de la création de l'utilisateur : " + (err.message || "Erreur serveur"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${name} ?`)) return;
    try {
      await adminApi.deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      console.error("[UtilisateursAdminPage] Error deleting user:", err);
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
      <div className="flex flex-col gap-6 pb-10 max-w-[1400px] mx-auto font-sans">
        
        {/* MODAL CRÉATION UTILISATEUR */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-none border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
              <div className="h-1.5 w-full bg-[#F0822A] shrink-0" />
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
                <h3 className="text-base font-extrabold text-white m-0">Créer un Compte Utilisateur</h3>
                <button onClick={() => setIsAddUserOpen(false)} className="w-8 h-8 rounded-none border border-slate-700 bg-slate-800 text-white font-bold cursor-pointer">✕</button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4 bg-[#F7F8FA]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Prénom</label>
                    <input 
                      type="text" 
                      value={newUser.prenom} 
                      onChange={e => setNewUser({ ...newUser, prenom: e.target.value })} 
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none focus:border-[#F0822A]" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Nom *</label>
                    <input 
                      type="text" 
                      required 
                      value={newUser.nom} 
                      onChange={e => setNewUser({ ...newUser, nom: e.target.value })} 
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none focus:border-[#F0822A]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Email Pro *</label>
                  <input 
                    type="email" 
                    required 
                    value={newUser.email} 
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                    className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none focus:border-[#F0822A]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Rôle *</label>
                    <select 
                      value={newUser.role} 
                      onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })} 
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none"
                    >
                      <option value="SALARIE">Salarié</option>
                      <option value="N1">Manager N+1</option>
                      <option value="N2">Direction N+2</option>
                      <option value="RH">Pôle RH</option>
                      <option value="DRH">DRH</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Poste</label>
                    <input 
                      type="text" 
                      value={newUser.poste} 
                      onChange={e => setNewUser({ ...newUser, poste: e.target.value })} 
                      placeholder="Ex: Développeur"
                      className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none focus:border-[#F0822A]" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Département / Direction</label>
                  <input 
                    type="text" 
                    value={newUser.departement} 
                    onChange={e => setNewUser({ ...newUser, departement: e.target.value })} 
                    className="w-full h-10 px-3 border border-slate-300 rounded-none text-sm bg-white outline-none focus:border-[#F0822A]" 
                  />
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between">
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
                    className="px-5 py-2 bg-[#F0822A] hover:bg-[#d97220] text-white font-extrabold text-xs rounded-none cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Enregistrement..." : "✓ Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center flex-wrap gap-4">
          <PageHeader
            title="Gestion des Utilisateurs & Rôles"
            subtitle={`${users.length} compte(s) enregistré(s) dans la base PostgreSQL`}
            breadcrumbs={[{ label: "Administration" }, { label: "Gestion Utilisateurs" }]}
          />

          <button
            onClick={fetchUsers}
            title="Rafraîchir"
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowPathIcon size={14} />
            Actualiser
          </button>
        </div>

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

        {/* Chargement */}
        {isLoading && (
          <div className="bg-white border border-slate-200 p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Liste Vide */}
        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="bg-white border border-slate-200 p-12 text-center">
            <UsersIcon size={40} color="#94A3B8" />
            <h4 className="text-base font-extrabold text-slate-800 mt-3 mb-1">Aucun utilisateur trouvé</h4>
            <p className="text-xs text-slate-500 font-semibold m-0">
              {searchQuery ? "Aucun utilisateur ne correspond à votre filtre de recherche." : "Aucun utilisateur dans la base de données."}
            </p>
          </div>
        )}

        {/* Tableau */}
        {!isLoading && !error && filteredUsers.length > 0 && (
          <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-3.5 font-extrabold">Utilisateur</th>
                  <th className="p-3.5 font-extrabold">Email Pro</th>
                  <th className="p-3.5 font-extrabold">Rôle Assigné</th>
                  <th className="p-3.5 font-extrabold">Poste & Direction</th>
                  <th className="p-3.5 font-extrabold">Manager N+1</th>
                  <th className="p-3.5 font-extrabold text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
                      <span className="px-2.5 py-1 text-[10px] font-extrabold border bg-slate-100 text-slate-700 border-slate-300">
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
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDeleteUser(u.id, `${u.prenom} ${u.nom}`)} 
                          className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] cursor-pointer hover:bg-rose-100"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
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
