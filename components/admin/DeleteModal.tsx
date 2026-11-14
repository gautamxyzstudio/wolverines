"use client";

import { Trash2, Loader2, X } from "lucide-react";
import React, { useEffect } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  itemTitle?: string;
  confirmText?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({
  isOpen,
  title,
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemTitle,
  confirmText,
  icon,
  isLoading = false,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#141414] border border-white/10 p-6 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-2xl bg-red-950/40 border border-red-500/25 flex items-center justify-center shrink-0 text-[#D32F2F]">
            {icon || <Trash2 className="h-5 w-5" />}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
            {itemTitle && (
              <p className="mt-1 text-sm font-semibold text-red-400 font-mono break-all">
                "{itemTitle}"
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#D32F2F] hover:bg-[#b71c1c] text-white shadow-sm transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              confirmText || "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
