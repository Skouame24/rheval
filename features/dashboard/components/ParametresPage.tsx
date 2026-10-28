// ============================================================
// features/dashboard/components/ParametresPage.tsx
// Paramètres Utilisateur — 100% Fonctionnel & Microsoft Entra ID SSO
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { employeesApi } from "@/lib/api/employees.api";
import { notificationsApi } from "@/lib/api/notifications.api";
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@/components/ui/Icons";

export function ParametresPage({ role }: { role: string }) {
  const { user, logout } = useAuth();

  // Coordonnées
  const [telephone, setTelephone] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);
  const [contactErrorMsg, setContactErrorMsg] = useState<string | null>(null);

  // Préférences de notification
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccessMsg, setPrefsSuccessMsg] = useState<string | null>(null);

  // Test de messagerie Brevo
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [mailTestStatus, setMailTestStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Initialisation des données
  useEffect(() => {
    if (user) {
      if ((user as any).telephone) {
        setTelephone((user as any).telephone);
      }
      // Chargement profil backend complet
      employeesApi
        .getMe()
        .then((profile) => {
          if (profile && (profile as any).telephone) {
            setTelephone((profile as any).telephone);
          }
        })
        .catch(() => {});

      // Chargement préférences locales
      try {
        const stored = localStorage.getItem(`rheval_prefs_${user.id || user.email}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.emailAlerts === "boolean") setEmailAlerts(parsed.emailAlerts);
          if (typeof parsed.inAppAlerts === "boolean") setInAppAlerts(parsed.inAppAlerts);
          if (typeof parsed.dailyReminders === "boolean") setDailyReminders(parsed.dailyReminders);
        }
      } catch {}
    }
  }, [user]);

  // Sauvegarde des coordonnées (téléphone)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    setContactSuccessMsg(null);
    setContactErrorMsg(null);
    try {
      await employeesApi.updateMe({ telephone });
      setContactSuccessMsg("Votre numéro de téléphone a été mis à jour avec succès dans l'annuaire Agilly.");
      setTimeout(() => setContactSuccessMsg(null), 4000);
    } catch (err: any) {
      setContactErrorMsg(err?.message || "Erreur lors de la sauvegarde des coordonnées.");
    } finally {
      setIsSavingContact(false);
    }
  };

  // Sauvegarde des préférences de notification
  const handleSavePreferences = () => {
    setIsSavingPrefs(true);
    setPrefsSuccessMsg(null);
    try {
      if (user) {
        localStorage.setItem(
          `rheval_prefs_${user.id || user.email}`,
          JSON.stringify({
            emailAlerts,
            inAppAlerts,
            dailyReminders,
            updatedAt: new Date().toISOString(),
          })
        );
      }
      setPrefsSuccessMsg("Vos préférences de notifications ont été enregistrées avec succès.");
      setTimeout(() => setPrefsSuccessMsg(null), 4000);
    } catch {
      setPrefsSuccessMsg("Préférences prises en compte pour cette session.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Test d'envoi d'e-mail officiel via Brevo SMTP
  const handleSendTestMail = async () => {
    const targetEmail = user?.email;
    if (!targetEmail) {
      setMailTestStatus({
        type: "error",
        message: "Aucune adresse e-mail associée à votre compte.",
      });
      return;
    }

    setIsSendingTestMail(true);
    setMailTestStatus(null);
    try {
      await notificationsApi.sendTestMail(targetEmail);
      setMailTestStatus({
        type: "success",
        message: `E-mail de test Brevo SMTP envoyé avec succès à ${targetEmail} ! Vérifiez votre boîte de réception.`,
      });
    } catch (err: any) {
      setMailTestStatus({
        type: "error",
        message: `Erreur d'envoi : ${err?.message || "Impossible d'atteindre le serveur de messagerie."}`,
      });
    } finally {
      setIsSendingTestMail(false);
    }
  };

  const displayName = user ? `${user.prenom || ""} ${user.nom || ""}`.trim() : "Utilisateur";

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-[1000px] mx-auto font-sans">
      <PageHeader
        title="Paramètres & Sécurité du Compte"
        subtitle="Gestion de votre compte Microsoft Entra ID, alertes par e-mail et coordonnées."
        breadcrumbs={[
          { label: "Mon espace", href: `/dashboard/mon-espace` },
          { label: "Paramètres" },
        ]}
      />

      <div className="flex flex-col gap-6">

        {/* ── 1. AUTHENTIFICATION & SÉCURITÉ SSO MICROSOFT ENTRA ID ── */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  Microsoft Entra ID (Azure AD SSO)
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Sécurité & Authentification Centralisée
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Votre compte est rattaché à l&apos;annuaire d&apos;entreprise AGILLY Enterprise.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0822A" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>

          {/* Explication claire sur le mot de passe */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 mb-6 text-xs text-blue-900 leading-relaxed">
            <div className="flex items-start gap-3">
              <span className="font-bold text-sm text-blue-600">ℹ️</span>
              <div>
                <p className="font-bold m-0 mb-1">
                  Gestion centralisée du mot de passe par la DSI Agilly
                </p>
                <p className="m-0 text-blue-800">
                  Conformément à la politique de sécurité d&apos;entreprise, votre mot de passe et l&apos;authentification multi-facteurs (MFA) sont gérés sur votre compte Microsoft 365. Vous n&apos;avez aucun mot de passe local à retenir ou à changer pour la plateforme RHEVAL.
                </p>
              </div>
            </div>
          </div>

          {/* Grille d'informations de session */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Collaborateur connecté
              </span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                {displayName}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Adresse e-mail professionnelle (SSO)
              </span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                {user?.email || "Non renseignée"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Poste & Direction
              </span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {user?.poste || "Collaborateur"} · {user?.departement || "Agilly"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rôle Système
              </span>
              <span className="text-sm font-extrabold text-[#F0822A] block mt-0.5">
                {user?.role || "SALARIE"}
              </span>
            </div>
          </div>

          {/* Actions de sécurité */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://myaccount.microsoft.com/security-info"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#F0822A] hover:bg-[#d97220] text-white text-xs font-black transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Gérer la sécurité Microsoft 365 (MFA & Mot de passe)</span>
              <span>↗</span>
            </a>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <span>Se déconnecter de la session</span>
            </button>
          </div>
        </div>

        {/* ── 2. PRÉFÉRENCES DE NOTIFICATIONS & DELIVRABILITÉ E-MAIL ── */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#F0822A] bg-orange-50 px-2 py-0.5 border border-orange-200">
                  Brevo SMTP & In-App
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Préférences des Alertes & Notifications
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Configurez les canaux par lesquels vous souhaitez être averti des étapes de vos évaluations.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0822A" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </div>

          {/* Options de notification */}
          <div className="flex flex-col gap-4 mb-6">
            <label className="flex items-start gap-3.5 p-3.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#F0822A] accent-[#F0822A] rounded-none cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-slate-900 m-0">
                  Alertes officielles par e-mail (Brevo SMTP)
                </p>
                <p className="text-xs text-slate-600 m-0 mt-0.5 leading-relaxed">
                  Recevez un e-mail officiel à chaque changement d&apos;étape : fixation d&apos;objectifs, validation N+1/N+2, demande de signature ou arbitrage.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-3.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={inAppAlerts}
                onChange={(e) => setInAppAlerts(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#F0822A] accent-[#F0822A] rounded-none cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-slate-900 m-0">
                  Notifications dans le portail (Cloche en haut à droite)
                </p>
                <p className="text-xs text-slate-600 m-0 mt-0.5 leading-relaxed">
                  Affiche les pastilles d&apos;alertes rouges en temps réel avec accès direct aux dossiers en un clic.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-3.5 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#F0822A] accent-[#F0822A] rounded-none cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-slate-900 m-0">
                  Rappels automatiques du matin (Cron de 08h30)
                </p>
                <p className="text-xs text-slate-600 m-0 mt-0.5 leading-relaxed">
                  Recevez un rappel de relance automatique chaque matin si une évaluation nécessite votre action depuis plus de 5 jours.
                </p>
              </div>
            </label>
          </div>

          {/* Feedback enregistrement */}
          {prefsSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircleIcon size={16} />
              <span>{prefsSuccessMsg}</span>
            </div>
          )}

          {/* Barre d'action des préférences */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="px-5 py-2.5 bg-[#F0822A] hover:bg-[#d97220] disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer shadow-sm"
            >
              {isSavingPrefs ? "Enregistrement..." : "Enregistrer mes préférences"}
            </button>

            {/* Test réel Brevo SMTP */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendTestMail}
                disabled={isSendingTestMail}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold transition-all border border-slate-300 flex items-center gap-2 cursor-pointer"
              >
                {isSendingTestMail ? (
                  <>
                    <ArrowPathIcon size={14} className="animate-spin" />
                    <span>Envoi du test en cours...</span>
                  </>
                ) : (
                  <>
                    <span>✉️ Tester la réception e-mail (Brevo SMTP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Résultat du test e-mail */}
          {mailTestStatus && (
            <div
              className={`mt-4 p-3.5 border text-xs font-bold flex items-center gap-2 ${
                mailTestStatus.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <span>{mailTestStatus.type === "success" ? "✅" : "⚠️"}</span>
              <span>{mailTestStatus.message}</span>
            </div>
          )}
        </div>

        {/* ── 3. COORDONNÉES PERSONNELLES & CONTACT ── */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Coordonnées de Contact
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Informations utilisées pour vous joindre en cas d&apos;arbitrage ou d&apos;entretien RH.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0822A" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSaveContact} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Numéro de téléphone professionnel
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-sm focus:border-[#F0822A] focus:outline-none transition-all rounded-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Exemple : +225 07 XX XX XX XX
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse e-mail de correspondance
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed rounded-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Synchronisé avec Microsoft 365 (non modifiable)
                </span>
              </div>
            </div>

            {contactSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircleIcon size={16} />
                <span>{contactSuccessMsg}</span>
              </div>
            )}

            {contactErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                ⚠️ {contactErrorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingContact}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black transition-all cursor-pointer shadow-sm"
              >
                {isSavingContact ? "Mise à jour..." : "Mettre à jour mes coordonnées"}
              </button>
            </div>
          </form>
        </div>

        {/* ── 4. LANGUE & RÉGION ── */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Langue & Paramètres Régionaux
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Format d&apos;affichage par défaut de la plateforme Agilly RHEVAL.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0822A" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Langue du portail
              </span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                Français (International / CI)
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fuseau horaire
              </span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                Abidjan (GMT, UTC+0)
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Format de date
              </span>
              <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                JJ/MM/AAAA (ex: 28/10/2026)
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
