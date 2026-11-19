import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { stripe } from "@/app/lib/stripe";
import {
  sendYearEndParentConfirmation,
  sendYearEndAdminNotification,
} from "@/app/lib/year-end-email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const registrationId = searchParams.get("registration_id");

    if (!sessionId && !registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "session_id or registration_id is required",
        },
        { status: 400 },
      );
    }

    // 1. Look for confirmed registration
    let confirmed = null;
    if (sessionId) {
      confirmed = await prisma.yearEndRegistration.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
      });
    }

    if (!confirmed && registrationId) {
      confirmed = await prisma.yearEndRegistration.findUnique({
        where: { registrationId },
      });
    }

    if (confirmed) {
      return NextResponse.json(
        {
          success: true,
          status: "PAID",
          data: confirmed,
        },
        { status: 200 },
      );
    }

    // 2. If not confirmed yet, check if pending registration exists and verify directly with Stripe
    if (sessionId) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

        // If Stripe says paid, self-heal / confirm if webhook was delayed
        if (stripeSession && stripeSession.payment_status === "paid") {
          const pending = await prisma.pendingYearEndRegistration.findFirst({
            where: { stripeCheckoutSessionId: sessionId },
          });

          if (pending) {
            const paymentIntentId =
              typeof stripeSession.payment_intent === "string"
                ? stripeSession.payment_intent
                : stripeSession.payment_intent?.id || null;

            const created = await prisma.$transaction(async (tx) => {
              const reg = await tx.yearEndRegistration.create({
                data: {
                  registrationId: pending.registrationId,
                  primaryContactName: pending.primaryContactName,
                  email: pending.email,
                  countryCode: pending.countryCode,
                  contactNumber: pending.contactNumber,
                  secondaryCountryCode: pending.secondaryCountryCode,
                  secondaryContactNumber: pending.secondaryContactNumber,
                  notes: pending.notes,
                  ticketDetails: pending.ticketDetails as any,
                  totalAttendees: pending.totalAttendees,
                  subtotal: pending.subtotal,
                  processingFee: pending.processingFee,
                  totalAmount: pending.totalAmount,
                  paymentStatus: "PAID",
                  stripeCheckoutSessionId: sessionId,
                  stripePaymentIntentId: paymentIntentId,
                },
              });

              await tx.pendingYearEndRegistration.delete({
                where: { id: pending.id },
              });

              return reg;
            });

            // Trigger confirmation emails for parent and admin
            try {
              await Promise.allSettled([
                sendYearEndParentConfirmation(created),
                sendYearEndAdminNotification(created),
              ]);
            } catch (emailErr) {
              console.error("Failed to send confirmation emails:", emailErr);
            }

            return NextResponse.json(
              {
                success: true,
                status: "PAID",
                data: created,
              },
              { status: 200 },
            );
          }
        }
      } catch (stripeErr) {
        console.error("Error retrieving Stripe session in confirmation:", stripeErr);
      }
    }

    // 3. Fallback: Check if pending record exists (payment processing)
    const pending = sessionId
      ? await prisma.pendingYearEndRegistration.findUnique({
          where: { stripeCheckoutSessionId: sessionId },
        })
      : await prisma.pendingYearEndRegistration.findUnique({
          where: { registrationId: registrationId! },
        });

    if (pending) {
      return NextResponse.json(
        {
          success: true,
          status: "PENDING",
          data: pending,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registration not found",
      },
      { status: 404 },
    );
  } catch (error: any) {
    console.error("Confirmation fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch confirmation details",
      },
      { status: 500 },
    );
  }
}
