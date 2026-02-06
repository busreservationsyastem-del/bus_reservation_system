import { NextRequest, NextResponse } from "next/server";
import db, { initDB } from "@/lib/db";

// POST /api/bookings/cancel - Cancel a booking
export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const { pnr, email, mobile } = body;

    if (!pnr || !email || !mobile) {
      return NextResponse.json(
        { error: "PNR, Email, and Mobile are required" },
        { status: 400 }
      );
    }

    // Find the booking
    const result = await db.execute({
      sql: "SELECT * FROM bookings WHERE pnr = ? AND email = ? AND mobile = ?",
      args: [pnr, email, mobile],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No matching booking found. Please check your details." },
        { status: 404 }
      );
    }

    const booking = result.rows[0];
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "This ticket has already been cancelled." },
        { status: 400 }
      );
    }

    // Cancel the booking
    await db.execute({
      sql: "UPDATE bookings SET status = 'cancelled' WHERE pnr = ?",
      args: [pnr],
    });

    return NextResponse.json({
      success: true,
      message: `Ticket with PNR ${pnr} has been cancelled successfully. Refund will be processed within 7 working days.`,
    });
  } catch (error: unknown) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
