// ============================================================
// features/portail/components/PortailBackground.tsx
// Décor de fond du portail : grille de points, halos doux, cadres
// géométriques et lignes « réseau » (identité Agilly Tech)
// ============================================================

export function PortailBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-agilly-bg pointer-events-none">
      {/* Grille de points, estompée vers le bas */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      {/* Halos lumineux */}
      <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-agilly-primary/20 blur-[130px]" />
      <div className="absolute top-[30%] -right-40 w-[620px] h-[620px] rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="absolute -bottom-48 left-[25%] w-[560px] h-[560px] rounded-full bg-amber-400/15 blur-[140px]" />

      {/* Cadres géométriques carrés */}
      <div className="absolute top-[14%] right-[7%] w-44 h-44 border border-agilly-primary/20 rotate-12" />
      <div className="absolute top-[58%] left-[3%] w-56 h-56 border border-blue-400/15 -rotate-12" />
      <div className="absolute bottom-[10%] right-[18%] w-24 h-24 border border-slate-300/60 rotate-45" />

      {/* Lignes réseau */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-25">
        <path d="M -100,260 C 220,260 420,560 820,560 C 1220,560 1420,860 1820,860" fill="none" stroke="#F0822A" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M 0,700 C 300,700 620,300 1020,300 C 1420,300 1620,500 2020,500" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="420" cy="545" r="4" fill="#F0822A" />
        <circle cx="420" cy="545" r="12" fill="none" stroke="#F0822A" strokeWidth="1.5" opacity="0.6" />
        <circle cx="1020" cy="300" r="5" fill="#2563EB" />
        <circle cx="1020" cy="300" r="16" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
      </svg>
    </div>
  );
}
