export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  VERIFY_OTP: "/api/auth/verify-otp",
  RESET_PASSWORD: "/api/auth/reset-password",

  // Core & Forms
  JOIN_OUR_CLUB: "/api/join-our-club",
  CONTACT_US: "/api/contact-us",
  PENDING_DONATION: "/api/pending-donation",
  EVENT: "/api/event",
  PENDING_SUMMER_CAMP: "/api/pending-summer-camp",
  PENDING_WINTER_CAMP: "/api/pending-winter-camp",
  BLOG: "/api/blog",
} as const;

export default API_ENDPOINTS;
