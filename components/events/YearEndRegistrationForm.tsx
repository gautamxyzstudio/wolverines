"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Users,
  Baby,
  User,
  Mail,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  Gift,
} from "lucide-react";
import PhoneCountryInput, {
  CountryItem,
  COUNTRIES,
} from "@/components/ui/PhoneCountryInput";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import Toast from "@/components/ui/Toast";
import { YEAR_END_EVENT_CONFIG } from "@/app/lib/year-end-constants";
import {
  calculateAge,
  getAttendeeCategory,
  calculateYearEndFee,
  capitalizeWords,
  AttendeeInput,
} from "@/app/lib/year-end-fee";

type RegistrationType = "INDIVIDUAL" | "FAMILY";

interface AttendeeRow {
  name: string;
  dateOfBirth: string;
}

// Reference cutoff date: Dec 1, 2026. Minimum age for ticket holders is 5 years old.
// Children under 5 attend free when accompanied by family and do not need a ticket.
const MAX_ATTENDEE_BIRTH_DATE = new Date(2021, 11, 1, 23, 59, 59);
const MAX_ATTENDEE_BIRTH_YEAR = 2021;

export default function YearEndRegistrationForm() {
  const router = useRouter();

  // Primary Contact state
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryCountry, setPrimaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0],
  );
  const [contactNumber, setContactNumber] = useState("");
  const [secondaryCountry, setSecondaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0],
  );
  const [secondaryContactNumber, setSecondaryContactNumber] = useState("");

  // Step 1: 2 Main Options (Individual vs Family)
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("INDIVIDUAL");

  // Attendees for Individual Ticket flow (Strictly 1 attendee only)
  const [individualAttendee, setIndividualAttendee] = useState<AttendeeRow>({
    name: "",
    dateOfBirth: "",
  });

  // Attendees for Family flow (starts with 2, user can freely add/remove any number)
  const [familyAttendees, setFamilyAttendees] = useState<AttendeeRow[]>([
    { name: "", dateOfBirth: "" },
    { name: "", dateOfBirth: "" },
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "error" | "success" | "warning" | "info";
    title?: string;
    message: string;
  } | null>(null);

  // Active attendees list based on selected option (Individual = exactly 1)
  const activeAttendees = useMemo(
    () =>
      registrationType === "INDIVIDUAL"
        ? [individualAttendee]
        : familyAttendees,
    [registrationType, individualAttendee, familyAttendees],
  );

  // Individual attendee row handler (strictly 1 attendee)
  const handleIndividualChange = (
    field: "name" | "dateOfBirth",
    value: string,
  ) => {
    setIndividualAttendee((prev) => ({ ...prev, [field]: value }));
  };

  // Family attendee row handlers (fully flexible, user chooses size)
  const handleFamilyChange = (
    index: number,
    field: "name" | "dateOfBirth",
    value: string,
  ) => {
    setFamilyAttendees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addFamilyMember = () => {
    setFamilyAttendees((prev) => [...prev, { name: "", dateOfBirth: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    if (familyAttendees.length <= 1) return;
    setFamilyAttendees((prev) => prev.filter((_, i) => i !== index));
  };

  // Real-time Fee Calculation
  const feeSummary = useMemo(() => {
    const sanitized: AttendeeInput[] = activeAttendees.map((att) => ({
      name: att.name.trim() || "Attendee",
      // Default placeholder date so preview calculates while typing
      dateOfBirth: att.dateOfBirth.trim() || "2000-01-01",
    }));

    try {
      return calculateYearEndFee({
        registrationType,
        attendees: sanitized,
      });
    } catch {
      return calculateYearEndFee({
        registrationType: "INDIVIDUAL",
        attendees: [{ name: "Attendee", dateOfBirth: "2000-01-01" }],
      });
    }
  }, [registrationType, activeAttendees]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate primary contact details
    if (!primaryContactName.trim()) {
      setErrorMessage("Please enter your full contact name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMessage("Please enter your primary contact phone number.");
      return;
    }

    // 2. Validate Attendees: Name and Date of Birth are REQUIRED for all added rows
    for (let i = 0; i < activeAttendees.length; i++) {
      const att = activeAttendees[i];
      const label =
        registrationType === "FAMILY"
          ? `Family Member #${i + 1}`
          : `Attendee #${i + 1}`;

      if (!att.name.trim() || att.name.trim().length < 2) {
        const msg = `Please enter the full name for ${label}.`;
        setErrorMessage(msg);
        setToast({
          type: "error",
          title: "Full Name Required",
          message: msg,
        });
        return;
      }

      if (!att.dateOfBirth.trim()) {
        const msg = `Please select the Date of Birth for ${label}.`;
        setErrorMessage(msg);
        setToast({
          type: "error",
          title: "Date of Birth Required",
          message: msg,
        });
        return;
      }

      const age = calculateAge(att.dateOfBirth);
      if (age !== null && age < 5) {
        const msg = `${label} is under 5 years old. Children under 5 attend free and do not require a ticket. Attendees must be at least 5 years old (born on or before Dec 1, 2021).`;
        setErrorMessage(msg);
        setToast({
          type: "error",
          title: "Minimum Age 5 Years",
          message: msg,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        primaryContactName: capitalizeWords(primaryContactName),
        email: email.trim().toLowerCase(),
        countryCode: primaryCountry.dial,
        contactNumber: contactNumber.trim(),
        secondaryCountryCode: secondaryContactNumber.trim()
          ? secondaryCountry.dial
          : null,
        secondaryContactNumber: secondaryContactNumber.trim() || null,
        notes: null,
        registrationType,
        attendees: activeAttendees.map((a) => ({
          name: capitalizeWords(a.name),
          dateOfBirth: a.dateOfBirth.trim(),
        })),
      };

      const res = await fetch("/api/year-end-celebration/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process registration.");
      }

      // If complimentary / free ($0), redirect to confirmation page
      if (data.data?.isComplimentary && data.data?.redirectUrl) {
        router.push(data.data.redirectUrl);
        return;
      }

      // If paid, redirect to Stripe Checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned from payment server.");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      const msg = err.message || "Something went wrong. Please try again.";
      setErrorMessage(msg);
      setToast({
        type: "error",
        title: "Registration Failed",
        message: msg,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="registration-section"
      className="py-12 sm:py-16 bg-neutral-50 min-h-screen text-neutral-900 scroll-mt-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {toast && (
          <div className="fixed top-6 right-6 z-50 max-w-md">
            <Toast
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Form Details & Attendee Inputs */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Select Registration Option (Individual vs Family) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 min-w-10 min-h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#D9001B] flex-shrink-0 mt-0.5">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                      Step 1: Choose Registration Option
                    </h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      Select Individual Ticket or Family Package. All ticket pricing is calculated by age.
                    </p>
                  </div>
                </div>

                {/* Free Under 5 Announcement Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/30 border border-emerald-200 p-4 sm:p-4.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 min-w-10 min-h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Baby className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900 whitespace-nowrap">
                          Children Under 5: Free Entry
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide whitespace-nowrap">
                          100% Free &bull; No Ticket Needed
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        Accompanied young children under 5 attend free of charge with family. No ticket or registration required for under-5s!
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    Free Pass
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200/60 text-xs font-semibold text-neutral-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Children (Ages 5–10):</span>
                    <span className="font-bold text-neutral-900">$25.00 CAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ages 11+ (Youth & Adults):</span>
                    <span className="font-bold text-[#D9001B]">$45.00 CAD</span>
                  </div>
                </div>

                {/* 2 Primary Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Individual Ticket */}
                  <button
                    type="button"
                    onClick={() => setRegistrationType("INDIVIDUAL")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${registrationType === "INDIVIDUAL"
                      ? "border-[#D9001B] bg-red-50/40 shadow-md ring-2 ring-red-500/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User
                          className={`w-5 h-5 flex-shrink-0 ${registrationType === "INDIVIDUAL"
                            ? "text-[#D9001B]"
                            : "text-neutral-500"
                            }`}
                        />
                        <span className="font-bold text-base text-neutral-900">
                          Individual Ticket
                        </span>
                      </div>
                      {registrationType === "INDIVIDUAL" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D9001B] text-white uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      For single attendees, youth players, or guests. Pricing is calculated automatically based on each attendee&apos;s Date of Birth.
                    </p>

                  </button>

                  {/* Option B: Family Package */}
                  <button
                    type="button"
                    onClick={() => setRegistrationType("FAMILY")}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${registrationType === "FAMILY"
                      ? "border-[#D9001B] bg-red-50/40 shadow-md ring-2 ring-red-500/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users
                          className={`w-5 h-5 flex-shrink-0 ${registrationType === "FAMILY"
                            ? "text-[#D9001B]"
                            : "text-neutral-500"
                            }`}
                        />
                        <span className="font-bold text-base text-neutral-900">
                          Family Package
                        </span>
                      </div>
                     
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Add as many family members as you have. Automatic package discounts apply when eligible, or pay per member by age!
                    </p>

                  </button>
                </div>
              </div>

              {/* Step 2: Attendees Details (Mandatory Full Name & Date of Birth) */}
              <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-neutral-200/80 space-y-5 sm:space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h2 className="text-base sm:text-2xl font-bold text-neutral-900 leading-tight">
                        {registrationType === "FAMILY"
                          ? "Step 2: Family Members"
                          : "Step 2: Attendee Details"}
                      </h2>
                    </div>

                    {registrationType === "FAMILY" && (
                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-[#D9001B] text-white text-xs font-bold transition cursor-pointer flex-shrink-0 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 pl-10 sm:pl-12.5">
                    {registrationType === "FAMILY"
                      ? "Enter Full Name & Date of Birth for each family member."
                      : "Enter attendee Full Name & Date of Birth. Pricing is calculated by age."}
                  </p>
                </div>

                {/* Family Package Special Discount Alert Banner */}
                {registrationType === "FAMILY" && feeSummary?.familyPackageApplied !== "NONE" && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5 shadow-xs">
                    <Gift className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">
                        {feeSummary.familyPackageApplied === "FAMILY_OF_4"
                          ? "🎉 Family of 4 Special Discount Applied!"
                          : "🎉 Family of 5 Special Discount Applied!"}
                      </span>
                      <span className="block text-amber-800 mt-0.5">
                        Your family qualifies for the special package rate of{" "}
                        <strong>
                          ${feeSummary.familyPackageApplied === "FAMILY_OF_4" ? "125.00" : "145.00"} CAD
                        </strong>
                        {feeSummary.savings > 0 && (
                          <> (You saved ${feeSummary.savings.toFixed(2)} CAD compared to individual tickets!)</>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Attendee Form Rows */}
                <div className="space-y-4">
                  {activeAttendees.map((att, idx) => {
                    const age = calculateAge(att.dateOfBirth);
                    const categoryInfo =
                      age !== null ? getAttendeeCategory(age) : null;

                    const memberLabel =
                      registrationType === "FAMILY"
                        ? `Family Member #${idx + 1}`
                        : "Attendee Details (1 Individual Ticket)";

                    return (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 space-y-3 relative transition hover:border-neutral-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase text-neutral-700 tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 inline-flex items-center justify-center text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{memberLabel}</span>
                          </span>

                          {/* Delete button (only for Family when > 1 member) */}
                          {registrationType === "FAMILY" && familyAttendees.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(idx)}
                              className="text-neutral-400 hover:text-red-600 p-1 transition cursor-pointer flex items-center gap-1 text-xs"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Full Name (Required) */}
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Enter name"
                              value={att.name}
                              onChange={(e) =>
                                registrationType === "INDIVIDUAL"
                                  ? handleIndividualChange("name", e.target.value)
                                  : handleFamilyChange(idx, "name", e.target.value)
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#D9001B]"
                            />
                          </div>

                          {/* Date of Birth (Required with CustomDatePicker) */}
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <CustomDatePicker
                              value={att.dateOfBirth}
                              onChange={(val) =>
                                registrationType === "INDIVIDUAL"
                                  ? handleIndividualChange("dateOfBirth", val)
                                  : handleFamilyChange(idx, "dateOfBirth", val)
                              }
                              placeholder="YYYY-MM-DD"
                              required
                              minYear={1926}
                              maxYear={MAX_ATTENDEE_BIRTH_YEAR}
                              maxDate={MAX_ATTENDEE_BIRTH_DATE}
                            />
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Must be at least 5 years old (born on or before Dec 1, 2021).
                            </p>
                          </div>
                        </div>

                        {/* Calculated Age & Category Badge */}
                        {age !== null && categoryInfo && (
                          <div className="pt-0.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-neutral-600">
                                Age on Dec 1, 2026: <strong>{age} yrs</strong>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${categoryInfo.id === "under5"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : categoryInfo.id === "child5to10"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-neutral-200 text-neutral-800"
                                  }`}
                              >
                                {categoryInfo.label} &bull;{" "}
                                {categoryInfo.id === "under5"
                                  ? "FREE ($0.00)"
                                  : `$${categoryInfo.price.toFixed(2)} CAD`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Family Member Button Bottom Bar (Family only) */}
                {registrationType === "FAMILY" && (
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-red-500/60 bg-neutral-50 hover:bg-red-50/30 text-neutral-700 hover:text-[#D9001B] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Family Member</span>
                  </button>
                )}
              </div>

              {/* Step 3: Primary Contact Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 min-w-10 min-h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0 mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                      Step 3: Primary Contact Details
                    </h2>
                    {/* <p className="text-sm text-neutral-500 mt-0.5">
                      Where we will send your tickets and payment confirmation.
                    </p> */}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                      Contact Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={primaryContactName}
                      onChange={(e) => setPrimaryContactName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#D9001B] text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#D9001B] text-sm"
                      />
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-neutral-700 mb-1.5">
                      Contact Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneCountryInput
                      value={contactNumber}
                      onChange={setContactNumber}
                      selectedCountry={primaryCountry}
                      onCountryChange={setPrimaryCountry}
                      placeholder="Enter your number"
                      required
                    />
                  </div>

                  {/* Secondary Phone (Optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">
                      Alternative Phone Number (Optional)
                    </label>
                    <PhoneCountryInput
                      value={secondaryContactNumber}
                      onChange={setSecondaryContactNumber}
                      selectedCountry={secondaryCountry}
                      onCountryChange={setSecondaryCountry}
                      placeholder="Alternative number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Sticky Order Summary & Checkout Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#D9001B] to-amber-500" />

                <div className="flex items-center justify-between mb-5 pb-4 border-b border-neutral-100 gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                      Registration Summary
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {registrationType === "FAMILY"
                        ? "Family Registration"
                        : "Individual Registration"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 whitespace-nowrap flex-shrink-0">
                    {activeAttendees.length}{" "}
                    {activeAttendees.length === 1 ? "Attendee" : "Attendees"}
                  </span>
                </div>

                {/* Selected Tickets Itemized */}
                <div className="space-y-3 mb-6 text-sm">
                  {registrationType === "FAMILY" &&
                    feeSummary?.familyPackageApplied !== "NONE" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-neutral-900 font-bold">
                        <span>
                          {feeSummary.familyPackageApplied === "FAMILY_OF_4"
                            ? "Family of 4 Package Deal"
                            : "Family of 5 Package Deal"}
                        </span>
                        <span className="text-[#D9001B]">
                          ${feeSummary.subtotal.toFixed(2)} CAD
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Covers {activeAttendees.length} family members
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {feeSummary?.breakdown.ages11Plus.quantity ? (
                        <div className="flex items-center justify-between text-neutral-600">
                          <span>
                            Ages 11+ &times; {feeSummary.breakdown.ages11Plus.quantity}
                          </span>
                          <span className="font-semibold text-neutral-900">
                            ${feeSummary.breakdown.ages11Plus.subtotal.toFixed(2)} CAD
                          </span>
                        </div>
                      ) : null}

                      {feeSummary?.breakdown.child5to10.quantity ? (
                        <div className="flex items-center justify-between text-neutral-600">
                          <span>
                            Children (5–10) &times;{" "}
                            {feeSummary.breakdown.child5to10.quantity}
                          </span>
                          <span className="font-semibold text-neutral-900">
                            ${feeSummary.breakdown.child5to10.subtotal.toFixed(2)} CAD
                          </span>
                        </div>
                      ) : null}

                      {feeSummary?.breakdown.under5.quantity ? (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span>
                            Children Under 5 &times;{" "}
                            {feeSummary.breakdown.under5.quantity}
                          </span>
                          <span className="font-bold">FREE</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-200/80 space-y-2.5 text-sm">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Tickets Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      ${(feeSummary?.subtotal || 0).toFixed(2)} CAD
                    </span>
                  </div>

                  {/* 3% Processing fee */}
                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span>Processing Fee</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-700">
                        {YEAR_END_EVENT_CONFIG.processingFeePercent}%
                      </span>
                    </span>
                    <span className="font-semibold text-neutral-900">
                      ${(feeSummary?.processingFee || 0).toFixed(2)} CAD
                    </span>
                  </div>

                  {/* Final Total Amount */}
                  <div className="pt-3 border-t-2 border-neutral-900 flex items-baseline justify-between">
                    <div>
                      <span className="block text-base font-bold text-neutral-900">
                        Total Payable
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        All taxes and fees included
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#D9001B]">
                        ${(feeSummary?.totalAmount || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-neutral-500 ml-1">CAD</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit / Checkout Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-[#D9001B] hover:bg-[#b90017] text-white font-bold text-xs sm:text-sm md:text-base uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                      <span className="whitespace-nowrap">Processing Registration...</span>
                    </>
                  ) : feeSummary?.isComplimentary ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Confirm Free Registration</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Proceed to Checkout &rarr;</span>
                    </>
                  )}
                </button>

                {/* Trust & Security Footnote */}
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-neutral-400 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted &bull; Official Stripe Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
