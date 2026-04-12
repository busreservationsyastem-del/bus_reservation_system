import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";

// Generate a unique 10-character Pass ID
function generatePassId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let passId = "PASS";
  for (let i = 0; i < 6; i++) {
    passId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return passId;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      passengerName, gender, age, email, mobile, 
      duration, price, passType 
    } = body;

    if (!passengerName || !email || !mobile || !duration || !passType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const passId = generatePassId();
    
    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date();
    const months = parseInt(duration);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const passData = {
      passId,
      passengerName,
      gender,
      age: Number(age),
      email,
      mobile,
      passType,
      duration: `${months} Month(s)`,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: "active",
      price: Number(price),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bus_passes"), passData);

    return NextResponse.json({ 
      success: true, 
      passId,
      docId: docRef.id 
    });
  } catch (error: any) {
    console.error("Error creating bus pass:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passId = searchParams.get("passId");
    const mobile = searchParams.get("mobile");

    if (!passId && !mobile) {
      return NextResponse.json({ error: "Pass ID or Mobile is required" }, { status: 400 });
    }

    let q;
    if (passId && mobile) {
      q = query(collection(db, "bus_passes"), where("passId", "==", passId), where("mobile", "==", mobile));
    } else if (passId) {
      q = query(collection(db, "bus_passes"), where("passId", "==", passId));
    } else {
      q = query(collection(db, "bus_passes"), where("mobile", "==", mobile));
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const passes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(passes);
  } catch (error: any) {
    console.error("Error fetching bus pass:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
