"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import { useRouter } from "next/navigation";

export default function PortailPage() {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F0822A] border-t-transparent animate-spin rounded-none" />
          <p className="text-sm font-bold text-slate-600">Chargement de votre session Microsoft Entra ID...</p>
        </div>
      </div>
    );
  }

  // Sécurité si non connecté
  if (!user || !role) {
    return null;
  }

  const navigateToDashboard = () => {
    const dashboardRoute = ROLE_DASHBOARD[role] || "/dashboard/mon-espace";
    router.push(dashboardRoute);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* ─── DÉCORATIONS D'ARRIÈRE-PLAN TECH & AGILLY BRAND ─── */}
      
      {/* 1. Grille de points IT Agilly */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />

      {/* 2. Halos Lumineux Flous (Glow Orbs) Orange Agilly & Bleu Enterprise */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#F0822A]/15 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[40%] -right-24 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-32 left-[20%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* 3. Cadres Géométriques Carrés Stricts (Charte Agilly Tech) */}
      <div className="absolute top-[12%] right-[10%] w-48 h-48 border border-[#F0822A]/20 rounded-none transform rotate-12 pointer-events-none z-0" />
      <div className="absolute bottom-[15%] left-[8%] w-64 h-64 border border-blue-400/20 rounded-none transform -rotate-12 pointer-events-none z-0" />
      <div className="absolute top-[45%] left-[5%] w-32 h-32 border border-slate-300 rounded-none transform rotate-45 pointer-events-none z-0 opacity-60" />

      {/* 4. Lignes Vectorielles Réseau & Data Interconnectées (SVG Network Lines) */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0 opacity-30">
        <path d="M -100,200 C 200,200 400,500 800,500 C 1200,500 1400,800 1800,800" fill="none" stroke="#F0822A" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M 0,600 C 300,600 600,250 1000,250 C 1400,250 1600,450 2000,450" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 4" />
        
        {/* Nodes Réseau IT */}
        <circle cx="400" cy="500" r="4" fill="#F0822A" />
        <circle cx="400" cy="500" r="12" fill="none" stroke="#F0822A" strokeWidth="1.5" opacity="0.6" />
        <circle cx="1000" cy="250" r="5" fill="#2563EB" />
        <circle cx="1000" cy="250" r="16" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
      </svg>

      {/* ─── Header Portail ─── */}
      <header className="h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Agilly Logo" className="h-9 object-contain" />
          <div className="border-l border-slate-200 pl-3 ml-2">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-none">
              PORTAIL <span className="text-[#F0822A]">AGILLY</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
              Espace Collaborateur Single Sign-On
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-extrabold text-slate-900 m-0">{user.prenom} {user.nom}</p>
            <span className="text-[10px] font-bold text-[#F0822A] uppercase tracking-widest bg-orange-50 px-2 py-0.5 border border-orange-200 inline-block mt-0.5">
              {user.role}
            </span>
          </div>
          <button 
            onClick={logout}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-none border border-rose-200 transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative z-10">
        
        {/* En-tête de bienvenue */}
        <div className="w-full max-w-[1000px] flex flex-col items-center text-center mb-12 mt-8">
          <span className="text-xs font-extrabold text-[#F0822A] uppercase tracking-widest bg-[#FFF7ED] px-3.5 py-1.5 border border-[#FFEDD5] inline-block mb-3 shadow-xs">
            ⚡ HUB APPLICATIF ENTERPRISE
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Bonjour, <span className="text-[#F0822A]">{user.prenom} {user.nom}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl font-medium m-0 leading-relaxed">
            Connecté avec <span className="font-bold text-slate-900">{user.email}</span> ({user.poste || user.role}). Sélectionnez un service ci-dessous :
          </p>
        </div>

        {/* ─── Applications Grid (Charte Bords Carrés rounded-none) ─── */}
        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* RHEVAL - APPLICATION DISPONIBLE */}
          <button 
            onClick={navigateToDashboard}
            className="group relative flex flex-col bg-white border border-slate-200 hover:border-[#F0822A] shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden rounded-none cursor-pointer border-t-4 border-t-[#F0822A]"
          >
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-[#FFF7ED] text-[#F0822A] flex items-center justify-center rounded-none mb-4 border border-[#FFEDD5] group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="m9 15 2 2 4-4"/>
                </svg>
              </div>
             
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-[#F0822A] transition-colors">AGILLY RHEVAL</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Plateforme officielle de gestion des évaluations annuelles de performance et suivi des objectifs.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between group-hover:bg-[#FFF7ED] transition-colors">
              <span className="text-xs font-extrabold text-[#F0822A]">Ouvrir RHEVAL →</span>
              <svg className="text-[#F0822A] transform group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </button>

          {/* ABSENCES & CONGÉS - EN DÉVELOPPEMENT */}
          <div className="relative flex flex-col bg-white/80 border border-slate-200/80 opacity-80 select-none rounded-none border-t-4 border-t-blue-500">
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-none mb-4 border border-blue-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Absences & Congés
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Planning des congés payés, arrêts maladie, autorisations d'absence et suivi du solde.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-slate-50 border-t border-slate-100">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-200/80 px-2 py-1 rounded-none border border-slate-300">
                ⚡ Bientôt disponible
              </span>
            </div>
          </div>

          {/* ÉVALUATION COMPÉTENCES - EN DÉVELOPPEMENT */}
          <div className="relative flex flex-col bg-white/80 border border-slate-200/80 opacity-80 select-none rounded-none border-t-4 border-t-purple-600">
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-none mb-4 border border-purple-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Évaluation Compétences
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Référentiel métier, cartographie des compétences clés (Hard & Soft Skills) et plans de carrière.
              </p>
            </div>
            
            <div className="mt-auto px-6 py-4 bg-slate-50 border-t border-slate-100">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-200/80 px-2 py-1 rounded-none border border-slate-300">
                ⚡ Bientôt disponible
              </span>
            </div>
          </div>


        </div>

      </main>
      
      {/* ─── Footer ─── */}
      <footer className="text-center py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-t border-slate-200 bg-white/90 relative z-10">
        AGILLY GROUP © {new Date().getFullYear()} — PORTAIL SSO DES APPLICATIONS D'ENTREPRISE
      </footer>
    </div>
  );
}
