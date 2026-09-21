"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface PaymentCancelCardProps {
  programName?: string;
  retryUrl?: string;
}

export default function PaymentCancelCard({
  programName = "Wolverines Summer Program",
  retryUrl = "/summer-program",
}: PaymentCancelCardProps) {
  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-b from-neutral-50 via-white to-neutral-100">
      <div className="w-full max-w-lg bg-white border border-neutral-200/80 rounded-3xl shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-3 border border-amber-200 uppercase tracking-wider">
          Payment Incomplete
        </div>

        <h1
          className="text-3xl sm:text-4xl font-normal uppercase tracking-wide text-neutral-900 mb-3"
          style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
        >
          REGISTRATION NOT COMPLETED
        </h1>

        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
          The payment checkout for {programName} was cancelled or could not be completed. No funds have been deducted from your account.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={retryUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#DE2027] hover:bg-[#b91c1c] text-white font-bold text-sm rounded-xl uppercase tracking-wider transition shadow-md shadow-red-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm rounded-xl uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
