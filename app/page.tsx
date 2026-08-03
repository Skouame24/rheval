// ============================================================
// app/page.tsx — Clone IBM Login (Authentic) adapté à la charte AGILLY
// ============================================================
"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row">

      {/* Panneau Gauche : Formulaire (40%) */}
      <div className="w-full md:w-[40%] flex flex-col p-8 md:p-12 lg:p-16 relative z-10 bg-white">

        {/* Logo / Marque */}
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-agilly-black tracking-tighter flex items-center gap-3">
              <img src="/logo.png" alt="Agilly Logo" className="h-10 object-contain" />
            </h1>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[400px]">
          <h2 className="text-[32px] font-light text-agilly-black tracking-tight leading-none mb-2">
            Portail Agilly
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Vous n'avez pas de compte ? <a href="#" className="text-agilly-primary hover:underline font-medium">Contactez la DRH</a>
          </p>

          <LoginForm />
        </div>

        <div className="mt-12">
          <p className="text-xs text-gray-500">
            Besoin d'aide ? <a href="#" className="text-agilly-primary hover:underline font-medium">Support IT Agilly</a>
          </p>
        </div>
      </div>

      {/* Panneau Droit : Illustration Tech IT sur fond Orange Agilly (60%) */}
      <div className="hidden md:flex md:w-[60%] bg-agilly-primary relative overflow-hidden items-center justify-center">

        {/* Grille de points subtile blanche */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.2)_1.5px,transparent_1.5px)] [background-size:32px_32px]" />

        {/* Lignes de connexions IT (Réseau, Data) */}
        <svg width="100%" height="100%" className="absolute inset-0 z-0">
          <path d="M 0,200 C 300,200 400,400 600,400 C 800,400 800,700 1000,700" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M -100,600 C 200,600 300,300 500,300 C 700,300 700,500 1000,500" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

          <line x1="300" y1="0" x2="300" y2="800" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="700" y1="0" x2="700" y2="800" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="6 6" />

          {/* Nodes réseau */}
          <circle cx="300" cy="300" r="8" fill="white" />
          <circle cx="300" cy="300" r="16" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />

          <circle cx="700" cy="500" r="8" fill="white" />
          <circle cx="700" cy="500" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />

          <circle cx="500" cy="300" r="6" fill="white" />
          <circle cx="600" cy="400" r="6" fill="white" />
        </svg>

        {/* Typographie / Message sur le fond orange */}
        <div className="relative z-10 p-16 max-w-2xl mt-32 mr-auto ml-12">
          <h2 className="text-5xl font-light text-white leading-tight mb-6">
            L'écosystème digital centralisé du groupe Agilly.
          </h2>
          <p className="text-xl text-white/80 font-light max-w-lg">
            Accédez à l'ensemble de votre écosystème d'applications d'entreprise, synchronisé en temps réel via Microsoft Graph.
          </p>
        </div>

        {/* Éléments abstraits (carrés stricts) pour donner un côté "Tech" */}
        <div className="absolute top-[10%] right-[15%] w-32 h-32 border border-white/20 rounded-none transform rotate-12" />
        <div className="absolute bottom-[20%] right-[25%] w-48 h-48 border border-white/20 rounded-none transform rotate-45" />
        <div className="absolute top-[50%] right-[-5%] w-64 h-64 border-2 border-white/10 rounded-none transform rotate-12" />
      </div>

    </div>
  );
}
