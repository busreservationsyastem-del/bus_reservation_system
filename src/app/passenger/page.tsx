"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Bus, ArrowLeft, User, CheckCircle, Copy, CreditCard, Wallet, Smartphone, Landmark, Download, Clock } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function PassengerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (!storedUser) {
      router.push("/login?redirect=/passenger" + window.location.search);
    }
  }, [router]);

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

  // Generate seat numbers based on passengers
  const totalPassengers = Number(adults) + Number(children);
  const seatNumbers = Array.from({ length: totalPassengers }, (_, i) => `S${Math.floor(Math.random() * 50) + 1}`).join(", ");

  const [passengersData, setPassengersData] = useState<any[]>(
    Array.from({ length: totalPassengers }, () => ({ name: "", gender: "", age: "" }))
  );
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmail(user.email || "");
      setMobile(user.mobile || "");
    }
  }, []);

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

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe)", icon: Smartphone, color: "text-purple-400" },
    { id: "card", name: "Credit / Debit Card", icon: CreditCard, color: "text-blue-400" },
    { id: "netbanking", name: "Net Banking", icon: Landmark, color: "text-orange-400" },
    { id: "wallet", name: "Wallets", icon: Wallet, color: "text-pink-400" },
  ];

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    // Simulate payment processing
    setTimeout(async () => {
      const generatedTxnId = `TXN${Math.floor(Math.random() * 1000000000)}`;
      
      try {
        const res = await fetch("/api/bookings/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pnr,
            paymentMethod,
            transactionId: generatedTxnId
          }),
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

    // Basic validation
    const incompletePassenger = passengersData.some(p => !p.name || !p.age || !p.gender);
    if (incompletePassenger || !email || !mobile) {
      setError("All fields are required.");
      return;
    }

    // Child age validation
    const invalidChildAge = passengersData.some((p, index) => index >= Number(adults) && Number(p.age) > 12);
    if (invalidChildAge) {
      setError("Children must be 12 years old or younger.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busName,
          fromLocation,
          toLocation,
          journeyDate,
          departureTime,
          arrivalTime,
          adults: Number(adults),
          children: Number(children),
          passengerName: passengersData[0].name, // First passenger as primary
          gender: passengersData[0].gender,
          age: Number(passengersData[0].age),
          email,
          mobile,
          amountPaid: totalFare,
          totalPrice: totalFare,
          allPassengers: passengersData, // New field for all details
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPnr(data.pnr);
        setBooked(true);
      } else {
        setError(data.error || "Booking failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#1a1a6e",
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bus_Ticket_${pnr}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Redirect if no bus info
  if (!busName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No bus selected. Please search for a bus first.</p>
          <Link
            href="/booking"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Booking
          </Link>
        </div>
      </div>
    );
  }

  // Success screen
  if (booked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
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
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
              <p className="text-white/70 mb-6">Your ticket has been booked. Keep your PNR safe.</p>

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-sm text-red-200 text-center">
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-white/10 p-4 mb-6">
                <p className="text-sm text-white/60 mb-1">Your PNR Number</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-wider text-yellow-300">
                    {pnr}
                  </span>
                  <button
                    onClick={copyPnr}
                    className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"
                    title="Copy PNR"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied && (
                  <p className="mt-1 text-xs text-green-300">Copied to clipboard!</p>
                )}
              </div>

              {/* Payment Section */}
              {!paid ? (
                <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-6 text-left">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    Select Payment Method
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                          paymentMethod === method.id
                            ? "border-blue-500 bg-blue-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                        <span className="font-medium text-sm">{method.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={!paymentMethod || paymentProcessing}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-500 to-green-700 py-4 font-bold shadow-lg transition-all hover:from-green-600 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay ₹{totalFare} Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mb-6 rounded-xl bg-green-500/20 border border-green-500/30 p-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-3">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-400">Payment Successful!</h3>
                  <p className="text-white/70 text-sm mt-1">Transaction ID: {txnId}</p>
                </div>
              )}

              {/* Booking summary */}
              <div className="rounded-xl bg-white/5 p-4 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Bus</span>
                  <span className="font-medium">{busName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Route</span>
                  <span className="font-medium">{fromLocation} → {toLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Date</span>
                  <span className="font-medium">{journeyDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time</span>
                  <span className="font-medium">{departureTime} - {arrivalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Passenger</span>
                  <span className="font-medium">{passengersData[0]?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Fare</span>
                  <span className="font-medium text-green-300">₹{totalFare}</span>
                </div>
              </div>

              {paid && (
                <div className="mt-6 flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
                  <button 
                    onClick={downloadPDF}
                    className="w-full bg-white text-[#1a1a6e] font-black py-4 rounded-2xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Receipt
                  </button>
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 font-semibold text-center hover:from-blue-600 hover:to-blue-800 transition-all"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/booking"
                    className="flex-1 rounded-xl bg-white/10 py-3 font-semibold text-center hover:bg-white/20 transition-colors"
                  >
                    Book Another
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Hidden PDF Template */}
        <div id="booking-card" style={{
          position: 'fixed',
          left: '-9999px',
          backgroundColor: '#1a1a6e',
          color: '#ffffff',
          padding: '48px',
          borderRadius: '40px',
          width: '600px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '256px',
            height: '256px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '9999px',
            filter: 'blur(64px)',
            marginRight: '-128px',
            marginTop: '-128px'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Bus style={{ height: '32px', width: '32px', color: '#fde047' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', margin: 0 }}>Bus Reservation</h3>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>Ticket Confirmation</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Status</p>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>Confirmed</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '32px', marginBottom: '32px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', textAlign: 'center' }}>Booking PNR</p>
              <p style={{ fontSize: '48px', fontWeight: 900, color: '#fde047', textAlign: 'center', letterSpacing: '-0.05em', margin: 0 }}>{pnr}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Passenger Details</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {passengersData.map((p, i) => (
                      <div key={i} style={{ fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', marginLeft: '8px' }}>
                          ({p.gender}, {p.age} yrs)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Bus Service</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{busName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Route</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{fromLocation} → {toLocation}</p>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Travel Date</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{journeyDate}</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Mobile Number</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{mobile}</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Seat Numbers</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{seatNumbers}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Price</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#fde047', margin: 0 }}>₹{totalFare}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'medium' }}>This is an electronically generated booking confirmation. No signature required.</p>
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
          <Link
            href="/booking"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <h1 className="text-lg font-bold sm:text-xl">Passenger Details</h1>
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
        <div className="mx-auto max-w-2xl">
          {/* Trip Summary */}
          <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">{busName}</span>
              <span className="text-green-300 font-bold">₹{totalFare}</span>
            </div>
            <p className="mt-1 text-sm text-white/60">
              {fromLocation} → {toLocation} | {journeyDate} | {departureTime} - {arrivalTime}
            </p>
          </div>

          {/* Passenger Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8"
          >
            <h2 className="mb-6 text-lg font-semibold">Enter Passenger Information</h2>

            <div className="space-y-6">
              {passengersData.map((passenger, index) => (
                <div key={index} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Passenger {index + 1} {index < Number(adults) ? "(Adult)" : "(Child)"}
                  </h3>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-white/70">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => {
                        const newPassengers = [...passengersData];
                        newPassengers[index].name = e.target.value;
                        setPassengersData(newPassengers);
                      }}
                      placeholder="Enter full name"
                      className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        Gender
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => {
                          const newPassengers = [...passengersData];
                          newPassengers[index].gender = e.target.value;
                          setPassengersData(newPassengers);
                        }}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        required
                      >
                        <option value="" className="text-gray-900">Select</option>
                        <option value="Male" className="text-gray-900">Male</option>
                        <option value="Female" className="text-gray-900">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/70">
                        Age
                      </label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) => {
                          const newPassengers = [...passengersData];
                          newPassengers[index].age = e.target.value;
                          setPassengersData(newPassengers);
                        }}
                        placeholder="Age"
                        min={1}
                        max={120}
                        className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Note: Half ticket for children.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-800 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5" />
              {loading ? "Confirming..." : "Confirm Ticket"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function PassengerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <PassengerForm />
    </Suspense>
  );
}
