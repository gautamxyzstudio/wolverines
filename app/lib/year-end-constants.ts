export const YEAR_END_EVENT_CONFIG = {
  eventName: "Wolverines Year-End Celebration 2026",
  eventYear: 2026,
  currency: "CAD",
  stripeCurrency: "cad",
  processingFeePercent: 3.0, // 3% processing fee

  // Ticket Categories & Base Pricing
  tickets: {
    under5: {
      id: "under5",
      name: "Children Under 5",
      description: "Free admission for young children accompanied by an adult",
      basePrice: 0.0,
      finalPrice: 0.0,
      isFree: true,
      attendeeMultiplier: 1,
    },
    child5to10: {
      id: "child5to10",
      name: "Children (Ages 5–10)",
      description: "Admission for youth/children aged 5 to 10",
      basePrice: 25.0,
      finalPrice: 25.75, // with 3% fee ($25 + $0.75)
      isFree: false,
      attendeeMultiplier: 1,
    },
    ages11Plus: {
      id: "ages11Plus",
      name: "Ages 11+ (Youth & Adults)",
      description: "Admission for players aged 11+, adults, parents & guests",
      basePrice: 45.0,
      finalPrice: 46.35, // with 3% fee ($45 + $1.35)
      isFree: false,
      attendeeMultiplier: 1,
    },
    familyOf4: {
      id: "familyOf4",
      name: "Family of 4 Package",
      description: "2 adults + 2 children aged 5–10",
      basePrice: 125.0,
      finalPrice: 128.75, // with 3% fee ($125 + $3.75)
      isFree: false,
      attendeeMultiplier: 4,
    },
    familyOf5: {
      id: "familyOf5",
      name: "Family of 5 Package",
      description: "2 adults + 3 children aged 5–10",
      basePrice: 145.0,
      finalPrice: 149.35, // with 3% fee ($145 + $4.35)
      isFree: false,
      attendeeMultiplier: 5,
    },
  },
} as const;

export type TicketCategoryKey = keyof typeof YEAR_END_EVENT_CONFIG.tickets;
