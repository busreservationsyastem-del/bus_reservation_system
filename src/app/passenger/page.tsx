"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Bus, ArrowLeft, User, CheckCircle, Copy, CreditCard, Wallet, Smartphone, Landmark, Download, Clock } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

function PassengerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const busName = searchParams.get("busName") || "";
  const busType = searchParams.get("busType") || "Standard AC";
  const fromLocation = searchParams.get("from") || "";
  const toLocation = searchParams.get("to") || "";
  const journeyDate = searchParams.get("date") || "";
  const departureTime = searchParams.get("departure") || "";
  const arrivalTime = searchParams.get("arrival") || "";
  const fare = searchParams.get("fare") || "0";
  const adults = searchParams.get("adults") || "1";
  const children = searchParams.get("children") || "0";

  const totalFare = (Number(adults) * Number(fare)) + (Number(children) * Number(fare) / 2);
  const totalPassengers = Number(adults) + Number(children);

  const [seatNumbers] = useState(() => {
    return Array.from({ length: totalPassengers }, (_, i) => `S${Math.floor(Math.random() * 50) + 1}`).join(", ");
  });

  const [passengersData, setPassengersData] = useState<any[]>(
    Array.from({ length: totalPassengers }, () => ({ name: "", gender: "", age: "" }))
  );
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnr, setPnr] = useState("");
  const [booked, setBooked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (!storedUser) {
      router.push("/login?redirect=/passenger" + window.location.search);
    } else {
      const user = JSON.parse(storedUser);
      setEmail(user.email || "");
      setMobile(user.mobile || "");
    }
  }, [router, searchParams]);

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe)", icon: Smartphone, color: "text-purple-400" },
    { id: "card", name: "Credit / Debit Card", icon: CreditCard, color: "text-blue-400" },
    { id: "netbanking", name: "Net Banking", icon: Landmark, color: "text-orange-400" },
    { id: "wallet", name: "Wallets", icon: Wallet, color: "text-pink-400" },
  ];

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    setTimeout(async () => {
      const generatedTxnId = `TXN${Math.floor(Math.random() * 1000000000)}`;
      try {
        const res = await fetch("/api/bookings/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pnr, paymentMethod, transactionId: generatedTxnId }),
        });
        const data = await res.json();
        if (data.success) {
          setTxnId(generatedTxnId);
          setPaid(true);
        } else {
          setError(data.error || "Payment update failed.");
        }
      } catch {
        setError("Failed to update payment status.");
      } finally {
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const incomplete = passengersData.some(p => !p.name || !p.age || !p.gender);
    if (incomplete || !email || !mobile) {
      setError("All fields are required.");
      return;
    }

    // Validate child ages (first 'adults' are adults, remaining are children)
    const childPassengers = passengersData.slice(Number(adults));
    const invalidChild = childPassengers.find(p => Number(p.age) >= 12);
    if (invalidChild) {
      setError(`Passenger "${invalidChild.name}" is ${invalidChild.age} years old. Children must be under 12 for half-ticket.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busName, fromLocation, toLocation, journeyDate, departureTime, arrivalTime,
          adults: Number(adults), children: Number(children),
          passengerName: passengersData[0].name, gender: passengersData[0].gender,
          age: Number(passengersData[0].age), email, mobile,
          amountPaid: totalFare, totalPrice: totalFare, allPassengers: passengersData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPnr(data.pnr);
        setBooked(true);
      } else {
        setError(data.error || "Booking failed.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyPnr = () => {
    navigator.clipboard.writeText(pnr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    const element = document.getElementById("booking-card");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#1a1a6e", logging: false, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bus_Ticket_${pnr}.pdf`);
    } catch (error) {
      console.error("PDF failed:", error);
    }
  };

  if (!busName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg mb-4">No bus selected.</p>
          <Link href="/booking" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">Go to Booking</Link>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-3">
              <Bus className="h-6 w-6" />
              <h1 className="text-lg font-bold sm:text-xl">Booking Confirmed</h1>
            </div>
          </div>
          {mounted && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300">
              <Clock className="h-3 w-3" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
        </header>
        <main className="px-4 pb-12 sm:px-8">
          <div className="mx-auto max-w-lg mt-8">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
              <p className="text-white/70 mb-6">PNR: <span className="text-yellow-300 font-mono font-bold">{pnr}</span></p>
              
              {!paid ? (
                <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-6 text-left">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-blue-400" /> Payment</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
                    {paymentMethods.map((m) => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${paymentMethod === m.id ? "border-blue-500 bg-blue-500/20" : "border-white/10 bg-white/5"}`}><m.icon className={`h-6 w-6 ${m.color}`} /><span className="font-medium text-sm">{m.name}</span></button>
                    ))}
                  </div>
                  <button onClick={handlePayment} disabled={!paymentMethod || paymentProcessing} className="w-full rounded-xl bg-green-600 py-4 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                    {paymentProcessing ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : `Pay ₹${totalFare} Now`}
                  </button>
                </div>
              ) : (
                <div className="mb-6 rounded-xl bg-green-500/20 border border-green-500/30 p-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <h3 className="text-lg font-bold text-green-400">Payment Successful!</h3>
                  <p className="text-white/70 text-sm mt-1">ID: {txnId}</p>
                </div>
              )}

              {paid && (
                <button onClick={downloadPDF} className="w-full bg-white text-[#1a1a6e] font-black py-4 rounded-2xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg mb-6">
                  <Download className="h-4 w-4" /> Download PDF Receipt
                </button>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-center">Home</Link>
                <Link href="/booking" className="flex-1 rounded-xl bg-white/10 py-3 font-semibold text-center">Book Another</Link>
              </div>
            </div>
          </div>
        </main>

        <div id="booking-card" style={{ position: 'fixed', left: '-9999px', backgroundColor: '#1a1a6e', color: '#ffffff', padding: '48px', borderRadius: '40px', width: '600px', border: '4px solid rgba(255, 255, 255, 0.2)', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '16px' }}><Bus style={{ height: '32px', width: '32px', color: '#fde047' }} /></div>
              <div style={{ textAlign: 'left' }}><h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>Bus Reservation</h3><p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>Ticket Confirmation</p></div>
            </div>
            <div style={{ textAlign: 'right' }}><p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>Status</p><p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', margin: 0 }}>Confirmed</p></div>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '8px' }}>Booking PNR</p>
            <p style={{ fontSize: '48px', fontWeight: 900, color: '#fde047', margin: 0 }}>{pnr}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 4px 0' }}>Bus Service</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{busName}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '16px 0 4px 0' }}>Route</p>
              <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{fromLocation} → {toLocation}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 4px 0' }}>Travel Date</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{journeyDate}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '16px 0 4px 0' }}>Mobile</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{mobile}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/booking" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex items-center gap-3"><User className="h-6 w-6" /><h1 className="text-lg font-bold sm:text-xl">Passenger Details</h1></div>
        </div>
        {mounted && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300">
            <Clock className="h-3 w-3" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </header>
      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-2xl mt-6">
          <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex justify-between items-center"><span className="font-semibold">{busName}</span><span className="text-green-300 font-bold">₹{totalFare}</span></div>
            <p className="mt-1 text-sm text-white/60">{fromLocation} → {toLocation} | {journeyDate}</p>
            <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[8px]">!</span>
              Note: Children under 12 years are eligible for half-ticket.
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-semibold">Enter Information</h2>
            <div className="space-y-6">
              {passengersData.map((p, i) => (
                <div key={i} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2"><User className="h-4 w-4" /> Passenger {i + 1}</h3>
                  <input type="text" value={p.name} onChange={(e) => { const nd = [...passengersData]; nd[i].name = e.target.value; setPassengersData(nd); }} placeholder="Full Name" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white" required />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={p.gender} onChange={(e) => { const nd = [...passengersData]; nd[i].gender = e.target.value; setPassengersData(nd); }} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white" required><option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option></select>
                    <input type="number" value={p.age} onChange={(e) => { const nd = [...passengersData]; nd[i].age = e.target.value; setPassengersData(nd); }} placeholder="Age" min={1} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white" required />
                  </div>
                </div>
              ))}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white" required />
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Mobile" maxLength={10} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white" required />
            </div>
            {error && <p className="mt-4 text-red-200 text-sm bg-red-500/20 p-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-green-600 py-3.5 font-semibold shadow-lg">{loading ? "Confirming..." : "Confirm Ticket"}</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function PassengerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a6e] flex items-center justify-center text-white"><p>Loading...</p></div>}>
      <PassengerForm />
    </Suspense>
  );
}
