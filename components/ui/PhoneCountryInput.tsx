"use client";

import React, { useState, useRef, useEffect } from "react";

export interface CountryItem {
  name: string;
  code: string;
  dial: string;
}

export const COUNTRIES: CountryItem[] = [
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Afghanistan", code: "AF", dial: "+93" },
  { name: "Åland Islands", code: "AX", dial: "+358" },
  { name: "Albania", code: "AL", dial: "+355" },
  { name: "Algeria", code: "DZ", dial: "+213" },
  { name: "American Samoa", code: "AS", dial: "+1684" },
  { name: "Andorra", code: "AD", dial: "+376" },
  { name: "Angola", code: "AO", dial: "+244" },
  { name: "Anguilla", code: "AI", dial: "+1264" },
  { name: "Antarctica", code: "AQ", dial: "+672" },
  { name: "Antigua and Barbuda", code: "AG", dial: "+1268" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Armenia", code: "AM", dial: "+374" },
  { name: "Aruba", code: "AW", dial: "+297" },
  { name: "Austria", code: "AT", dial: "+43" },
  { name: "Azerbaijan", code: "AZ", dial: "+994" },
  { name: "Bahamas", code: "BS", dial: "+1242" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Barbados", code: "BB", dial: "+1246" },
  { name: "Belarus", code: "BY", dial: "+375" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Belize", code: "BZ", dial: "+501" },
  { name: "Benin", code: "BJ", dial: "+229" },
  { name: "Bermuda", code: "BM", dial: "+1441" },
  { name: "Bhutan", code: "BT", dial: "+975" },
  { name: "Bolivia", code: "BO", dial: "+591" },
  { name: "Bosnia and Herzegovina", code: "BA", dial: "+387" },
  { name: "Botswana", code: "BW", dial: "+267" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Bulgaria", code: "BG", dial: "+359" },
  { name: "Cambodia", code: "KH", dial: "+855" },
  { name: "Cameroon", code: "CM", dial: "+237" },
  { name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Costa Rica", code: "CR", dial: "+506" },
  { name: "Croatia", code: "HR", dial: "+385" },
  { name: "Cyprus", code: "CY", dial: "+357" },
  { name: "Czech Republic", code: "CZ", dial: "+420" },
  { name: "Denmark", code: "DK", dial: "+45" },
  { name: "Dominican Republic", code: "DO", dial: "+1809" },
  { name: "Ecuador", code: "EC", dial: "+593" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "Estonia", code: "EE", dial: "+372" },
  { name: "Ethiopia", code: "ET", dial: "+251" },
  { name: "Fiji", code: "FJ", dial: "+679" },
  { name: "Finland", code: "FI", dial: "+358" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Greece", code: "GR", dial: "+30" },
  { name: "Hong Kong", code: "HK", dial: "+852" },
  { name: "Hungary", code: "HU", dial: "+36" },
  { name: "Iceland", code: "IS", dial: "+354" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Jamaica", code: "JM", dial: "+1876" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Kazakhstan", code: "KZ", dial: "+7" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Morocco", code: "MA", dial: "+212" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "Norway", code: "NO", dial: "+47" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "Romania", code: "RO", dial: "+40" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "South Korea", code: "KR", dial: "+82" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Taiwan", code: "TW", dial: "+886" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "Vietnam", code: "VN", dial: "+84" },
];

/**
 * Standard national phone number length & placeholder per country
 */
export const COUNTRY_PHONE_RULES: Record<
  string,
  { maxLength: number; placeholder: string }
> = {
  CA: { maxLength: 10, placeholder: "4165551234" },
  US: { maxLength: 10, placeholder: "2025550143" },
  IN: { maxLength: 10, placeholder: "9876543210" },
  GB: { maxLength: 10, placeholder: "7911123456" },
  AU: { maxLength: 9, placeholder: "412345678" },
  NZ: { maxLength: 9, placeholder: "211234567" },
  PK: { maxLength: 10, placeholder: "3001234567" },
  BD: { maxLength: 10, placeholder: "1712345678" },
  AE: { maxLength: 9, placeholder: "501234567" },
  SA: { maxLength: 9, placeholder: "501234567" },
  QA: { maxLength: 8, placeholder: "33123456" },
  KW: { maxLength: 8, placeholder: "99123456" },
  BH: { maxLength: 8, placeholder: "39123456" },
  OM: { maxLength: 8, placeholder: "91234567" },
  SG: { maxLength: 8, placeholder: "81234567" },
  HK: { maxLength: 8, placeholder: "91234567" },
  MY: { maxLength: 10, placeholder: "123456789" },
  PH: { maxLength: 10, placeholder: "9171234567" },
  NP: { maxLength: 10, placeholder: "9841234567" },
  LK: { maxLength: 9, placeholder: "712345678" },
  CN: { maxLength: 11, placeholder: "13800138000" },
  JP: { maxLength: 10, placeholder: "9012345678" },
  KR: { maxLength: 10, placeholder: "1012345678" },
  DE: { maxLength: 11, placeholder: "15112345678" },
  FR: { maxLength: 9, placeholder: "612345678" },
  IT: { maxLength: 10, placeholder: "3123456789" },
  ES: { maxLength: 9, placeholder: "612345678" },
  NL: { maxLength: 9, placeholder: "612345678" },
  SE: { maxLength: 9, placeholder: "701234567" },
  NO: { maxLength: 8, placeholder: "41234567" },
  DK: { maxLength: 8, placeholder: "20123456" },
  FI: { maxLength: 10, placeholder: "401234567" },
  CH: { maxLength: 9, placeholder: "781234567" },
  BE: { maxLength: 9, placeholder: "470123456" },
  AT: { maxLength: 10, placeholder: "6641234567" },
  IE: { maxLength: 9, placeholder: "831234567" },
  PL: { maxLength: 9, placeholder: "512345678" },
  PT: { maxLength: 9, placeholder: "912345678" },
  TR: { maxLength: 10, placeholder: "5321234567" },
  ZA: { maxLength: 9, placeholder: "711234567" },
  BR: { maxLength: 11, placeholder: "11912345678" },
  MX: { maxLength: 10, placeholder: "5512345678" },
};

export const getCountryPhoneRule = (countryCode: string) => {
  return (
    COUNTRY_PHONE_RULES[countryCode] || {
      maxLength: 10,
      placeholder: "1234567890",
    }
  );
};

interface PhoneCountryInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedCountry?: CountryItem;
  onCountryChange?: (country: CountryItem) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneCountryInput({
  value,
  onChange,
  selectedCountry: controlledCountry,
  onCountryChange,
  defaultCountryCode = "CA",
  placeholder,
  required = false,
}: PhoneCountryInputProps) {
  const [internalCountry, setInternalCountry] = useState<CountryItem>(() => {
    return (
      COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0]
    );
  });

  const activeCountry = controlledCountry || internalCountry;
  const currentRule = getCountryPhoneRule(activeCountry.code);
  const activePlaceholder = placeholder || currentRule.placeholder;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCountry = (country: CountryItem) => {
    if (onCountryChange) {
      onCountryChange(country);
    } else {
      setInternalCountry(country);
    }
    setIsOpen(false);
    setSearchQuery("");
    phoneInputRef.current?.focus();

    // If existing value is longer than new country's max length, truncate it
    const newRule = getCountryPhoneRule(country.code);
    if (value && value.length > newRule.maxLength) {
      onChange(value.slice(0, newRule.maxLength));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Digits only - strictly capped to country's exact max length
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const truncated = digitsOnly.slice(0, currentRule.maxLength);
    onChange(truncated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and shortcut keys
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Block any non-digit key from being typed (letters, special chars, space, etc.)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Block typing if already reached country max length (unless text is selected for replacement)
    const input = e.currentTarget;
    const hasSelection =
      (input.selectionEnd ?? 0) - (input.selectionStart ?? 0) > 0;
    if (!hasSelection && value.length >= currentRule.maxLength) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digitsOnly = pastedText.replace(/\D/g, "");
    const truncated = digitsOnly.slice(0, currentRule.maxLength);
    onChange(truncated);
  };

  const getFlagUrl = (code: string) => {
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Phone input container matching user screenshot */}
      <div className="relative flex items-center rounded border border-neutral-300 bg-white focus-within:border-neutral-500 transition">
        {/* Country Flag + Arrow + Dial code button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 hover:bg-neutral-50 border-r border-neutral-200 text-sm text-neutral-800 select-none cursor-pointer transition shrink-0"
        >
          {/* Real colorful country flag image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFlagUrl(activeCountry.code)}
            alt={activeCountry.name}
            className="w-5 h-3.5 object-cover rounded-xs shadow-xs"
            loading="lazy"
          />
          <span className="text-[9px] text-neutral-600 select-none">
            {isOpen ? "▾" : "▴"}
          </span>
          <span className="text-xs font-semibold text-neutral-800 ml-0.5">
            {activeCountry.dial}
          </span>
        </button>

        {/* Number input with numeric only restriction & exact country max length */}
        <input
          ref={phoneInputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={currentRule.maxLength}
          required={required}
          placeholder={activePlaceholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="w-full px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none font-mono tracking-wide"
        />
      </div>

      {/* Country Selection Dropdown matching user screenshot */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-white border border-neutral-300 rounded shadow-2xl z-50 overflow-hidden text-neutral-900">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-neutral-200 bg-white">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Scrollable list of countries matching user screenshot layout */}
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.dial}`}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={`w-full flex items-center justify-start gap-3 px-3.5 py-2 text-left text-sm hover:bg-neutral-100 transition cursor-pointer ${
                    activeCountry.code === country.code
                      ? "bg-neutral-50 font-medium"
                      : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFlagUrl(country.code)}
                    alt={country.name}
                    className="w-5 h-3.5 object-cover rounded-xs shadow-xs shrink-0"
                    loading="lazy"
                  />
                  <span className="text-neutral-900 text-sm">
                    {country.name}
                  </span>
                  <span className="text-xs text-neutral-400 font-normal">
                    {country.dial}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-neutral-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
