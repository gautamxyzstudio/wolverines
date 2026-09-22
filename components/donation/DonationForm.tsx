"use client";

import React, { useState } from "react";
import PhoneCountryInput, {
  CountryItem,
  COUNTRIES,
} from "@/components/ui/PhoneCountryInput";
import Toast, { ToastType } from "@/components/ui/Toast";
import { API_ENDPOINTS } from "@/constants/endpoints";

export default function DonationForm() {
  // Form fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(() => {
    return COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0];
  });
  const [contactNumber, setContactNumber] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [acknowledgement, setAcknowledgement] = useState<"ACKNOWLEDGE" | "ANONYMOUS">("ACKNOWLEDGE");

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{
    id?: string;
    amount?: number;
    donorName?: string;
    email?: string;
  } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setToast({ message: "Please enter your name.", type: "error" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setToast({ message: "Please enter your email address.", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setToast({ message: "Invalid email address format.", type: "error" });
      return;
    }

    const trimmedPhone = contactNumber.trim();
    if (!trimmedPhone) {
      setToast({ message: "Please enter your contact number.", type: "error" });
      return;
    }

    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum < 100) {
      setToast({ message: "Minimum donation amount is 100 CAD.", type: "error" });
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        donorName: trimmedName,
        email: trimmedEmail,
        countryCode: selectedCountry.dial,
        amount: Number(amountNum.toFixed(2)),
        contactNumber: trimmedPhone,
        acknowledgement: acknowledgement, // "ACKNOWLEDGE" or "ANONYMOUS"
      };

      const res = await fetch(API_ENDPOINTS.PENDING_DONATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setToast({
          message: result.message || "Failed to create donation inquiry.",
          type: "error",
        });
        return;
      }

      setSubmittedInfo({
        id: result.data?.id,
        amount: result.data?.amount || amountNum,
        donorName: trimmedName,
        email: trimmedEmail,
      });

      setToast({
        message: result.message || "Donation created successfully!",
        type: "success",
      });

      // Redirect to Stripe checkout URL if returned
      if (result.data?.paymentUrl) {
        setTimeout(() => {
          window.location.href = result.data.paymentUrl;
        }, 1000);
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setToast({
        message: "Network error. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full bg-white select-none py-10 sm:py-14">
      {/* Self-contained animations for Donation Form */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes donationFormFadeIn {
              0% {
                opacity: 0;
                transform: translateY(24px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-donation-form {
              animation: donationFormFadeIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
            }
          `,
        }}
      />
      <div className="site-container">
        {/* Section Header with Official Brand Red Gradient Bar */}
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <div
            className="w-[8px] sm:w-[10px] h-[30px] sm:h-[36px] flex-shrink-0"
            style={{
              background:
                "linear-gradient(180deg, #D32F2F 0%, #dc2626 22%, #f87171 65%, #ffffff 100%)",
            }}
          />
          <h2
            className="text-2xl sm:text-3xl lg:text-[34px] font-normal uppercase text-neutral-900 tracking-wide leading-none"
            style={{
              fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
            }}
          >
            BASIC DETAILS
          </h2>
        </div>

        {isSubmitted ? (
          /* Thank You State */
          <div className="bg-neutral-50 rounded-2xl p-8 sm:p-12 border border-neutral-200 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>
            <h3
              className="text-3xl sm:text-4xl font-normal uppercase text-neutral-900 mb-3"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
              }}
            >
              THANK YOU FOR YOUR DONATION!
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6">
              Your contribution of{" "}
              <strong className="text-neutral-900 font-bold">
                ${(submittedInfo?.amount || parseFloat(donationAmount || "100")).toFixed(2)} CAD
              </strong>{" "}
              helps Wolverines Field Hockey Club empower youth athletes across Abbotsford and British Columbia.
            </p>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-left text-xs sm:text-sm text-neutral-600 mb-6 space-y-1.5">
              {submittedInfo?.id && (
                <p>
                  <strong>Confirmation ID:</strong> {submittedInfo.id}
                </p>
              )}
              <p>
                <strong>Donor Name:</strong> {acknowledgement === "ANONYMOUS" ? "Anonymous Supporter" : (submittedInfo?.donorName || fullName)}
              </p>
              <p>
                <strong>Receipt Sent To:</strong> {submittedInfo?.email || email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedInfo(null);
                setDonationAmount("");
                setFullName("");
                setEmail("");
                setContactNumber("");
              }}
              className="px-8 py-3 rounded-lg bg-[#DE2027] hover:bg-[#c41920] text-white font-bold text-sm tracking-wide shadow-sm transition cursor-pointer"
            >
              Make Another Donation
            </button>
          </div>
        ) : (
          /* The Form */
          <form noValidate onSubmit={handleSubmit} className="space-y-6 max-w-5xl animate-donation-form">
            {/* ROW 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Name <span className="text-[#DE2027]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Email <span className="text-[#DE2027]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Please enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
            </div>

            {/* ROW 2: Contact Number & Donation Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Contact Number <span className="text-[#DE2027]">*</span>
                </label>
                <PhoneCountryInput
                  required
                  value={contactNumber}
                  onChange={setContactNumber}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  defaultCountryCode="CA"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Donation Amount <span className="text-[#DE2027]">*</span>
                </label>
                <div className="relative flex items-center rounded border border-neutral-300 bg-white focus-within:border-neutral-500 transition">
                  <input
                    type="number"
                    min="100"
                    step="any"
                    required
                    placeholder="Minimum donation $100"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full pl-4 pr-14 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
                  />
                  <span className="absolute right-3.5 text-xs font-semibold text-neutral-500 tracking-wider">
                    CAD
                  </span>
                </div>
              </div>
            </div>

            {/* Permission to Acknowledge Donation Publicly */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-neutral-800 mb-3">
                Permission to Acknowledge Donation Publicly <span className="text-[#DE2027]">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="radio"
                    name="acknowledgement"
                    checked={acknowledgement === "ACKNOWLEDGE"}
                    onChange={() => setAcknowledgement("ACKNOWLEDGE")}
                    className="w-4 h-4 text-[#DE2027] border-neutral-300 focus:ring-0 accent-[#DE2027] cursor-pointer"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                    Yes, you may acknowledge my donation publicly.
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="radio"
                    name="acknowledgement"
                    checked={acknowledgement === "ANONYMOUS"}
                    onChange={() => setAcknowledgement("ANONYMOUS")}
                    className="w-4 h-4 text-[#DE2027] border-neutral-300 focus:ring-0 accent-[#DE2027] cursor-pointer"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                    Please keep my donation anonymous.
                  </span>
                </label>
              </div>
            </div>


            {/* Donate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-10 py-3 rounded bg-[#DE2027] hover:bg-[#c41920] active:bg-[#a8141a] text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Donate"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
