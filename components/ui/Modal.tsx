// ============================================================
// components/ui/Modal.tsx
// Modal accessible avec overlay et animation
// ============================================================

"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closable?: boolean;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closable = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fermeture sur Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closable, onClose]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === overlayRef.current && closable) onClose(); }}
    >
      <div
        className={cn(
          "w-full bg-white rounded-none border border-gray-200 flex flex-col max-h-[90vh] animate-fade-in shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
          sizeMap[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-agilly-black m-0">{title}</h2>
            {subtitle && <p className="text-sm mt-1 font-medium text-agilly-gray m-0">{subtitle}</p>}
          </div>
          {closable && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-none flex items-center justify-center transition-colors text-sm text-agilly-gray hover:bg-gray-100 hover:text-agilly-black cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 bg-[#F4F7FB]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal de confirmation rapide ───────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = "Confirmer", confirmVariant = "primary", loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm font-medium text-agilly-black m-0">{message}</p>
    </Modal>
  );
}
