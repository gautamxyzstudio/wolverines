import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import { saveEmail } from "@/app/lib/save-email";
import { yearEndRegistrationSchema } from "@/app/validations/year-end-validation";
import { calculateYearEndFee, capitalizeWords } from "@/app/lib/year-end-fee";
import { generateYearEndRegistrationId } from "@/app/lib/year-end-id";
import { YEAR_END_EVENT_CONFIG } from "@/app/lib/year-end-constants";
import {
  sendYearEndParentConfirmation,
  sendYearEndAdminNotification,
} from "@/app/lib/year-end-email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate form fields
    const parsed = yearEndRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed. Please verify your details.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      primaryContactName,
      email,
      countryCode,
      contactNumber,
      secondaryCountryCode,
      secondaryContactNumber,
      notes,
      registrationType,
      attendees,
      under5Qty,
      child5to10Qty,
      ages11PlusQty,
      familyOf4Qty,
      familyOf5Qty,
      familyMembers,
    } = parsed.data;

    // 2. Calculate fees & breakdown using the exact updated pricing model
    const feeCalculation = calculateYearEndFee({
      registrationType,
      attendees,
      under5Qty,
      child5to10Qty,
      ages11PlusQty,
      familyOf4Qty,
      familyOf5Qty,
      familyMembers,
    });

    const ticketDetailsPayload = {
      ...feeCalculation.breakdown,
      registrationType: feeCalculation.registrationType,
      attendees: feeCalculation.attendeesList,
      familyMembers: feeCalculation.familyMembers,
    };

    const normalizedEmail = email.trim().toLowerCase();
    await saveEmail(normalizedEmail);

    const registrationId = generateYearEndRegistrationId();

    // Determine host origin safely
    const origin =
      process.env.LIVE_URL?.replace(/\/$/, "") ||
      request.headers.get("origin") ||
      request.nextUrl.origin ||
      "http://localhost:3000";

    // 3. Case A: Complimentary / 100% Free registration ($0 - only under-5 kids)
    if (feeCalculation.isComplimentary) {
      const confirmed = await prisma.yearEndRegistration.create({
        data: {
          registrationId,
          primaryContactName: capitalizeWords(primaryContactName),
          email: normalizedEmail,
          countryCode,
          contactNumber,
          secondaryCountryCode: secondaryCountryCode || null,
          secondaryContactNumber: secondaryContactNumber || null,
          notes: notes || null,
          ticketDetails: ticketDetailsPayload as any,
          totalAttendees: feeCalculation.totalAttendees,
          subtotal: feeCalculation.subtotal,
          processingFee: feeCalculation.processingFee,
          totalAmount: feeCalculation.totalAmount,
          paymentStatus: "PAID",
          stripeCheckoutSessionId: null,
          stripePaymentIntentId: "COMPLIMENTARY_FREE",
        },
      });

      try {
        await Promise.allSettled([
          sendYearEndParentConfirmation(confirmed),
          sendYearEndAdminNotification(confirmed),
        ]);
      } catch (err) {
        console.error("Failed to send complimentary confirmation emails:", err);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Registration completed successfully",
          data: {
            registrationId: confirmed.registrationId,
            isComplimentary: true,
            totalAmount: 0,
            redirectUrl: `${origin}/events/year-end-celebration-2026/success?registration_id=${confirmed.registrationId}`,
          },
        },
        { status: 201 },
      );
    }

    // 4. Case B: Paid Registration -> Save Pending Record
    const pendingRegistration =
      await prisma.pendingYearEndRegistration.create({
        data: {
          registrationId,
          primaryContactName: capitalizeWords(primaryContactName),
          email: normalizedEmail,
          countryCode,
          contactNumber,
          secondaryCountryCode: secondaryCountryCode || null,
          secondaryContactNumber: secondaryContactNumber || null,
          notes: notes || null,
          ticketDetails: ticketDetailsPayload as any,
          totalAttendees: feeCalculation.totalAttendees,
          subtotal: feeCalculation.subtotal,
          processingFee: feeCalculation.processingFee,
          totalAmount: feeCalculation.totalAmount,
          paymentStatus: "PENDING",
        },
      });

    // 5. Build Stripe Line Items for all selected paid categories
    const lineItems: any[] = [];
    const { tickets, stripeCurrency, eventName, processingFeePercent } =
      YEAR_END_EVENT_CONFIG;

    // Children 5–10 ($25)
    if (feeCalculation.breakdown.child5to10.quantity > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `${tickets.child5to10.name} - ${eventName}`,
            description: tickets.child5to10.description,
          },
          unit_amount: Math.round(tickets.child5to10.basePrice * 100),
        },
        quantity: feeCalculation.breakdown.child5to10.quantity,
      });
    }

    // Ages 11+ ($45)
    if (feeCalculation.breakdown.ages11Plus.quantity > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `${tickets.ages11Plus.name} - ${eventName}`,
            description: tickets.ages11Plus.description,
          },
          unit_amount: Math.round(tickets.ages11Plus.basePrice * 100),
        },
        quantity: feeCalculation.breakdown.ages11Plus.quantity,
      });
    }

    // Family of 4 ($125)
    if (feeCalculation.breakdown.familyOf4.quantity > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `${tickets.familyOf4.name} - ${eventName}`,
            description: tickets.familyOf4.description,
          },
          unit_amount: Math.round(tickets.familyOf4.basePrice * 100),
        },
        quantity: feeCalculation.breakdown.familyOf4.quantity,
      });
    }

    // Family of 5 ($145)
    if (feeCalculation.breakdown.familyOf5.quantity > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `${tickets.familyOf5.name} - ${eventName}`,
            description: tickets.familyOf5.description,
          },
          unit_amount: Math.round(tickets.familyOf5.basePrice * 100),
        },
        quantity: feeCalculation.breakdown.familyOf5.quantity,
      });
    }

    // 3% Processing Fee line item
    if (feeCalculation.processingFee > 0) {
      lineItems.push({
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: `Online Processing Fee (${processingFeePercent}%)`,
            description: "Card processing and administrative handling fee",
          },
          unit_amount: Math.round(feeCalculation.processingFee * 100),
        },
        quantity: 1,
      });
    }

    // 6. Create Stripe Checkout Session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: normalizedEmail,
        line_items: lineItems,
        success_url: `${origin}/events/year-end-celebration-2026/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/events/year-end-celebration-2026/cancel?registration_id=${pendingRegistration.registrationId}`,
        metadata: {
          pendingRegistrationId: pendingRegistration.id,
          registrationId: pendingRegistration.registrationId,
          type: "YEAR_END_CELEBRATION",
        },
      });
    } catch (stripeErr: any) {
      await prisma.pendingYearEndRegistration.delete({
        where: { id: pendingRegistration.id },
      });
      console.error("Stripe session creation error:", stripeErr);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initiate Stripe checkout. Please try again.",
        },
        { status: 500 },
      );
    }

    // 7. Update pending registration with session ID
    await prisma.pendingYearEndRegistration.update({
      where: { id: pendingRegistration.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Checkout session generated successfully",
        data: {
          registrationId: pendingRegistration.registrationId,
          subtotal: feeCalculation.subtotal,
          processingFee: feeCalculation.processingFee,
          totalAmount: feeCalculation.totalAmount,
          checkoutUrl: session.url,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Year-end celebration checkout error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "An unexpected error occurred during registration.",
      },
      { status: 500 },
    );
  }
}
