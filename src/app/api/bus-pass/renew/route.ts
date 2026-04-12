import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passId, duration, price } = body;

    if (!passId || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const q = query(collection(db, "bus_passes"), where("passId", "==", passId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const passDoc = querySnapshot.docs[0];
    const passData = passDoc.data();
    
    // Calculate new expiry date
    const currentExpiry = new Date(passData.expiryDate);
    const today = new Date();
    
    // If pass is already expired, start from today. Otherwise, extend from current expiry.
    const baseDate = currentExpiry < today ? today : currentExpiry;
    
    const newExpiry = new Date(baseDate);
    const months = parseInt(duration);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    await updateDoc(doc(db, "bus_passes", passDoc.id), {
      duration: `${months} Month(s)`,
      expiryDate: newExpiry.toISOString().split('T')[0],
      status: "active",
      price: Number(price),
      lastRenewedAt: serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      newExpiry: newExpiry.toISOString().split('T')[0] 
    });
  } catch (error: any) {
    console.error("Error renewing bus pass:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
