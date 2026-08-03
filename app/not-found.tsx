// ============================================================
// app/not-found.tsx
// Page d'erreur 404 personnalisée AGILLY
// ============================================================

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-agilly-bg-alt flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-10 shadow-lg text-center border-t-4 border-agilly-primary">
        
        {/* Icône / Illustration */}
        <div className="mb-6 flex justify-center text-agilly-primary">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-agilly-black mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-agilly-black mb-4">Page introuvable</h2>
        
        <p className="text-agilly-gray text-sm mb-8">
          La page que vous recherchez n'existe plus ou a été déplacée lors de la récente refonte de l'application.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-agilly-primary hover:bg-[#E07A00] text-white px-6 py-3 font-medium transition-colors w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Retourner à l'accueil
        </Link>

      </div>
      
      {/* Footer minimaliste */}
      <div className="mt-8 text-xs text-gray-400 font-medium tracking-widest uppercase">
        Agilly RH Eval © {new Date().getFullYear()}
      </div>
    </div>
  );
}
