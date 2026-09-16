"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_METADATA } from "@/lib/constants/roles";
import type { Role } from "@/types";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<Role>("RH");
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
    <div className="flex flex-col gap-6">

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
