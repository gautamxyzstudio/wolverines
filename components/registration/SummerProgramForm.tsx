"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import PhoneCountryInput, {
  CountryItem,
  COUNTRIES,
} from "@/components/ui/PhoneCountryInput";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface ChildEntry {
  id: string;
  childName: string;
  dateOfBirth: string;
  gender: string;
}

const GENDERS = ["Male", "Female", "Other"];
const RELATIONS = ["Father", "Mother", "Legal Guardian", "Other"];

// Helper to calculate age from YYYY-MM-DD
function calculateAge(dateStr: string): number | null {
  if (!dateStr) return null;
  const birthDate = new Date(`${dateStr}T00:00:00`);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function SummerProgramForm() {
  // 1. Children List (Initial 1 child, user can click Add Child to add more)
  const [children, setChildren] = useState<ChildEntry[]>([
    { id: "child-1", childName: "", dateOfBirth: "", gender: "Select Gender" },
  ]);

  // 2. Parent / Guardian Info
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [relationToChild, setRelationToChild] = useState("Select Relation");
  const [email, setEmail] = useState("");

  // Primary Phone with full country picker (default Canada as requested)
  const [primaryCountry, setPrimaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0]
  );
  const [contactNumber, setContactNumber] = useState("");

  // 3. Child Notes / Allergies
  const [message, setMessage] = useState("");

  // 4. Secondary Contact (Optional) with full country picker (default Canada)
  const [secondaryCountry, setSecondaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0]
  );
  const [secondaryContactNumber, setSecondaryContactNumber] = useState("");
  const [secondaryRelationToChild, setSecondaryRelationToChild] = useState("Select Relation");

  // Minimum age 3 years: Maximum allowed birth date is 3 years ago from today
  const maxBirthDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    return d;
  }, []);
  const maxBirthYear = maxBirthDate.getFullYear();

  // 5. Address (Optional)
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Canada");

  // 6. Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "error" | "success" | "warning" | "info";
    title?: string;
    message: string;
  } | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    registrationId?: string;
    totalAmount?: number;
    paymentUrl?: string | null;
  } | null>(null);

  // Dynamic Add / Remove Children
  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        id: `child-${Date.now()}`,
        childName: "",
        dateOfBirth: "",
        gender: "Select Gender",
      },
    ]);
  };

  const removeChild = () => {
    if (children.length > 1) {
      setChildren((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const updateChild = (id: string, field: keyof ChildEntry, value: string) => {
    setChildren((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Program Fee Calculation matching backend & screenshot
  const { countUnder7, countAbove7, subtotal, siblingDiscount, processingFee, total } =
    useMemo(() => {
      let under7 = 0;
      let above7 = 0;

      children.forEach((c) => {
        const age = calculateAge(c.dateOfBirth);
        if (age !== null) {
          if (age <= 7) {
            under7++;
          } else {
            above7++;
          }
        }
      });

      const feeUnder7 = under7 * 360;
      const feeAbove7 = above7 * 560;
      const sub = feeUnder7 + feeAbove7;

      const totalKids = under7 + above7;
      const discount = totalKids > 1 ? (totalKids - 1) * 30 : 0;
      const procFee = 0.0;
      const finalTotal = Math.max(0, sub - discount + procFee);

      return {
        countUnder7: under7,
        countAbove7: above7,
        subtotal: sub,
        siblingDiscount: discount,
        processingFee: procFee,
        total: finalTotal,
      };
    }, [children]);

  // Form Submit Handler matching /api/pending-summer-camp payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setToast({
        type: "error",
        title: "Terms Required",
        message: "Please agree to the Terms and Privacy Policy before submitting.",
      });
      return;
    }

    // Filter valid children
    const validChildren = children.filter((c) => c.childName.trim().length > 0);

    if (validChildren.length === 0) {
      setToast({
        type: "error",
        title: "Child Information Required",
        message: "Please enter at least one child's details.",
      });
      return;
    }

    for (let i = 0; i < validChildren.length; i++) {
      const ch = validChildren[i];
      if (!ch.dateOfBirth) {
        setToast({
          type: "error",
          title: "Date of Birth Required",
          message: `Please select date of birth for ${ch.childName}.`,
        });
        return;
      }
      const age = calculateAge(ch.dateOfBirth);
      if (age === null || age < 3) {
        setToast({
          type: "error",
          title: "Minimum Age Requirement",
          message: `${ch.childName} must be at least 3 years old to register.`,
        });
        return;
      }
      if (ch.gender === "Select Gender") {
        setToast({
          type: "error",
          title: "Gender Required",
          message: `Please select gender for ${ch.childName}.`,
        });
        return;
      }
    }

    if (!parentGuardianName.trim()) {
      setToast({
        type: "error",
        title: "Parent Name Required",
        message: "Please enter parent/guardian name.",
      });
      return;
    }

    if (relationToChild === "Select Relation") {
      setToast({
        type: "error",
        title: "Relation Required",
        message: "Please select your relation to the child.",
      });
      return;
    }

    if (!email.trim()) {
      setToast({
        type: "error",
        title: "Email Required",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!contactNumber.trim()) {
      setToast({
        type: "error",
        title: "Contact Number Required",
        message: "Please enter a valid phone number.",
      });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    // Exact backend payload requested by user
    const payload = {
      parentGuardianName: parentGuardianName.trim(),
      relationToChild: relationToChild,
      email: email.trim().toLowerCase(),
      countryCode: primaryCountry.dial,
      contactNumber: contactNumber.trim().replace(/\D/g, ""),
      secondaryCountryCode: secondaryContactNumber.trim() ? secondaryCountry.dial : null,
      secondaryContactNumber: secondaryContactNumber.trim()
        ? secondaryContactNumber.trim().replace(/\D/g, "")
        : null,
      address: address.trim() || null,
      city: city.trim() || null,
      postalCode: postalCode.trim() || null,
      country: country.trim() || null,
      message: message.trim() || null,
      children: validChildren.map((c) => ({
        childName: c.childName.trim(),
        dateOfBirth: c.dateOfBirth,
        gender: c.gender,
      })),
    };

    try {
      const response = await fetch(API_ENDPOINTS.PENDING_SUMMER_CAMP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        let errorMsg = resData?.message || "Failed to create summer camp registration.";
        if (resData?.errors) {
          const firstErrField = Object.keys(resData.errors)[0];
          if (firstErrField && resData.errors[firstErrField]?.length) {
            errorMsg = `${firstErrField}: ${resData.errors[firstErrField][0]}`;
          }
        }
        throw new Error(errorMsg);
      }

      setSuccessInfo({
        registrationId: resData?.data?.registrationId,
        totalAmount: resData?.data?.totalAmount,
        paymentUrl: resData?.data?.paymentUrl,
      });

      setToast({
        type: "success",
        title: "Registration Created!",
        message: "Pending summer camp registration created successfully.",
      });

      // If Stripe payment URL is provided, redirect to checkout
      if (resData?.data?.paymentUrl) {
        window.location.href = resData.data.paymentUrl;
      }
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Registration Failed",
        message: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-neutral-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* 1. Top Graphic Banner: SMALL PLAYERS BIG DREAMS */}
      <div className="w-full relative overflow-hidden bg-white">
        <div className="site-container px-0 sm:px-4">
          <div className="w-full relative h-[140px] sm:h-[220px] md:h-[280px] lg:h-[340px] overflow-hidden rounded-none sm:rounded-xl">
            <Image
              src="/images/summer_program_banner.png"
              alt="Small Players Big Dreams - Wolverines Summer Program Banner"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Title */}
      <div className="site-container">
        <h2
          className="elementor-heading-title elementor-size-default text-5xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[156px] font-normal uppercase text-[#181818] text-center my-6 sm:my-8 leading-none tracking-normal"
          style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", var(--font-open-sans), "Open Sans", sans-serif' }}
        >
          SUMMER PROGRAM
        </h2>

        {/* Success State */}
        {successInfo ? (
          <div className="max-w-2xl mx-auto p-8 bg-green-50 border border-green-200 rounded-2xl text-center shadow-xs">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>
            <h2
              className="text-2xl sm:text-3xl font-normal uppercase text-neutral-900 mb-2"
              style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
            >
              REGISTRATION SUBMITTED
            </h2>
            <p className="text-neutral-700 font-mono font-bold text-sm sm:text-base mb-2">
              Registration ID: {successInfo.registrationId}
            </p>
            {successInfo.totalAmount !== undefined && (
              <p className="text-neutral-900 font-bold text-lg mb-4">
                Total Amount: ${successInfo.totalAmount.toFixed(2)} CAD
              </p>
            )}
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6">
              Thank you for registering for The Wolverines Summer Program! A confirmation has been recorded.
            </p>

            {successInfo.paymentUrl ? (
              <a
                href={successInfo.paymentUrl}
                className="inline-block px-8 py-3 bg-[#DE2027] hover:bg-[#b91c1c] text-white font-bold rounded text-sm uppercase tracking-wider transition"
              >
                Proceed to Payment
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSuccessInfo(null);
                  setChildren([
                    { id: "child-1", childName: "", dateOfBirth: "", gender: "Select Gender" },
                  ]);
                  setParentGuardianName("");
                  setEmail("");
                  setContactNumber("");
                  setMessage("");
                }}
                className="px-6 py-2.5 bg-[#DE2027] hover:bg-[#b91c1c] text-white font-semibold rounded text-sm transition"
              >
                Register Another Child
              </button>
            )}
          </div>
        ) : (
          /* 3. Registration Form */
          <form onSubmit={handleSubmit} className="w-full">
            {/* Children Info Box */}
            <div className="mb-6">
              <span className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Children info
              </span>
              <div className="bg-[#fbfbfb] border border-neutral-200/90 rounded-md p-4 sm:p-5">
                {children.map((child, index) => (
                  <div
                    key={child.id}
                    className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 ${
                      index > 0 ? "pt-3.5 mt-3.5 border-t border-neutral-200/70" : ""
                    }`}
                  >
                    {/* Children Name */}
                    <div>
                      <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                        Children Name <span className="text-[#DE2027]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Name"
                        value={child.childName}
                        onChange={(e) => updateChild(child.id, "childName", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                        Date of Birth <span className="text-[#DE2027]">*</span>
                      </label>
                      <CustomDatePicker
                        value={child.dateOfBirth}
                        onChange={(val) => updateChild(child.id, "dateOfBirth", val)}
                        placeholder="YYYY-MM-DD"
                        required
                        maxDate={maxBirthDate}
                        minYear={1926}
                        maxYear={maxBirthYear}
                      />
                    </div>

                    {/* Select Gender */}
                    <div>
                      <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                        Select Gender <span className="text-[#DE2027]">*</span>
                      </label>
                      <select
                        value={child.gender}
                        onChange={(e) => updateChild(child.id, "gender", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 text-neutral-700"
                      >
                        <option value="Select Gender" disabled>
                          Select Gender
                        </option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* Add / Remove Child Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={addChild}
                    className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer"
                  >
                    Add Child
                  </button>
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={removeChild}
                      className="bg-[#DE2027] hover:bg-[#b91c1c] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer"
                    >
                      Remove Child
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Parents/Guardian Name & Relation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Parents/Guardian Name <span className="text-[#DE2027]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Name"
                  value={parentGuardianName}
                  onChange={(e) => setParentGuardianName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Relation to Child <span className="text-[#DE2027]">*</span>
                </label>
                <select
                  value={relationToChild}
                  onChange={(e) => setRelationToChild(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 text-neutral-700"
                >
                  <option value="Select Relation" disabled>
                    Select Relation
                  </option>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email & Contact Number with Country Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Email <span className="text-[#DE2027]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Contact Number <span className="text-[#DE2027]">*</span>
                </label>
                <PhoneCountryInput
                  value={contactNumber}
                  onChange={setContactNumber}
                  selectedCountry={primaryCountry}
                  onCountryChange={setPrimaryCountry}
                  required
                  placeholder="000-000-0000"
                />
              </div>
            </div>

            {/* Message / Allergies */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                Anything you would like to share about the child (e.g., allergies or other concerns)?{" "}
                <span className="text-[#DE2027]">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400 resize-y"
              />
            </div>

            {/* Secondary Contact (Optional) with Country Selector & Relation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Secondary Contact(optional)
                </label>
                <PhoneCountryInput
                  value={secondaryContactNumber}
                  onChange={setSecondaryContactNumber}
                  selectedCountry={secondaryCountry}
                  onCountryChange={setSecondaryCountry}
                  placeholder="000-000-0000"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Relation to Child
                </label>
                <select
                  value={secondaryRelationToChild}
                  onChange={(e) => setSecondaryRelationToChild(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 text-neutral-700"
                >
                  <option value="Select Relation">Select Relation</option>
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Postal Code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 text-neutral-700"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Terms and Condition */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-neutral-800 mb-1">
                Terms and Condition <span className="text-[#DE2027]">*</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[#DE2027] focus:ring-[#DE2027]"
                />
                <span className="text-xs sm:text-[13px] text-neutral-600">
                  By registering, you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-[#2271b1] hover:underline"
                  >
                    Terms and Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* PROGRAM FEE BREAKDOWN */}
            <div className="pt-2 pb-6 text-neutral-900 font-sans border-t border-neutral-200/80">
              <h3
                className="text-lg sm:text-xl font-normal uppercase text-black mb-3 tracking-wide"
                style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
              >
                PROGRAM FEE BREAKDOWN
              </h3>

              <div className="space-y-1 text-xs sm:text-[13.5px] font-bold text-neutral-800 uppercase tracking-tight">
                <p>AFTER AGES (3YRS-7YRS): {countUnder7} × $360</p>
                <p>BEFORE ABOVE 7YRS: {countAbove7} × $560</p>
                <p>SUBTOTAL: ${subtotal}</p>
                <p>SIBLING DISCOUNT: -${siblingDiscount}</p>
                <p>PROCESSING FEE: +${processingFee.toFixed(2)}</p>
                <div className="w-48 border-b border-neutral-400 my-1.5" />
                <p className="text-sm sm:text-base font-extrabold text-black">
                  TOTAL AMOUNT PAYABLE: ${total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#DE2027] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-sm sm:text-base rounded uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Registration..." : "Complete Registration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
