"use client";

import React, { useState } from "react";
import PhoneCountryInput, {
  CountryItem,
  COUNTRIES,
  getCountryPhoneRule,
} from "@/components/ui/PhoneCountryInput";
import Toast from "@/components/ui/Toast";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { API_ENDPOINTS } from "@/constants/endpoints";

const GENDERS = ["Male", "Female", "Other"];
const RELATIONS = ["Mother", "Father", "Legal Guardian", "Other"];

export default function RegistrationForm() {
  // Required fields matching exact backend schema
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [parentGuardianName, setParentGuardianName] = useState("");
  const [relationToChild, setRelationToChild] = useState("Mother");
  const [email, setEmail] = useState("");
  const [primaryCountry, setPrimaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0],
  );
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState("");

  // Optional secondary contact
  const [secondaryCountry, setSecondaryCountry] = useState<CountryItem>(
    () => COUNTRIES.find((c) => c.code === "CA") || COUNTRIES[0],
  );
  const [secondaryContactNumber, setSecondaryContactNumber] = useState("");
  const [secondaryRelationToChild, setSecondaryRelationToChild] =
    useState("Father");

  // Optional address fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Toronto");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Canada");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "error" | "success" | "warning" | "info";
    title?: string;
    message: string;
  } | null>(null);
  const [successData, setSuccessData] = useState<{
    id?: string;
    childName?: string;
    parentGuardianName?: string;
    email?: string;
    contactNumber?: string;
  } | null>(null);

  const resetForm = () => {
    setChildName("");
    setDateOfBirth("");
    setGender("Male");
    setParentGuardianName("");
    setRelationToChild("Mother");
    setEmail("");
    setContactNumber("");
    setMessage("");
    setSecondaryContactNumber("");
    setSecondaryRelationToChild("Father");
    setAddress("");
    setCity("Toronto");
    setPostalCode("");
    setCountry("Canada");
    setErrorMessage(null);
    setToast(null);
    setSuccessData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const triggerError = (msg: string) => {
      setErrorMessage(msg);
      setToast({
        type: "error",
        title: "Validation Error",
        message: msg,
      });
    };

    // Basic Validations
    if (!childName.trim()) {
      triggerError("Child name is required.");
      return;
    }
    if (!dateOfBirth) {
      triggerError("Date of birth is required.");
      return;
    }
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 3) {
      triggerError("Child must be at least 3 years old to register.");
      return;
    }
    if (!parentGuardianName.trim()) {
      triggerError("Parent/Guardian name is required.");
      return;
    }
    if (!relationToChild.trim()) {
      triggerError("Relation to child is required.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      triggerError("Please enter a valid email address.");
      return;
    }
    const cleanPhone = contactNumber.trim().replace(/\D/g, "");
    const primaryRule = getCountryPhoneRule(primaryCountry.code);
    if (!cleanPhone) {
      triggerError("Contact number is required.");
      return;
    }
    if (cleanPhone.length !== primaryRule.maxLength) {
      triggerError(
        `Please enter a valid ${primaryRule.maxLength}-digit contact number for ${primaryCountry.name}.`,
      );
      return;
    }
    if (!message.trim()) {
      triggerError("Message is required.");
      return;
    }

    // Clean secondary contact number if provided
    const cleanSecondaryPhone = secondaryContactNumber
      .trim()
      .replace(/\D/g, "");
    if (cleanSecondaryPhone) {
      const secondaryRule = getCountryPhoneRule(secondaryCountry.code);
      if (cleanSecondaryPhone.length !== secondaryRule.maxLength) {
        triggerError(
          `Please enter a valid ${secondaryRule.maxLength}-digit secondary contact number for ${secondaryCountry.name}.`,
        );
        return;
      }
    }

    // Exact payload matching backend requirements with no extra keys
    const payload: Record<string, string> = {
      childName: childName.trim(),
      dateOfBirth,
      gender,
      parentGuardianName: parentGuardianName.trim(),
      relationToChild: relationToChild.trim(),
      email: email.trim().toLowerCase(),
      countryCode: primaryCountry.dial,
      contactNumber: cleanPhone,
      message: message.trim(),
    };

    if (cleanSecondaryPhone) {
      payload.secondaryCountryCode = secondaryCountry.dial;
      payload.secondaryContactNumber = cleanSecondaryPhone;
      payload.secondaryRelationToChild = secondaryRelationToChild.trim();
    }

    if (address.trim()) payload.address = address.trim();
    if (city.trim()) payload.city = city.trim();
    if (postalCode.trim()) payload.postalCode = postalCode.trim();
    if (country.trim()) payload.country = country.trim();

    setIsSubmitting(true);

    try {
      const res = await fetch(API_ENDPOINTS.JOIN_OUR_CLUB, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to submit form.");
      }

      setSuccessData(json.data || { childName, email, contactNumber });
      setToast({
        type: "success",
        title: "Registration Submitted",
        message:
          json.message || "Your join request has been submitted successfully.",
      });
    } catch (err: any) {
      console.error("Join Our Club error:", err);
      const msg =
        err.message || "Something went wrong while submitting the form.";
      setErrorMessage(msg);
      setToast({
        type: "error",
        title: "Submission Failed",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-white select-none py-10 sm:py-16 relative">
      {/* Dynamic Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
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
            JOIN OUR CLUB
          </h2>
        </div>

        {/* Success Confirmation Card */}
        {successData ? (
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
              REGISTRATION SUBMITTED SUCCESSFULLY!
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6">
              Thank you! The registration request for{" "}
              <strong className="text-neutral-900 font-bold">
                {successData.childName || childName}
              </strong>{" "}
              has been submitted. We will contact{" "}
              <strong className="text-neutral-900 font-bold">
                {successData.email || email}
              </strong>{" "}
              shortly.
            </p>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 text-left text-xs sm:text-sm text-neutral-600 mb-6 space-y-1.5">
              <p>
                <strong>Child Name:</strong> {childName}
              </p>
              <p>
                <strong>Parent / Guardian:</strong> {parentGuardianName} (
                {relationToChild})
              </p>
              <p>
                <strong>Contact:</strong> {primaryCountry.dial} {contactNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 rounded-lg bg-[#DE2027] hover:bg-[#c41920] text-white font-bold text-sm tracking-wide shadow-sm transition cursor-pointer"
            >
              Submit Another Registration
            </button>
          </div>
        ) : (
          /* The Form */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 max-w-5xl"
          >
            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 font-medium">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                >
                  &times;
                </button>
              </div>
            )}

            {/* ─── 1. CHILD DETAILS ─── */}
            <div className="bg-neutral-50/80 p-5 sm:p-7 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#DE2027]" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-wide uppercase">
                  1. Child Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* childName */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Child Name <span className="text-[#DE2027]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>

                {/* dateOfBirth */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Date of Birth <span className="text-[#DE2027]">*</span>
                  </label>
                  <CustomDatePicker
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder="YYYY-MM-DD"
                    required
                    maxDate={new Date(new Date().getFullYear() - 3, new Date().getMonth(), new Date().getDate())}
                    minYear={1926}
                    maxYear={new Date().getFullYear() - 3}
                  />
                </div>

                {/* gender */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Gender <span className="text-[#DE2027]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded border transition cursor-pointer text-center ${
                          gender === g
                            ? "border-[#DE2027] bg-[#DE2027] text-white"
                            : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── 2. PARENT / GUARDIAN CONTACT DETAILS ─── */}
            <div className="bg-neutral-50/80 p-5 sm:p-7 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#DE2027]" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-wide uppercase">
                  2. Parent / Guardian Contact
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* parentGuardianName */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Parent / Guardian Name{" "}
                    <span className="text-[#DE2027]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Smith"
                    value={parentGuardianName}
                    onChange={(e) => setParentGuardianName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>

                {/* relationToChild */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Relation to Child <span className="text-[#DE2027]">*</span>
                  </label>
                  <select
                    value={relationToChild}
                    onChange={(e) => setRelationToChild(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-neutral-500 transition cursor-pointer"
                  >
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* email */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Email <span className="text-[#DE2027]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@yopmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition"
                  />
                </div>

                {/* countryCode + contactNumber */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                    Contact Number <span className="text-[#DE2027]">*</span>
                  </label>
                  <PhoneCountryInput
                    required
                    value={contactNumber}
                    onChange={setContactNumber}
                    selectedCountry={primaryCountry}
                    onCountryChange={setPrimaryCountry}
                    defaultCountryCode="CA"
                  />
                </div>
              </div>
            </div>

            {/* ─── 3. SECONDARY CONTACT (OPTIONAL) ─── */}
            <div className="bg-neutral-50/80 p-5 sm:p-7 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-800 tracking-wide uppercase">
                  3. Secondary Contact (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* secondaryCountryCode + secondaryContactNumber */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                    Secondary Contact Number
                  </label>
                  <PhoneCountryInput
                    value={secondaryContactNumber}
                    onChange={setSecondaryContactNumber}
                    selectedCountry={secondaryCountry}
                    onCountryChange={setSecondaryCountry}
                    defaultCountryCode="CA"
                  />
                </div>

                {/* secondaryRelationToChild */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                    Secondary Relation to Child
                  </label>
                  <select
                    value={secondaryRelationToChild}
                    onChange={(e) =>
                      setSecondaryRelationToChild(e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-neutral-500 transition cursor-pointer"
                  >
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── 4. ADDRESS (OPTIONAL) ─── */}
            <div className="bg-neutral-50/80 p-5 sm:p-7 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-800 tracking-wide uppercase">
                  4. Address (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* address */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500"
                  />
                </div>

                {/* city */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Toronto"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-neutral-500"
                  />
                </div>

                {/* postalCode */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="M1A 1A1"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="mt-4 max-w-xs">
                {/* country */}
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Canada"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            {/* ─── 5. MESSAGE ─── */}
            <div className="bg-neutral-50/80 p-5 sm:p-7 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#DE2027]" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-wide uppercase">
                  5. Message <span className="text-[#DE2027]">*</span>
                </h3>
              </div>

              <textarea
                rows={3}
                required
                placeholder="Interested in joining the club."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 rounded bg-[#DE2027] hover:bg-[#c41920] active:bg-[#a8141a] text-white font-bold text-sm sm:text-base tracking-wide shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
