"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [error, setError] = useState("");

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoadingMicrosoft(true);
    try {
      localStorage.removeItem("agilly_user");
      localStorage.removeItem("agilly_token");
      localStorage.removeItem("agilly_simulated_user");
      localStorage.removeItem("agilly_user_role_override");
      await signIn("azure-ad", { callbackUrl: "/portail" });
    } catch (loginError) {
      console.error("[LoginForm] Erreur lors de la redirection SSO:", loginError);
      setError("Échec de la redirection vers Microsoft Entra ID.");
      setLoadingMicrosoft(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={handleMicrosoftLogin}
        disabled={loadingMicrosoft}
        className="w-full h-12 bg-[#2F2F2F] hover:bg-[#000000] text-white text-sm font-semibold transition-all border border-slate-700 flex items-center justify-center gap-3 px-4 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        <span>
          {loadingMicrosoft
            ? "Connexion Microsoft en cours..."
            : "Se connecter avec Microsoft"}
        </span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Utilisez votre compte Microsoft professionnel.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
