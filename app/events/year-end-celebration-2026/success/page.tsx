"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  Sparkles,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { YEAR_END_EVENT_CONFIG } from "@/app/lib/year-end-constants";
import { capitalizeWords } from "@/app/lib/year-end-fee";

function YearEndSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const registrationIdParam = searchParams.get("registration_id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchConfirmation() {
      try {
        const query = sessionId
          ? `session_id=${encodeURIComponent(sessionId)}`
          : `registration_id=${encodeURIComponent(registrationIdParam || "")}`;

        const res = await fetch(`/api/year-end-celebration/confirmation?${query}`);
        const result = await res.json();

        if (isMounted && result.success && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to load registration details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (sessionId || registrationIdParam) {
      fetchConfirmation();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId, registrationIdParam]);

  const regId = data?.registrationId || registrationIdParam || "CONFIRMED";

  const handleCopy = () => {
    navigator.clipboard.writeText(regId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-neutral-600">
        <Loader2 className="w-10 h-10 text-[#D9001B] animate-spin mb-4" />
        <p className="text-sm font-semibold">Verifying payment & registration records...</p>
      </div>
    );
  }

  const ticketDetails = data?.ticketDetails || {};
  const under5Item = ticketDetails.under5;
  const child5to10Item = ticketDetails.child5to10;
  const ages11PlusItem = ticketDetails.ages11Plus;
  const familyOf4Item = ticketDetails.familyOf4;
  const familyOf5Item = ticketDetails.familyOf5;
  // Fallbacks for legacy records
  const legacyIndItem = ticketDetails.individual;
  const legacyFamItem = ticketDetails.family;

  return (
    <div className="w-full min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-neutral-200/90 rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Top Celebration Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-[#D9001B] to-amber-500" />

        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Status Badge */}
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Payment & Registration Confirmed
          </span>
        </div>

        <h1
          className="text-3xl sm:text-5xl font-normal uppercase text-center text-neutral-900 mb-3 leading-tight tracking-[0.06em]"
          style={{
            fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
            letterSpacing: "0.06em",
          }}
        >
          YOU&apos;RE REGISTERED!
        </h1>

        <p className="text-center text-sm sm:text-base text-neutral-600 max-w-lg mx-auto mb-8">
          Thank you, <strong className="capitalize">{capitalizeWords(data?.primaryContactName) || "Guest"}</strong>! Your registration for the{" "}
          <strong>{YEAR_END_EVENT_CONFIG.eventName}</strong> has been recorded and confirmed.
        </p>

        {/* Reference ID Banner */}
        <div className="bg-neutral-900 text-white rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
              Official Registration ID
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
              {regId}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Event Quick Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D9001B]" />
            <span>December 19, {YEAR_END_EVENT_CONFIG.eventYear} &bull; 5:30 PM</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D9001B]" />
            <span>Abbotsford Banquet Centre, BC</span>
          </div>
        </div>

        {/* Itemized Order Breakdown */}
        {data && (
          <div className="border border-neutral-200 rounded-2xl p-5 mb-8 text-sm">
            <h3 className="font-bold text-neutral-900 pb-3 mb-3 border-b border-neutral-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#D9001B]" />
              <span>Ticket Summary & Receipt</span>
            </h3>

            <div className="space-y-2 text-neutral-600 mb-4">
              {under5Item?.quantity > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Children Under 5 &times; {under5Item.quantity}</span>
                  <span>FREE</span>
                </div>
              )}

              {child5to10Item?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Children (5–10) &times; {child5to10Item.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(child5to10Item.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              {ages11PlusItem?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Ages 11+ &times; {ages11PlusItem.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(ages11PlusItem.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              {familyOf4Item?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Family of 4 Package &times; {familyOf4Item.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(familyOf4Item.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              {familyOf5Item?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Family of 5 Package &times; {familyOf5Item.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(familyOf5Item.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              {legacyIndItem?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Individual Ticket(s) &times; {legacyIndItem.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(legacyIndItem.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              {legacyFamItem?.quantity > 0 && (
                <div className="flex justify-between">
                  <span>Family Package &times; {legacyFamItem.quantity}</span>
                  <span className="font-semibold text-neutral-900">
                    ${Number(legacyFamItem.subtotal).toFixed(2)} CAD
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100 flex justify-between">
                <span>Subtotal</span>
                <span>${Number(data.subtotal || 0).toFixed(2)} CAD</span>
              </div>

              <div className="flex justify-between">
                <span>Online Processing Fee (3%)</span>
                <span>${Number(data.processingFee || 0).toFixed(2)} CAD</span>
              </div>

              <div className="pt-2 border-t-2 border-neutral-900 flex justify-between text-base font-bold text-neutral-900">
                <span>Total Amount Paid</span>
                <span className="text-[#D9001B]">${Number(data.totalAmount || 0).toFixed(2)} CAD</span>
              </div>
            </div>

            <div className="text-[12px] text-neutral-500 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
              A copy of this confirmation receipt has been sent to <strong>{data.email}</strong>.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <Link
            href="/events"
            className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl bg-[#D9001B] hover:bg-[#b90017] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-red-600/20"
          >
            <span>Back to Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function YearEndSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#D9001B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <YearEndSuccessContent />
    </Suspense>
  );
}
