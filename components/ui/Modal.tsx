"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "lg" | "xl";
  children: ReactNode;
  /** Allow closing when clicking outside content */
  canCloseOnOverlayClick?: boolean;
  /** Allow closing with Escape key */
  canCloseOnEsc?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  size = "lg",
  children,
  canCloseOnOverlayClick = true,
  canCloseOnEsc = true,
}: Props) {
  const labelId = useId();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render into document.body on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !canCloseOnEsc) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, canCloseOnEsc, onClose]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!canCloseOnOverlayClick) return;
      if (event.target === event.currentTarget) onClose();
    },
    [canCloseOnOverlayClick, onClose]
  );

  if (!mounted || !open) return null;

  const maxWidth = size === "xl" ? "max-w-6xl" : "max-w-3xl";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? labelId : undefined}
      onClick={handleOverlayClick}
    >
      <div
        className={`relative w-full ${maxWidth} mx-4 sm:mx-6 rounded-3xl bg-slate-900/95 ring-1 ring-slate-700/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)] overflow-hidden`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-emerald-400 to-fuchsia-500" />
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3.5">
          {title && (
            <h2
              id={labelId}
              className="text-sm font-semibold text-slate-50 truncate"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            type="button"
            aria-label="Fermer le modal"
            className="rounded-full px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          >
            Fermer
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
