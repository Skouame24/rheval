// ============================================================
// components/ui/Skeleton.tsx
// Composants de chargement haute-fidélité (Charte Agilly Tech)
// Strictement rounded-none, palette slate enterprise & accents #F0822A
// ============================================================

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "shimmer" | "pulse";
}

/**
 * Composant de base Skeleton avec animation shimmer ou pulse
 * Toujours sans bordures arrondies (rounded-none) selon la charte Agilly
 */
export function Skeleton({ className = "", variant = "shimmer", ...props }: SkeletonProps) {
  const animClass = variant === "shimmer" ? "animate-shimmer" : "animate-pulse bg-slate-200/80";
  return (
    <div
      className={`rounded-none select-none pointer-events-none ${animClass} ${className}`}
      {...props}
    />
  );
}

/**
 * Ligne de texte Skeleton
 */
export function SkeletonText({
  lines = 1,
  className = "",
  lastLineWidth = "60%",
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 w-full ${className}`}
          style={i === lines - 1 && lines > 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour l'en-tête de page (PageHeader)
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-gray-200 w-full animate-fade-in">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <span className="text-gray-300">/</span>
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 md:w-80 mb-2" />
          <Skeleton className="h-4 w-80 md:w-96" />
        </div>
        <Skeleton className="h-10 w-36 shrink-0" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour une carte KPI / StatCard
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-none shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="w-8 h-8" />
      </div>
      <div>
        <Skeleton className="h-8 w-20 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grille de 4 cartes KPI
 */
export function StatCardsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une ligne de collaborateur
 */
export function CollaborateurRowSkeleton() {
  return (
    <div className="p-5 md:p-6 flex items-center justify-between gap-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-10 h-10 shrink-0" />
        <div className="flex flex-col gap-2 flex-1 max-w-xs">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Skeleton className="h-6 w-28 hidden sm:block" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour la liste de collaborateurs
 */
export function CollaborateursListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm">
      <div className="p-5 md:p-6 border-b border-gray-200 flex items-center justify-between bg-white">
        <div>
          <Skeleton className="h-5 w-44 mb-2" />
          <Skeleton className="h-3 w-60" />
        </div>
        <Skeleton className="h-6 w-24 hidden sm:block" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: count }).map((_, i) => (
          <CollaborateurRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton haute-fidélité pour les cartes d'objectifs (ObjectifsSalariePage)
 * Reproduit scrupuleusement la structure de la page avec la bordure gauche Agilly #F0822A
 */
export function ObjectiveCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-[#F0822A] rounded-none overflow-hidden shadow-sm">
      {/* Header de l'objectif */}
      <div className="p-6 bg-white flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-3/4 max-w-lg mb-3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-40" />
          </div>
        </div>
      </div>

      {/* 4 Paliers d'évaluation (Excellence, Très bon, Satisfaisant, Insuffisant) */}
      <div className="p-6 bg-[#F4F7FB]">
        <Skeleton className="h-4 w-44 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Excellence */}
          <div className="bg-white p-4 border border-[#A7F3D0]">
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Très bon */}
          <div className="bg-white p-4 border border-[#FFEDD5]">
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Satisfaisant */}
          <div className="bg-white p-4 border border-[#BFDBFE]">
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Insuffisant */}
          <div className="bg-white p-4 border border-[#FEE2E2]">
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton complet pour la page des objectifs d'un salarié
 */
export function ObjectifsPageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto w-full animate-fade-in">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ObjectiveCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour tableau de données
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-none overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-6 py-4 bg-white">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton pour la page Mon Profil
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[900px] mx-auto w-full animate-fade-in">
      <PageHeaderSkeleton />
      <div className="bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row p-8 gap-10">
        {/* Avatar block */}
        <div className="flex flex-col items-center gap-4 shrink-0 md:w-64 border-r border-gray-100 pr-8">
          <Skeleton className="w-32 h-32" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-20 mt-2" />
        </div>
        {/* Fields block */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="pt-4 flex justify-end">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour la page Historique
 */
export function HistoriqueSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto w-full animate-fade-in">
      <PageHeaderSkeleton />
      {/* Pills filtres */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-24 w-full mb-3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Spinner Agilly officiel haute performance
 */
export function BrandSpinner({
  size = "md",
  label,
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
}) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-[3px]",
    xl: "w-14 h-14 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} border-slate-200 border-t-[#F0822A] animate-spin rounded-none`}
        style={{ animationDuration: "0.65s" }}
      />
      {label && (
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
