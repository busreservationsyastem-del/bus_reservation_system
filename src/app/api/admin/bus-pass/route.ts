import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";

export async function GET() {
  try {
    const q = query(collection(db, "bus_passes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const passes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(passes);
  } catch (error) {
    console.error("Failed to fetch bus passes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await deleteDoc(doc(db, "bus_passes", id));

    return NextResponse.json({ success: true, message: "Pass deleted successfully" });
  } catch (error) {
    console.error("Failed to delete bus pass:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
