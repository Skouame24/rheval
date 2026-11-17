"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState(
    process.env.NODE_ENV === "development" ? "demo@agilly.local" : "",
  );
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoadingMicrosoft(true);
    // Vider les résidus de démo pour charger immédiatement l'identité Microsoft réelle
    try {
      localStorage.removeItem("agilly_user");
      localStorage.removeItem("agilly_token");
    } catch {}
    try {
      // Vraie redirection SSO Microsoft Entra ID via NextAuth
      await signIn("azure-ad", { callbackUrl: "/portail" });
    } catch {
      setError("Échec de la redirection vers Microsoft Entra ID.");
      setLoadingMicrosoft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Veuillez renseigner votre adresse email.");
      return;
    }
    if (!password) {
      setError("Veuillez renseigner votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      setError("Impossible de se connecter avec ces identifiants.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Bouton Officiel Microsoft Entra ID SSO ── */}
      <button
        type="button"
        onClick={handleMicrosoftLogin}
        disabled={loadingMicrosoft}
        className="w-full h-12 bg-[#2F2F2F] hover:bg-[#000000] text-white text-sm font-semibold transition-all border border-slate-700 flex items-center justify-center gap-3 px-4 shadow-sm cursor-pointer"
      >
        {/* Logo Microsoft officiel 4 carreaux */}
        <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        <span>{loadingMicrosoft ? "Connexion Microsoft en cours..." : "Se connecter avec Microsoft (Outlook)"}</span>
      </button>

      {/* Séparateur élégant */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          ou connexion par email
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Formulaire de connexion directe */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-slate-500">
            Compte de démonstration local : <strong>demo@agilly.local</strong>. Créez-le dans le
            backend avec <code>npm run seed:dev-account</code>.
          </p>
        )}

        <AgillyInput
          label="Adresse email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="prenom.nom@agilly.net"
        />

        <AgillyInput
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          suffix={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-700"
            >
              {showPwd ? "Masquer" : "Afficher"}
            </button>
          }
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-11 bg-agilly-primary hover:bg-[#D96B16] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <span>Connexion en cours...</span>
          ) : (
            <>
              <span>Se connecter au portail</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

    </div>
  );
}

// ═══════════════════════════════════════════════
// Composant Input Agilly
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
