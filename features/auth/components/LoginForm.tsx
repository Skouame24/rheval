"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_METADATA } from "@/lib/constants/roles";
import type { Role } from "@/types";

export function LoginForm() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [role,     setRole]     = useState<Role>("RH");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const demoEmail = `${role.toLowerCase()}.${email || "demo"}@agilly.com`;
      await login(demoEmail, password);
    } catch {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {/* ── Sélecteur de rôle (Ghost / Toggle Buttons Carbon) ── */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-agilly-black mb-3 tracking-wider uppercase">
          Profil de Démonstration
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROLE_METADATA) as Role[]).map((r) => {
            const active = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`
                  h-9 px-4 text-sm font-medium transition-colors border
                  ${active 
                    ? 'bg-[#FFF0E0] text-agilly-primary border-agilly-primary' 
                    : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {ROLE_METADATA[r].labelCourt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Champ Email ── */}
      <AgillyInput
        label="Adresse email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="prenom.nom@agilly.com"
      />

      {/* ── Champ Mot de passe ── */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <label className="text-sm font-medium text-agilly-black">Mot de passe</label>
          <button
            type="button"
            className="text-sm text-agilly-primary hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <AgillyInput
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="bg-transparent border-none cursor-pointer text-gray-500 hover:text-agilly-black p-0 flex items-center"
            >
              {showPwd ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          }
        />
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Bouton submit ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-agilly-primary hover:bg-[#E07A00] text-white text-sm font-medium transition-colors disabled:opacity-50 mt-6 flex items-center justify-between px-5"
      >
        <span>{loading ? "Connexion en cours..." : "Continuer"}</span>
        {!loading && (
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        )}
      </button>

    </form>
  );
}

// ═══════════════════════════════════════════════
// Composant Input Agilly (Styling Strict Utilisateur)
// ═══════════════════════════════════════════════
interface AgillyInputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
}

function AgillyInput({ label, type = "text", value, onChange, placeholder, suffix }: AgillyInputProps) {
  return (
    <div className="flex flex-col gap-2 relative">
      {label && (
        <label className="text-sm font-medium text-agilly-black">{label}</label>
      )}
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          /* Fond #F4F7FB, Bordure #888888 (1px), Focus Orange 2px SANS halo (ring-0) */
          className="w-full bg-[#F4F7FB] border border-[#888888] text-agilly-black text-sm px-4 py-3 outline-none transition-all focus:border-agilly-primary focus:border-2 focus:ring-0 placeholder:text-gray-500"
          style={{ paddingRight: suffix ? '40px' : '16px' }}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}


