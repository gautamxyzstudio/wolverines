import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/app/lib/auth";

// get all

export async function GET(request: NextRequest) {
  try {

    const pricing = await prisma.summerCampPricing.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!pricing) {
      return NextResponse.json(
        {
          message: "No pricing found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "pricing fetched successfully",
        data: pricing,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("Get pricing error", error);
    return NextResponse.json(
      {
        message: "Failed to get pricing",
      },
      { status: 500 },
    );
  }
}

// create

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const data = await request.json();

    const {
      minAge,
      maxAge,
      youngerAgePrice,
      olderAgePrice,
      siblingDiscount,
      processingFeePercent,
      isEnabled,
    } = data;

    if (
      minAge === undefined ||
      maxAge === undefined ||
      youngerAgePrice === undefined ||
      olderAgePrice === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "minAge , maxAge , youngerAgePrice and olderAgePrice are required",
        },
        { status: 400 },
      );
    }

    if (isEnabled !== undefined && typeof isEnabled !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isEnabled must be a boolean",
        },
        { status: 400 },
      );
    }

    if (Number(minAge) < 0 || Number(maxAge) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Age cannot be negative",
        },
        { status: 400 },
      );
    }

    if (Number(minAge) > Number(maxAge)) {
      return NextResponse.json(
        {
          success: false,
          message: "minAge cannot be greater than maxAge",
        },
        { status: 400 },
      );
    }

    if (Number(youngerAgePrice) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "youngerAgePrice cannot be negative",
        },
        { status: 400 },
      );
    }

    if (Number(olderAgePrice) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "olderAgePrice cannot be negative",
        },
        { status: 400 },
      );
    }

    if (siblingDiscount !== undefined && Number(siblingDiscount) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "siblingDiscount cannot be negative",
        },
        { status: 400 },
      );
    }

    if (
      processingFeePercent !== undefined &&
      (Number(processingFeePercent) < 0 || Number(processingFeePercent) > 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "processingFeePercent must be between 0 and 100",
        },
        { status: 400 },
      );
    }

    const pricing = await prisma.summerCampPricing.create({
      data: {
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        youngerAgePrice: Number(youngerAgePrice),
        olderAgePrice: Number(olderAgePrice),
        siblingDiscount:
          siblingDiscount !== undefined ? Number(siblingDiscount) : 40,
        processingFeePercent:
          processingFeePercent !== undefined ? Number(processingFeePercent) : 3,
        isEnabled: isEnabled !== undefined ? isEnabled : false,
      },
    });
    return NextResponse.json({
      message: "Pricing created successfully",
      data: pricing,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 401 },
      );
    }
    console.log("Summer camp pricing create error", error);
    return NextResponse.json(
      {
        message: "Failed to create summer camp pricing",
      },
      { status: 500 },
    );
  }
}
