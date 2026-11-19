import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, MapPin, ArrowRight, Ticket } from "lucide-react";

export default function YearEndEventBanner() {
  return (
    <section className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 py-10 px-4 sm:px-6 lg:px-8 border-y border-neutral-800 relative overflow-hidden">
      {/* Hockey Action Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Image
          src="/images/event_red_action.jpg"
          alt="Field Hockey Action"
          fill
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent" />
      </div>

      {/* Subtle Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-[#D9001B]/20 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Registration Now Open</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white tracking-tight"
            style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
          >
            Wolverines <span className="text-[#D9001B]">Year-End Celebration</span> 2026
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#D9001B]" />
              December 19, 2026
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D9001B]" />
              Abbotsford Banquet Centre, BC
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-amber-400 font-semibold">
              Children Under 5 Free
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/events/year-end-celebration-2026"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D9001B] hover:bg-[#b90017] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
          >
            <Ticket className="w-4 h-4" />
            <span>Register & Get Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
