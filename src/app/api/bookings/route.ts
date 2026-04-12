import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { sendBookingConfirmationSMS } from "@/lib/sms";

// Generate a unique 10-character PNR
function generatePNR(prefix = "PNR"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = prefix;
  for (let i = 0; i < (10 - prefix.length); i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

// POST /api/bookings - Create a new booking
export async function POST(req: NextRequest) {
  try {
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
      isPackage,
      sharingType,
      amountPaid,
      totalPrice,
      addons,
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

    const pnr = generatePNR(isPackage ? "PKG" : "PNR");
    const collectionName = isPackage ? "package_bookings" : "bookings";

    const parsedAdults = Number(adults) || 1;
    const parsedChildren = Number(children) || 0;
    const parsedAge = Number(age) || 0;

    const docRef = await addDoc(collection(db, collectionName), {
      pnr,
      busName,
      fromLocation,
      toLocation,
      journeyDate,
      departureTime,
      arrivalTime,
      adults: parsedAdults,
      children: parsedChildren,
      passengerName,
      gender,
      age: parsedAge,
      email,
      mobile,
      status: "confirmed",
      isPackage: isPackage || false,
      sharingType: sharingType || null,
      amountPaid: Number(amountPaid) || Number(totalPrice) || 0,
      totalPrice: Number(totalPrice) || Number(amountPaid) || 0,
      addons: addons || [],
      createdAt: serverTimestamp(),
    });

    // Send SMS confirmation
    try {
      await sendBookingConfirmationSMS(mobile, {
        pnr,
        passengerName,
        busName,
        from: fromLocation,
        to: toLocation,
        date: journeyDate,
        departureTime,
      });
    } catch (smsError) {
      console.error("SMS sending error:", smsError);
      // We don't want to fail the entire booking if SMS fails, 
      // but in production, you might want to retry or log this properly.
    }

    return NextResponse.json({
      success: true,
      pnr,
      id: docRef.id,
      message: "Booking confirmed successfully!",
    });
  } catch (error: any) {
    console.error("Booking error details:", error);
    return NextResponse.json(
      { error: `Booking failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Fetch bookings
export async function GET(req: NextRequest) {
  try {
    const pnr = req.nextUrl.searchParams.get("pnr");

    if (!pnr) {
      return NextResponse.json(
        { error: "PNR is required" },
        { status: 400 }
      );
    }

    const q = query(collection(db, "bookings"), where("pnr", "==", pnr));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "No booking found with this PNR" },
        { status: 404 }
      );
    }

    const bookingData = querySnapshot.docs[0].data();

    return NextResponse.json({ booking: bookingData });
  } catch (error: any) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
