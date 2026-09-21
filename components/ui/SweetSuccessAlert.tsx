"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, CheckCheck, Printer, Home, ArrowRight, ShieldCheck } from "lucide-react";

interface SweetSuccessAlertProps {
  sessionId?: string | null;
  title?: string;
  subtitle?: string;
  programName?: string;
  homeUrl?: string;
  programUrl?: string;
}

export default function SweetSuccessAlert({
  sessionId,
  title = "Registration & Payment Successful!",
  subtitle = "Thank you for completing your registration with The Wolverines Field Hockey Club. Your spot has been secured.",
  programName = "Wolverines Summer Program",
  homeUrl = "/",
  programUrl = "/summer-program",
}: SweetSuccessAlertProps) {
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    // Pop-in entrance animation
    const timer = setTimeout(() => setShowCard(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCopySession = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-b from-neutral-50 via-white to-neutral-100">
      {/* Inline styles for SweetAlert-style smooth drawing animations */}
      <style>{`
        @keyframes swalScaleUp {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          45% {
            transform: scale(1.04);
            opacity: 0.9;
          }
          80% {
            transform: scale(0.98);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes swalCircleDraw {
          0% {
            stroke-dashoffset: 260;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes swalCheckDraw {
          0% {
            stroke-dashoffset: 70;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .swal-modal-anim {
          animation: swalScaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .swal-circle-anim {
          stroke-dasharray: 260;
          stroke-dashoffset: 0;
          animation: swalCircleDraw 0.6s ease-out forwards;
        }

        .swal-check-anim {
          stroke-dasharray: 70;
          stroke-dashoffset: 0;
          animation: swalCheckDraw 0.35s ease-out 0.5s both;
        }
      `}</style>

      {/* Main SweetAlert Modal Card */}
      <div
        className={`w-full max-w-xl bg-white border border-neutral-200/80 rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden transition-all duration-300 ${
          showCard ? "swal-modal-anim" : "opacity-0 scale-90"
        }`}
      >
        {/* Subtle decorative top accent in Wolverines crimson */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DE2027] via-[#f87171] to-[#DE2027]" />

        {/* 1. Iconic SweetAlert Success Checkmark Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          {/* Pulsing subtle glow background */}
          <div className="absolute inset-0 rounded-full bg-emerald-100/70 animate-ping opacity-40" />

          {/* Icon SVG with smooth circle and check stroke draw */}
          <svg className="w-24 h-24 relative z-10" viewBox="0 0 84 84">
            {/* Background circle */}
            <circle
              cx="42"
              cy="42"
              r="38"
              fill="#ecfdf5"
              stroke="#a7f3d0"
              strokeWidth="2.5"
            />
            {/* Animated drawing outer circle */}
            <circle
              cx="42"
              cy="42"
              r="38"
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="swal-circle-anim"
              transform="rotate(-90 42 42)"
            />
            {/* Animated drawing checkmark */}
            <polyline
              points="26,44 38,55 58,31"
              fill="none"
              stroke="#10b981"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="swal-check-anim"
            />
          </svg>
        </div>

        {/* 2. Title & Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PAYMENT & REGISTRATION VERIFIED</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-normal uppercase tracking-wide text-neutral-900 mb-3 leading-tight"
          style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
        >
          {title}
        </h1>

        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
          {subtitle}
        </p>

        {/* 3. Session Details & Registration Info Box */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 sm:p-5 text-left mb-6 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/70 text-xs sm:text-sm">
            <span className="text-neutral-500 font-medium">Program</span>
            <span className="font-semibold text-neutral-900">{programName}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/70 text-xs sm:text-sm">
            <span className="text-neutral-500 font-medium">Payment Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded text-xs">
              <Check className="w-3 h-3" /> Paid
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/70 text-xs sm:text-sm">
            <span className="text-neutral-500 font-medium">Confirmation</span>
            <span className="text-neutral-700 font-medium">Sent to your registered email</span>
          </div>

          {sessionId && (
            <div className="pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                  Session ID
                </span>
                <button
                  type="button"
                  onClick={handleCopySession}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 px-2 py-0.5 rounded transition cursor-pointer"
                  title="Copy session ID"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 truncate mt-1 bg-white px-2.5 py-1.5 rounded border border-neutral-200 select-all">
                {sessionId}
              </p>
            </div>
          )}
        </div>

        {/* 4. Action Buttons matching SweetAlert style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={homeUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#DE2027] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-sm rounded-xl uppercase tracking-wider transition shadow-md shadow-red-500/20 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <Link
            href={programUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm rounded-xl uppercase tracking-wider transition cursor-pointer"
          >
            <span>Register Another</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold text-sm rounded-xl transition cursor-pointer"
            title="Print confirmation receipt"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        {/* 5. Support note */}
        <p className="text-[12px] text-neutral-400 mt-6 text-center">
          Have questions? Contact our team at{" "}
          <a
            href="mailto:support@thewolverines.ca"
            className="text-neutral-600 hover:underline font-medium"
          >
            support@thewolverines.ca
          </a>
        </p>
      </div>
    </div>
  );
}
