import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const attendeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date of birth (YYYY-MM-DD)"),
});

export const yearEndRegistrationSchema = z
  .object({
    primaryContactName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    countryCode: z
      .string()
      .trim()
      .min(1, "Country code is required"),

    contactNumber: z
      .string()
      .trim()
      .min(1, "Contact number is required"),

    secondaryCountryCode: z
      .string()
      .trim()
      .optional()
      .nullable(),

    secondaryContactNumber: z
      .string()
      .trim()
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional()
      .nullable(),

    registrationType: z
      .enum(["INDIVIDUAL", "FAMILY"])
      .default("INDIVIDUAL"),

    attendees: z
      .array(attendeeSchema)
      .optional()
      .default([]),

    under5Qty: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .default(0),

    child5to10Qty: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .default(0),

    ages11PlusQty: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .default(0),

    familyOf4Qty: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .default(0),

    familyOf5Qty: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .default(0),

    familyMembers: z
      .array(z.string().trim())
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    // 1. Validate attendees if provided
    if (data.attendees && data.attendees.length > 0) {
      // Any family size is allowed (user chooses how many members)
    } else {
      // If attendees not provided, ensure at least one category ticket is selected
      const totalSelected =
        data.under5Qty +
        data.child5to10Qty +
        data.ages11PlusQty +
        data.familyOf4Qty +
        data.familyOf5Qty;

      if (totalSelected < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees"],
          message: "Please add at least one attendee or ticket to proceed.",
        });
      }
    }

    // 2. Validate primary phone number
    const primaryFullPhone = `${data.countryCode}${data.contactNumber}`;
    const parsedPrimary = parsePhoneNumberFromString(primaryFullPhone);
    if (!parsedPrimary || !parsedPrimary.isValid()) {
      ctx.addIssue({
        code: "custom",
        path: ["contactNumber"],
        message: "Please provide a valid primary phone number",
      });
    }

    // 3. Validate secondary phone number (if provided)
    if (data.secondaryContactNumber && data.secondaryContactNumber.trim()) {
      const secondaryFullPhone = `${data.secondaryCountryCode || ""}${data.secondaryContactNumber}`;
      const parsedSecondary = parsePhoneNumberFromString(secondaryFullPhone);
      if (!parsedSecondary || !parsedSecondary.isValid()) {
        ctx.addIssue({
          code: "custom",
          path: ["secondaryContactNumber"],
          message: "Secondary phone number is invalid",
        });
      }
    }
  });

export type YearEndRegistrationInput = z.infer<typeof yearEndRegistrationSchema>;
