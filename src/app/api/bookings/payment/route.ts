import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

// POST /api/bookings/payment - Update payment status and method
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pnr, paymentMethod, transactionId } = body;

    if (!pnr || !paymentMethod) {
      return NextResponse.json(
        { error: "PNR and Payment Method are required" },
        { status: 400 }
      );
    }

    // Find the booking in either 'bookings' or 'package_bookings'
    const isPackage = pnr.startsWith("PKG");
    const collectionName = isPackage ? "package_bookings" : "bookings";
    
    const q = query(
      collection(db, collectionName),
      where("pnr", "==", pnr)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: `No matching ${isPackage ? "package " : ""}booking found.` },
        { status: 404 }
      );
    }

    const bookingDoc = querySnapshot.docs[0];

    // Update the booking with payment details
    await updateDoc(doc(db, collectionName, bookingDoc.id), {
      paymentStatus: "paid",
      paymentMethod,
      transactionId: transactionId || `TXN${Math.floor(Math.random() * 1000000000)}`,
      paidAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully.",
    });
  } catch (error: any) {
    console.error("Payment update error:", error);
    return NextResponse.json(
      { error: `Failed to update payment: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
