"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, Search, RefreshCw, ChevronRight, CheckCircle, CreditCard, Smartphone, Landmark, Wallet, Copy, Calendar, ShieldCheck, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function RenewalBusPassPage() {
  const [step, setStep] = useState(1); // 1: Search, 2: Renew Details, 3: Payment, 4: Success
  const [passId, setPassId] = useState("");
  const [mobile, setMobile] = useState("");
  const [foundPass, setFoundPass] = useState<any>(null);
  const [duration, setDuration] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState("");

  const durations = [
    { value: "1", label: "1 Month", price: 500 },
    { value: "2", label: "2 Months", price: 900 },
    { value: "6", label: "6 Months", price: 2500 },
  ];

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe)", icon: Smartphone, color: "text-purple-400" },
    { id: "card", name: "Credit / Debit Card", icon: CreditCard, color: "text-blue-400" },
    { id: "netbanking", name: "Net Banking", icon: Landmark, color: "text-orange-400" },
    { id: "wallet", name: "Wallets", icon: Wallet, color: "text-pink-400" },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passId || !mobile) {
      alert("Please enter both Pass ID and Mobile Number");
      return;
    }

    // Pass ID validation (e.g., PASSXXXXXX)
    if (!/^PASS[A-Z0-9]{6}$/.test(passId)) {
      setError("Invalid Bus Pass ID format. It should be PASS followed by 6 characters.");
      return;
    }

    // Mobile validation (10 digits)
    if (mobile.length !== 10) {
      setError("Please enter exactly 10 digits for the registered mobile number.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Mobile number must contain only numbers.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/bus-pass?passId=${passId}&mobile=${mobile}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        setFoundPass(data[0]);
        setStep(2);
      } else {
        setError("Invalid Bus Pass ID or Phone Number. Please check and try again.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenewalSubmit = () => {
    setStep(3);
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    
    try {
      const selectedDuration = durations.find(d => d.value === duration);
      
      const response = await fetch("/api/bus-pass/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: foundPass.passId,
          duration: duration,
          price: selectedDuration?.price || 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewExpiryDate(data.newExpiry);
        setPaymentProcessing(false);
        setStep(4);
      } else {
        alert(data.error || "Renewal failed");
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Error during renewal:", error);
      alert("Something went wrong. Please try again.");
      setPaymentProcessing(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("bus-pass-card");
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
      pdf.save(`Bus_Pass_Renewed_${foundPass.passId}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
        <header className="p-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <Bus className="h-6 w-6" />
            <h1 className="text-xl font-bold uppercase tracking-tight">Renewal Successful</h1>
          </div>
        </header>
        <main className="p-6 flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl w-full text-center">
            <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Renewed!</h2>
            <p className="text-white/60 mb-8 font-medium">Your commuter bus pass has been renewed successfully.</p>

            {/* Hidden PDF Template */}
            <div id="bus-pass-card" style={{
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
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '256px',
                height: '256px',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '9999px',
                filter: 'blur(64px)',
                marginLeft: '-128px',
                marginBottom: '-128px'
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
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', margin: 0 }}>City Commuter</h3>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>Bus Pass System</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Pass Status</p>
                    <p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>Renewed</p>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '32px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px', margin: 0 }}>Bus Pass ID</p>
                    <p style={{ fontSize: '48px', fontWeight: 900, color: '#fde047', letterSpacing: '-0.05em', margin: 0 }}>{foundPass.passId}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Passenger</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{foundPass.passengerName}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Gender/Age</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{foundPass.gender} / {foundPass.age}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Issue Date</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{foundPass.startDate}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>New Expiry</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase', margin: 0 }}>{newExpiryDate}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                  <div style={{ height: '4px', width: '4px', backgroundColor: '#ffffff', borderRadius: '9999px' }}></div>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5em', margin: 0 }}>Authentic Bus Pass</p>
                  <div style={{ height: '4px', width: '4px', backgroundColor: '#ffffff', borderRadius: '9999px' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Bus Pass ID</span>
              <span className="text-4xl font-black text-yellow-300 tracking-tighter">{foundPass.passId}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={downloadPDF}
                className="bg-green-500 text-white font-black py-4 rounded-2xl hover:bg-green-600 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <Link href="/bus-pass" className="bg-white text-[#1a1a6e] font-black py-4 rounded-2xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center">
                Home
              </Link>
            </div>

            <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">Passenger</span>
                <span className="font-bold">{foundPass.passengerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">New Validity</span>
                <span className="font-bold">{durations.find(d => d.value === duration)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">New Expiry Date</span>
                <span className="font-bold text-green-300">{newExpiryDate}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
        <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <button onClick={() => setStep(2)} className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-tight">Renewal Payment</h1>
        </header>
        <main className="p-6 max-w-lg mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Select Payment Method</h2>
            <div className="space-y-4 mb-8">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    paymentMethod === method.id 
                    ? "bg-white/20 border-white shadow-xl scale-[1.02]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className={`p-3 rounded-full bg-white/10 ${method.color}`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <span className="font-black uppercase tracking-tighter text-sm">{method.name}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={handlePayment}
              disabled={!paymentMethod || paymentProcessing}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-[0.2em] shadow-2xl"
            >
              {paymentProcessing ? "Processing..." : `Pay ₹${durations.find(d => d.value === duration)?.price}`}
              {!paymentProcessing && <ChevronRight className="h-6 w-6" />}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
        <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <button onClick={() => setStep(1)} className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl font-bold uppercase tracking-tight">Select Renewal Period</h1>
        </header>
        <main className="p-6 max-w-lg mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Pass Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Pass ID</span>
                  <span className="text-sm font-bold text-yellow-300">{foundPass.passId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Passenger</span>
                  <span className="text-sm font-bold">{foundPass.passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Current Expiry</span>
                  <span className="text-sm font-bold text-red-300">{foundPass.expiryDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Select New Period</h3>
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${
                    duration === d.value 
                    ? "bg-white/20 border-white shadow-xl scale-[1.02]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xl font-black uppercase tracking-tight">{d.label}</span>
                  </div>
                  <span className="text-2xl font-black text-blue-300">₹{d.price}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleRenewalSubmit}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-2xl"
            >
              Proceed to Payment
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <Link href="/bus-pass" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-tight">Pass Renewal</h1>
      </header>
      <main className="p-6 max-w-lg mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Find Your Pass</h2>
            <p className="text-white/60 text-sm font-medium">Enter your details to renew your existing bus pass.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Bus Pass ID</label>
              <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                <ShieldCheck className="h-5 w-5 text-white/40 group-focus-within:text-white" />
                <input 
                  type="text" 
                  value={passId}
                  onChange={(e) => setPassId(e.target.value.toUpperCase())}
                  placeholder="PASSXXXXXX" 
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20 uppercase" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Registered Mobile</label>
              <div className={`flex items-center gap-4 border-b pb-3 group transition-colors ${error && mobile.length !== 10 ? 'border-red-500' : 'border-white/20'}`}>
                <Smartphone className={`h-5 w-5 transition-colors ${error && mobile.length !== 10 ? 'text-red-400' : 'text-white/40 group-focus-within:text-white'}`} />
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (error) setError("");
                  }}
                  placeholder="10 digit number" 
                  maxLength={10}
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Pass"}
              <Search className="h-6 w-6" />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-bold text-red-300 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5" />
                Note: {error}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
