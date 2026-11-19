import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin, AuthError } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin credentials
    await requireAdmin(request);

    // 2. Fetch confirmed registrations
    const confirmedRegistrations = await prisma.yearEndRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch pending registrations
    const pendingRegistrations =
      await prisma.pendingYearEndRegistration.findMany({
        orderBy: { createdAt: "desc" },
      });

    // 4. Compute aggregate metrics
    const totalRevenue = confirmedRegistrations.reduce(
      (sum, reg) => sum + Number(reg.totalAmount || 0),
      0,
    );

    const totalProcessingFees = confirmedRegistrations.reduce(
      (sum, reg) => sum + Number(reg.processingFee || 0),
      0,
    );

    const totalAttendees = confirmedRegistrations.reduce(
      (sum, reg) => sum + Number(reg.totalAttendees || 0),
      0,
    );

    let under5TicketsCount = 0;
    let child5to10TicketsCount = 0;
    let ages11PlusTicketsCount = 0;
    let familyOf4TicketsCount = 0;
    let familyOf5TicketsCount = 0;

    confirmedRegistrations.forEach((reg) => {
      const details = (reg.ticketDetails as any) || {};
      under5TicketsCount += Number(details.under5?.quantity || 0);
      child5to10TicketsCount += Number(details.child5to10?.quantity || 0);
      ages11PlusTicketsCount += Number(
        (details.ages11Plus?.quantity || 0) + (details.individual?.quantity || 0),
      );
      familyOf4TicketsCount += Number(
        (details.familyOf4?.quantity || 0) + (details.family?.quantity || 0),
      );
      familyOf5TicketsCount += Number(details.familyOf5?.quantity || 0);
    });

    const stats = {
      totalConfirmed: confirmedRegistrations.length,
      totalPending: pendingRegistrations.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalProcessingFees: Number(totalProcessingFees.toFixed(2)),
      totalAttendees,
      ticketBreakdown: {
        under5: under5TicketsCount,
        child5to10: child5to10TicketsCount,
        ages11Plus: ages11PlusTicketsCount,
        familyOf4: familyOf4TicketsCount,
        familyOf5: familyOf5TicketsCount,
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: "Year-End Celebration registrations fetched successfully",
        data: {
          confirmed: confirmedRegistrations,
          pending: pendingRegistrations,
          stats,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 },
      );
    }

    console.error("Error fetching Year-End Celebration registrations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch event registrations",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "pending" | "confirmed"

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Registration ID is required" },
        { status: 400 },
      );
    }

    if (type === "pending") {
      await prisma.pendingYearEndRegistration.delete({
        where: { id },
      });
    } else {
      await prisma.yearEndRegistration.delete({
        where: { id },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 },
      );
    }

    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete registration" },
      { status: 500 },
    );
  }
}
