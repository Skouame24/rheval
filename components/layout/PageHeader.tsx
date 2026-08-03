// ============================================================
// components/layout/PageHeader.tsx
// En-tête de page : titre + fil d'Ariane + actions
// ============================================================

import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-8", className)}>
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 mb-3">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs font-semibold text-agilly-gray hover:text-agilly-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-agilly-black">
                    {crumb.label}
                  </span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="text-xs text-gray-300">/</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Titre */}
        <h1 className="text-2xl font-semibold text-agilly-black m-0 tracking-tight">{title}</h1>

        {/* Sous-titre */}
        {subtitle && (
          <p className="text-sm font-medium text-agilly-gray mt-1.5 m-0">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
