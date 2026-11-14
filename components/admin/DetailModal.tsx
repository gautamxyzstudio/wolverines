"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";

interface DetailModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function DetailModal({
  isOpen,
  title,
  subtitle,
  badge,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: DetailModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-[#141414] border border-white/10 shadow-2xl shadow-black/50`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0f0f0f]/90">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-xs text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-neutral-200">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-white/10 bg-[#0f0f0f]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
