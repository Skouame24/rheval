// ============================================================
// features/portail/components/PortailFooter.tsx
// ============================================================

export function PortailFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Agilly" className="h-6 object-contain opacity-80" />
          <span className="text-xs font-semibold text-slate-400">© {new Date().getFullYear()} Agilly — Portail collaborateur</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="w-1.5 h-1.5 bg-emerald-500" /> Connexion sécurisée Microsoft
        </span>
      </div>
    </footer>
  );
}
