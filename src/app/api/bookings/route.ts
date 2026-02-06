import { NextRequest, NextResponse } from "next/server";
import db, { initDB } from "@/lib/db";

// Generate a unique 10-character PNR
function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "PNR";
  for (let i = 0; i < 7; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

// POST /api/bookings - Create a new booking
export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();

    const {
      busName,
      fromLocation,
      toLocation,
      journeyDate,
      departureTime,
      arrivalTime,
      adults,
      children,
      passengerName,
      gender,
      age,
      email,
      mobile,
    } = body;

    // Validate required fields
    if (
      !busName ||
      !fromLocation ||
      !toLocation ||
      !journeyDate ||
      !departureTime ||
      !arrivalTime ||
      !passengerName ||
      !gender ||
      !age ||
      !email ||
      !mobile
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const pnr = generatePNR();

    await db.execute({
      sql: `INSERT INTO bookings (pnr, bus_name, from_location, to_location, journey_date, departure_time, arrival_time, adults, children, passenger_name, gender, age, email, mobile, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      args: [
        pnr,
        busName,
        fromLocation,
        toLocation,
        journeyDate,
        departureTime,
        arrivalTime,
        adults || 1,
        children || 0,
        passengerName,
        gender,
        age,
        email,
        mobile,
      ],
    });

    return NextResponse.json({
      success: true,
      pnr,
      message: "Booking confirmed successfully!",
    });
  } catch (error: unknown) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET /api/bookings?pnr=XXX - Fetch booking by PNR
export async function GET(req: NextRequest) {
  try {
    await initDB();
    const pnr = req.nextUrl.searchParams.get("pnr");

    if (!pnr) {
      return NextResponse.json(
        { error: "PNR number is required" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "SELECT * FROM bookings WHERE pnr = ?",
      args: [pnr],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No booking found with this PNR" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking: result.rows[0] });
  } catch (error: unknown) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
