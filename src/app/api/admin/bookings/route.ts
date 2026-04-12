import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";

export async function GET() {
  try {
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const packageBookingsQuery = query(collection(db, "package_bookings"), orderBy("createdAt", "desc"));
    
    const [bookingsSnapshot, packageBookingsSnapshot] = await Promise.all([
      getDocs(bookingsQuery),
      getDocs(packageBookingsQuery)
    ]);
    
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const packageBookings = packageBookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Combine and sort by createdAt
    const allBookings = [...bookings, ...packageBookings].sort((a: any, b: any) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
    
    return NextResponse.json(allBookings);
  } catch (error) {
    console.error("Failed to fetch all bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, isPackage } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const collectionName = isPackage ? "package_bookings" : "bookings";
    await deleteDoc(doc(db, collectionName, id));

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
