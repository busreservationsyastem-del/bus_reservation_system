import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { sendCancellationSMS } from "@/lib/sms";

// POST /api/bookings/cancel - Cancel a booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pnr, email, mobile } = body;

    if (!pnr || !email || !mobile) {
      return NextResponse.json(
        { error: "PNR, Email, and Mobile are required" },
        { status: 400 }
      );
    }

    // Find the booking
    const q = query(
      collection(db, "bookings"),
      where("pnr", "==", pnr),
      where("email", "==", email),
      where("mobile", "==", mobile)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "No matching booking found. Please check your details." },
        { status: 404 }
      );
    }

    const bookingDoc = querySnapshot.docs[0];
    const bookingData = bookingDoc.data();

    if (bookingData.status === "cancelled") {
      return NextResponse.json(
        { error: "This ticket has already been cancelled." },
        { status: 400 }
      );
    }

    // Cancel the booking
    await updateDoc(doc(db, "bookings", bookingDoc.id), {
      status: "cancelled"
    });

    // Send Cancellation SMS
    try {
      await sendCancellationSMS(mobile, {
        pnr,
        passengerName: bookingData.passengerName,
      });
    } catch (smsError) {
      console.error("Cancellation SMS error:", smsError);
    }

    return NextResponse.json({
      success: true,
      message: `Ticket with PNR ${pnr} has been cancelled successfully. Refund will be processed within 7 working days.`,
    });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: `Failed to cancel booking: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
