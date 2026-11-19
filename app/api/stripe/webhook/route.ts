import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";
import { prisma } from "@/app/lib/prisma";

import {
  sendCampParentConfirmation,
  sendCampRegistrationNotification,
  sendDonationThankYou,
  sendDonationAdminNotification,
} from "@/app/lib/email";
import {
  sendYearEndParentConfirmation,
  sendYearEndAdminNotification,
} from "@/app/lib/year-end-email";

export async function POST(request: NextRequest) {
  try {
    // Stripe webhook body must be read as raw text
    const body = await request.text();

    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Stripe signature",
        },
        { status: 400 },
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe webhook secret is not configured",
        },
        { status: 500 },
      );
    }

    let event: Stripe.Event;

    // Verify Stripe webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature",
        },
        { status: 400 },
      );
    }

    // Handle successful Checkout session
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Make sure payment is actually completed
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          {
            success: true,
            message: "Payment is not completed",
          },
          { status: 200 },
        );
      }

      const pendingRegistrationId = session.metadata?.pendingRegistrationId;

      const campType = session.metadata?.campType;

      const pendingDonationId = session.metadata?.pendingDonationId;

      const paymentType = session.metadata?.type;

      // Validate camp / registration metadata
      if (paymentType !== "DONATION" && !pendingRegistrationId) {
        return NextResponse.json(
          {
            success: false,
            message: "Pending registration ID not found",
          },
          { status: 400 },
        );
      }

      // Validate camp type (only when not donation and not year-end celebration)
      if (
        paymentType !== "DONATION" &&
        paymentType !== "YEAR_END_CELEBRATION" &&
        campType !== "SUMMER" &&
        campType !== "WINTER"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid camp type",
          },
          { status: 400 },
        );
      }

      // Validate donation metadata
      if (paymentType === "DONATION" && !pendingDonationId) {
        return NextResponse.json(
          {
            success: false,
            message: "Pending donation ID not found",
          },
          { status: 400 },
        );
      }

      // =========================
      // SUMMER CAMP
      // =========================

      if (campType === "SUMMER") {
        const pendingRegistration =
          await prisma.pendingSummerCampRegistration.findUnique({
            where: {
              id: pendingRegistrationId,
            },
          });

        // Already processed
        if (!pendingRegistration) {
          return NextResponse.json(
            {
              success: true,
              message: "Summer registration already processed",
            },
            { status: 200 },
          );
        }

        const summerRegistration = await prisma.$transaction(async (tx) => {
          const registration = await tx.summerCampRegistration.create({
            data: {
              registrationId: pendingRegistration.registrationId,

              parentGuardianName: pendingRegistration.parentGuardianName,

              relationToChild: pendingRegistration.relationToChild,

              email: pendingRegistration.email,

              countryCode: pendingRegistration.countryCode,

              contactNumber: pendingRegistration.contactNumber,

              secondaryCountryCode: pendingRegistration.secondaryCountryCode,

              secondaryContactNumber:
                pendingRegistration.secondaryContactNumber,

              address: pendingRegistration.address,

              city: pendingRegistration.city,

              postalCode: pendingRegistration.postalCode,

              country: pendingRegistration.country,

              message: pendingRegistration.message,

              children: pendingRegistration.children as any,

              subtotal: pendingRegistration.subtotal,

              siblingDiscount: pendingRegistration.siblingDiscount,

              processingFee: pendingRegistration.processingFee,

              totalAmount: pendingRegistration.totalAmount,

              paymentStatus: "PAID",

              stripeCheckoutSessionId: session.id,
            },
          });

          await tx.pendingSummerCampRegistration.delete({
            where: {
              id: pendingRegistration.id,
            },
          });

          return registration;
        });

        console.log(
          "Summer registration created:",
          summerRegistration.registrationId,
        );

        try {
          await sendCampRegistrationNotification({
            ...summerRegistration,
            campType: "SUMMER",
          });

          await sendCampParentConfirmation({
            ...summerRegistration,
            campType: "SUMMER",
          });

          console.log("Summer camp emails sent successfully");
        } catch (emailError) {
          console.error("Summer camp email failed:", emailError);
        }
      }

      // =========================
      // WINTER CAMP
      // =========================

      if (campType === "WINTER") {
        const pendingRegistration =
          await prisma.pendingWinterCampRegistration.findUnique({
            where: {
              id: pendingRegistrationId,
            },
          });

        // Already processed
        if (!pendingRegistration) {
          return NextResponse.json(
            {
              success: true,
              message: "Winter registration already processed",
            },
            { status: 200 },
          );
        }

        const winterRegistration = await prisma.$transaction(async (tx) => {
          const registration = await tx.winterCampRegistration.create({
            data: {
              registrationId: pendingRegistration.registrationId,

              parentGuardianName: pendingRegistration.parentGuardianName,

              relationToChild: pendingRegistration.relationToChild,

              email: pendingRegistration.email,

              countryCode: pendingRegistration.countryCode,

              contactNumber: pendingRegistration.contactNumber,

              secondaryCountryCode: pendingRegistration.secondaryCountryCode,

              secondaryContactNumber:
                pendingRegistration.secondaryContactNumber,

              address: pendingRegistration.address,

              city: pendingRegistration.city,

              postalCode: pendingRegistration.postalCode,

              country: pendingRegistration.country,

              message: pendingRegistration.message,

              children: pendingRegistration.children as any,

              subtotal: pendingRegistration.subtotal,

              siblingDiscount: pendingRegistration.siblingDiscount,

              processingFee: pendingRegistration.processingFee,

              totalAmount: pendingRegistration.totalAmount,

              paymentStatus: "PAID",

              stripeCheckoutSessionId: session.id,
            },
          });

          await tx.pendingWinterCampRegistration.delete({
            where: {
              id: pendingRegistration.id,
            },
          });

          return registration;
        });

        console.log(
          "Winter registration created:",
          winterRegistration.registrationId,
        );

        try {
          await sendCampRegistrationNotification({
            ...winterRegistration,
            campType: "WINTER",
          });

          await sendCampParentConfirmation({
            ...winterRegistration,
            campType: "WINTER",
          });

          console.log("Winter camp emails sent successfully");
        } catch (emailError) {
          console.error("Winter camp email failed:", emailError);
        }
      }

      // =========================
      // DONATION
      // =========================

      if (paymentType === "DONATION") {
        const pendingDonationId = session.metadata?.pendingDonationId;

        if (!pendingDonationId) {
          return NextResponse.json(
            {
              success: false,
              message: "Pending donation ID not found",
            },
            { status: 400 },
          );
        }

        const pendingDonation = await prisma.pendingDonation.findFirst({
          where: {
            id: pendingDonationId,
            stripeCheckoutSessionId: session.id,
          },
        });

        // Already processed
        if (!pendingDonation) {
          return NextResponse.json(
            {
              success: true,
              message: "Donation already processed",
            },
            { status: 200 },
          );
        }

        const donation = await prisma.$transaction(async (tx) => {
          const createdDonation = await tx.donation.create({
            data: {
              donorName: pendingDonation.donorName,

              email: pendingDonation.email,

              countryCode: pendingDonation.countryCode,

              contactNumber: pendingDonation.contactNumber,

              amount: pendingDonation.amount,

              currency: pendingDonation.currency,

              acknowledgement: pendingDonation.acknowledgement,

              paymentStatus: "PAID",

              stripeCheckoutSessionId: session.id,
            },
          });

          await tx.pendingDonation.delete({
            where: {
              id: pendingDonation.id,
            },
          });

          return createdDonation;
        });

        // Send thank-you email to donor
        try {
          await sendDonationThankYou({
            donorName: donation.donorName,
            email: donation.email,
            amount: donation.amount,
            currency: donation.currency,
          });
        } catch (emailError) {
          console.error("Failed to send donation thank-you email:", emailError);
        }

        // admin notification
        try {
          await sendDonationAdminNotification({
            donorName: donation.donorName,
            email: donation.email,
            countryCode: donation.countryCode,
            contactNumber: donation.contactNumber,
            amount: donation.amount,
          });
        } catch (emailError) {
          console.error(
            "Failed to send donation admin notification:",
            emailError,
          );
        }

        console.log("Donation created:", donation.id);
      }

      // =========================
      // YEAR-END CELEBRATION 2026
      // =========================
      if (paymentType === "YEAR_END_CELEBRATION") {
        const existingRegistration =
          await prisma.yearEndRegistration.findUnique({
            where: {
              stripeCheckoutSessionId: session.id,
            },
          });

        // Prevent duplicate processing
        if (existingRegistration) {
          return NextResponse.json(
            {
              success: true,
              message: "Year-End Celebration registration already processed",
            },
            { status: 200 },
          );
        }

        const pendingRegistration =
          await prisma.pendingYearEndRegistration.findUnique({
            where: {
              id: pendingRegistrationId,
            },
          });

        if (!pendingRegistration) {
          return NextResponse.json(
            {
              success: true,
              message:
                "Pending Year-End Celebration registration not found or already processed",
            },
            { status: 200 },
          );
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

        const yearEndRegistration = await prisma.$transaction(async (tx) => {
          const created = await tx.yearEndRegistration.create({
            data: {
              registrationId: pendingRegistration.registrationId,
              primaryContactName: pendingRegistration.primaryContactName,
              email: pendingRegistration.email,
              countryCode: pendingRegistration.countryCode,
              contactNumber: pendingRegistration.contactNumber,
              secondaryCountryCode: pendingRegistration.secondaryCountryCode,
              secondaryContactNumber:
                pendingRegistration.secondaryContactNumber,
              notes: pendingRegistration.notes,
              ticketDetails: pendingRegistration.ticketDetails as any,
              totalAttendees: pendingRegistration.totalAttendees,
              subtotal: pendingRegistration.subtotal,
              processingFee: pendingRegistration.processingFee,
              totalAmount: pendingRegistration.totalAmount,
              paymentStatus: "PAID",
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
            },
          });

          await tx.pendingYearEndRegistration.delete({
            where: {
              id: pendingRegistration.id,
            },
          });

          return created;
        });

        console.log(
          "Year-End Celebration registration confirmed:",
          yearEndRegistration.registrationId,
        );

        // Send parent confirmation & admin notification emails
        try {
          await Promise.allSettled([
            sendYearEndParentConfirmation(yearEndRegistration),
            sendYearEndAdminNotification(yearEndRegistration),
          ]);
          console.log("Year-End Celebration confirmation emails sent successfully");
        } catch (emailError) {
          console.error(
            "Year-End Celebration email notification error:",
            emailError,
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        received: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
