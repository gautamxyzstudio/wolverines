import { YEAR_END_EVENT_CONFIG } from "./year-end-constants";

export interface AttendeeInput {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface StructuredAttendee extends AttendeeInput {
  age: number;
  category: "under5" | "child5to10" | "ages11Plus";
  categoryLabel: string;
  price: number;
}

export interface TicketSelectionInput {
  registrationType?: "INDIVIDUAL" | "FAMILY";
  attendees?: AttendeeInput[];
  under5Qty?: number;
  child5to10Qty?: number;
  ages11PlusQty?: number;
  familyOf4Qty?: number;
  familyOf5Qty?: number;
  familyMembers?: string[];
}

export interface TicketLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  finalPricePerTicket: number;
  subtotal: number;
  isFree: boolean;
  attendeesCount: number;
}

export interface YearEndFeeCalculation {
  registrationType: "INDIVIDUAL" | "FAMILY";
  subtotal: number;
  processingFee: number;
  totalAmount: number;
  totalAttendees: number;
  isComplimentary: boolean;
  attendeesList: StructuredAttendee[];
  familyPackageApplied: "NONE" | "FAMILY_OF_4" | "FAMILY_OF_5";
  savings: number;
  breakdown: {
    under5: TicketLineItem;
    child5to10: TicketLineItem;
    ages11Plus: TicketLineItem;
    familyOf4: TicketLineItem;
    familyOf5: TicketLineItem;
  };
  familyMembers: string[];
}

/**
 * Calculates attendee age relative to Reference Date: December 1, 2026
 */
export function calculateAge(
  dobString: string,
  eventDate = new Date(2026, 11, 1),
): number | null {
  if (!dobString) return null;
  const parts = dobString.trim().split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const birthDate = new Date(y, m, d);
  if (isNaN(birthDate.getTime())) return null;

  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Capitalizes the first letter of each word (Title Case)
 */
export function capitalizeWords(str?: string | null): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}

/**
 * Returns category info for a given age
 * - Under 5: Free ($0)
 * - 5 to 10: $25.00
 * - 11+: $45.00
 */
export function getAttendeeCategory(age: number): {
  id: "under5" | "child5to10" | "ages11Plus";
  label: string;
  price: number;
} {
  if (age < 5) {
    return { id: "under5", label: "Children Under 5", price: 0 };
  } else if (age <= 10) {
    return {
      id: "child5to10",
      label: "Children (5–10)",
      price: YEAR_END_EVENT_CONFIG.tickets.child5to10.basePrice,
    };
  } else {
    return {
      id: "ages11Plus",
      label: "Ages 11+ (Youth & Adult)",
      price: YEAR_END_EVENT_CONFIG.tickets.ages11Plus.basePrice,
    };
  }
}

/**
 * Calculates Year-End Celebration ticket fees:
 * - Age-based pricing: Under 5 Free, 5-10: $25, 11+: $45
 * - Family Package discounts apply automatically when eligible:
 *   - 2 Adults + 2 Children (5-10): Family of 4 Package ($125)
 *   - 2 Adults + 3 Children (5-10): Family of 5 Package ($145)
 * - Any other family size is charged fairly by each member's age
 * - 3% processing fee applied to all paid amounts
 */
export function calculateYearEndFee(
  input: TicketSelectionInput,
): YearEndFeeCalculation {
  const { tickets, processingFeePercent } = YEAR_END_EVENT_CONFIG;
  const registrationType = input.registrationType || "INDIVIDUAL";

  let under5Qty = 0;
  let child5to10Qty = 0;
  let ages11PlusQty = 0;
  let familyOf4Qty = 0;
  let familyOf5Qty = 0;
  let subtotal = 0;
  let familyPackageApplied: "NONE" | "FAMILY_OF_4" | "FAMILY_OF_5" = "NONE";
  let savings = 0;
  let attendeesList: StructuredAttendee[] = [];

  // Flow A: Structured Attendees provided (from UI with Name + DOB)
  if (input.attendees && input.attendees.length > 0) {
    attendeesList = input.attendees.map((att) => {
      const age = calculateAge(att.dateOfBirth) ?? 18;
      const cat = getAttendeeCategory(age);
      return {
        name: capitalizeWords(att.name),
        dateOfBirth: att.dateOfBirth.trim(),
        age,
        category: cat.id,
        categoryLabel: cat.label,
        price: cat.price,
      };
    });

    // Count by age category
    attendeesList.forEach((m) => {
      if (m.category === "under5") under5Qty++;
      else if (m.category === "child5to10") child5to10Qty++;
      else ages11PlusQty++;
    });

    // Regular sum without package discount
    const regularSum = Number(
      (
        child5to10Qty * tickets.child5to10.basePrice +
        ages11PlusQty * tickets.ages11Plus.basePrice
      ).toFixed(2),
    );

    if (registrationType === "FAMILY") {
      // Check for Family Package discount eligibility:
      // Case 1: Family of 5 (at least 2 adults 11+ and at least 3 children 5-10)
      if (ages11PlusQty >= 2 && child5to10Qty >= 3) {
        familyOf5Qty = 1;
        const extraAdults = ages11PlusQty - 2;
        const extraKids = child5to10Qty - 3;
        subtotal = Number(
          (
            tickets.familyOf5.basePrice +
            extraAdults * tickets.ages11Plus.basePrice +
            extraKids * tickets.child5to10.basePrice
          ).toFixed(2),
        );
        familyPackageApplied = "FAMILY_OF_5";
        savings = Math.max(0, Number((regularSum - subtotal).toFixed(2)));
      }
      // Case 2: Family of 4 (at least 2 adults 11+ and at least 2 children 5-10)
      else if (ages11PlusQty >= 2 && child5to10Qty >= 2) {
        familyOf4Qty = 1;
        const extraAdults = ages11PlusQty - 2;
        const extraKids = child5to10Qty - 2;
        subtotal = Number(
          (
            tickets.familyOf4.basePrice +
            extraAdults * tickets.ages11Plus.basePrice +
            extraKids * tickets.child5to10.basePrice
          ).toFixed(2),
        );
        familyPackageApplied = "FAMILY_OF_4";
        savings = Math.max(0, Number((regularSum - subtotal).toFixed(2)));
      }
      // Case 3: Any other family combination (e.g. 1 adult + 1 kid, 1 adult + 2 kids, 2 adults + 1 kid, etc.)
      else {
        subtotal = regularSum;
      }
    } else {
      // Individual Flow: priced directly by age
      subtotal = regularSum;
    }
  } else {
    // Flow B: Direct Quantities (Backwards compatibility)
    under5Qty = Math.max(0, Math.floor(input.under5Qty || 0));
    child5to10Qty = Math.max(0, Math.floor(input.child5to10Qty || 0));
    ages11PlusQty = Math.max(0, Math.floor(input.ages11PlusQty || 0));
    familyOf4Qty = Math.max(0, Math.floor(input.familyOf4Qty || 0));
    familyOf5Qty = Math.max(0, Math.floor(input.familyOf5Qty || 0));

    subtotal = Number(
      (
        child5to10Qty * tickets.child5to10.basePrice +
        ages11PlusQty * tickets.ages11Plus.basePrice +
        familyOf4Qty * tickets.familyOf4.basePrice +
        familyOf5Qty * tickets.familyOf5.basePrice
      ).toFixed(2),
    );
  }

  const totalAttendees =
    attendeesList.length > 0
      ? attendeesList.length
      : under5Qty +
      child5to10Qty +
      ages11PlusQty +
      familyOf4Qty * tickets.familyOf4.attendeeMultiplier +
      familyOf5Qty * tickets.familyOf5.attendeeMultiplier;

  if (totalAttendees < 1) {
    throw new Error("At least one attendee or ticket must be selected.");
  }

  // 3% processing fee applied only on paid subtotal
  const feeRate = processingFeePercent / 100;
  const processingFee =
    subtotal > 0 ? Number((subtotal * feeRate).toFixed(2)) : 0;
  const totalAmount = Number((subtotal + processingFee).toFixed(2));

  const familyMembers =
    attendeesList.length > 0
      ? attendeesList.map((a) => `${capitalizeWords(a.name)} (${a.dateOfBirth}, Age: ${a.age})`)
      : (input.familyMembers || []).map((m) => capitalizeWords(m.trim())).filter(Boolean);

  const under5Subtotal = 0;
  const child5to10Subtotal = Number((child5to10Qty * tickets.child5to10.basePrice).toFixed(2));
  const ages11PlusSubtotal = Number((ages11PlusQty * tickets.ages11Plus.basePrice).toFixed(2));
  const familyOf4Subtotal = Number((familyOf4Qty * tickets.familyOf4.basePrice).toFixed(2));
  const familyOf5Subtotal = Number((familyOf5Qty * tickets.familyOf5.basePrice).toFixed(2));

  return {
    registrationType,
    subtotal,
    processingFee,
    totalAmount,
    totalAttendees,
    isComplimentary: totalAmount === 0 && totalAttendees > 0,
    attendeesList,
    familyPackageApplied,
    savings,
    breakdown: {
      under5: {
        id: tickets.under5.id,
        name: tickets.under5.name,
        quantity: under5Qty,
        unitPrice: tickets.under5.basePrice,
        finalPricePerTicket: tickets.under5.finalPrice,
        subtotal: under5Subtotal,
        isFree: true,
        attendeesCount: under5Qty,
      },
      child5to10: {
        id: tickets.child5to10.id,
        name: tickets.child5to10.name,
        quantity: child5to10Qty,
        unitPrice: tickets.child5to10.basePrice,
        finalPricePerTicket: tickets.child5to10.finalPrice,
        subtotal: child5to10Subtotal,
        isFree: false,
        attendeesCount: child5to10Qty,
      },
      ages11Plus: {
        id: tickets.ages11Plus.id,
        name: tickets.ages11Plus.name,
        quantity: ages11PlusQty,
        unitPrice: tickets.ages11Plus.basePrice,
        finalPricePerTicket: tickets.ages11Plus.finalPrice,
        subtotal: ages11PlusSubtotal,
        isFree: false,
        attendeesCount: ages11PlusQty,
      },
      familyOf4: {
        id: tickets.familyOf4.id,
        name: tickets.familyOf4.name,
        quantity: familyOf4Qty,
        unitPrice: tickets.familyOf4.basePrice,
        finalPricePerTicket: tickets.familyOf4.finalPrice,
        subtotal: familyOf4Subtotal,
        isFree: false,
        attendeesCount: familyOf4Qty * tickets.familyOf4.attendeeMultiplier,
      },
      familyOf5: {
        id: tickets.familyOf5.id,
        name: tickets.familyOf5.name,
        quantity: familyOf5Qty,
        unitPrice: tickets.familyOf5.basePrice,
        finalPricePerTicket: tickets.familyOf5.finalPrice,
        subtotal: familyOf5Subtotal,
        isFree: false,
        attendeesCount: familyOf5Qty * tickets.familyOf5.attendeeMultiplier,
      },
    },
    familyMembers,
  };
}
