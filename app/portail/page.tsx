"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import { useRouter } from "next/navigation";

export default function PortailPage() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  // Sécurité si non connecté
  if (!user || !role) {
    return null;
  }

  const navigateToDashboard = () => {
    const dashboardRoute = ROLE_DASHBOARD[role];
    if (dashboardRoute) {
      router.push(dashboardRoute);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans flex flex-col">
      {/* ─── Header Portail ─── */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Agilly Logo" className="h-8 object-contain" />
          <span className="text-xl font-light text-agilly-black tracking-tight border-l pl-3 ml-2 border-gray-200">
            Portail <span className="font-bold">Espace Collaborateur</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-agilly-black m-0">{user.prenom} {user.nom}</p>
            <p className="text-xs text-agilly-gray m-0 uppercase tracking-widest">{user.role}</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-sm"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-agilly-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1000px] flex flex-col items-center text-center mb-12 mt-10">
          <h1 className="text-4xl md:text-5xl font-light text-agilly-black tracking-tight mb-4">
            Bonjour, <span className="font-bold text-agilly-primary">{user.prenom}</span>
          </h1>
          <p className="text-lg text-agilly-gray max-w-2xl">
            Bienvenue sur votre portail d'applications Agilly. Sélectionnez un service pour démarrer.
          </p>
        </div>

        {/* ─── Applications Grid ─── */}
        <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* RHEVAL - ACTIVE APP */}
          <button 
            onClick={navigateToDashboard}
            className="group relative flex flex-col bg-white border border-gray-200 hover:border-agilly-primary shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden rounded-sm cursor-pointer"
          >
            {/* Ligne d'accentuation en haut */}
            <div className="absolute top-0 left-0 w-full h-1 bg-agilly-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-[#FFF0E0] text-agilly-primary flex items-center justify-center rounded-sm mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="m9 15 2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-agilly-black mb-2">RHEVAL</h3>
              <p className="text-sm text-agilly-gray">
                Plateforme de gestion des évaluations annuelles et suivi des objectifs.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-[#FFF0E0]/30 transition-colors">
              <span className="text-sm font-bold text-agilly-primary">Ouvrir l'application</span>
              <svg className="text-agilly-primary transform group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </button>

          {/* CONGÉS & ABSENCES - INACTIVE APP */}
          <div className="relative flex flex-col bg-white border border-gray-200 opacity-60 grayscale-[50%] select-none cursor-not-allowed rounded-sm">
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 flex items-center justify-center rounded-sm mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-agilly-black mb-2 flex items-center gap-2">
                Congés & Absences
              </h3>
              <p className="text-sm text-gray-500">
                Planification des congés, arrêts maladie et suivi des soldes.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded-sm">Bientôt disponible</span>
            </div>
          </div>

          {/* NOTES DE FRAIS - INACTIVE APP */}
          <div className="relative flex flex-col bg-white border border-gray-200 opacity-60 grayscale-[50%] select-none cursor-not-allowed rounded-sm">
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 flex items-center justify-center rounded-sm mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M6 12h.01M18 12h.01"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-agilly-black mb-2 flex items-center gap-2">
                Notes de Frais
              </h3>
              <p className="text-sm text-gray-500">
                Déclaration de dépenses, indemnités kilométriques et validations.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded-sm">Bientôt disponible</span>
            </div>
          </div>

        </div>
      </main>
      
      {/* ─── Footer ─── */}
      <footer className="text-center py-6 text-xs text-agilly-gray uppercase tracking-widest border-t border-gray-200 bg-white">
        Agilly Group © {new Date().getFullYear()} — Portail des Applications
      </footer>
    </div>
  );
}
