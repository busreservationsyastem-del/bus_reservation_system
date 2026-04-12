"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, CheckCircle, CreditCard, Smartphone, Landmark, Wallet, Copy, User, Mail, Phone, Calendar, ChevronRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function NewBusPassPage() {
  const [step, setStep] = useState(1); // 1: Details, 2: Duration & Price, 3: Payment, 4: Success
  const [passengerName, setPassengerName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [duration, setDuration] = useState("1"); // 1, 2, 6 months
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [passId, setPassId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [startDate, setStartDate] = useState("");

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

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !gender || !age || !email || !mobile) {
      alert("Please fill all fields");
      return;
    }
    
    // Age validation
    if (Number(age) < 1 || Number(age) > 120) {
      alert("Please enter a valid age.");
      return;
    }

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Mobile number validation (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    
    setStep(2);
  };

  const handleDurationSubmit = () => {
    setStep(3);
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    
    try {
      const selectedDuration = durations.find(d => d.value === duration);
      
      const response = await fetch("/api/bus-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName,
          gender,
          age: Number(age),
          email,
          mobile,
          duration: duration,
          price: selectedDuration?.price || 0,
          passType: "Commuter"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPassId(data.passId);
        // Calculate expiry date locally for UI
        const now = new Date();
        setStartDate(now.toISOString().split('T')[0]);
        const exp = new Date();
        exp.setMonth(exp.getMonth() + parseInt(duration));
        setExpiryDate(exp.toISOString().split('T')[0]);
        setPaymentProcessing(false);
        setStep(4);
      } else {
        alert(data.error || "Application failed");
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Error during pass creation:", error);
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
      pdf.save(`Bus_Pass_${passId}.pdf`);
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
            <h1 className="text-xl font-bold uppercase tracking-tight">Application Successful</h1>
          </div>
        </header>
        <main className="p-6 flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl w-full text-center">
            <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Confirmed!</h2>
            <p className="text-white/60 mb-8 font-medium">Your commuter bus pass has been generated successfully.</p>

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
                    <p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>Active</p>
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
                    <p style={{ fontSize: '48px', fontWeight: 900, color: '#fde047', letterSpacing: '-0.05em', margin: 0 }}>{passId}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Passenger</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{passengerName}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Gender/Age</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{gender} / {age}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Issue Date</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{startDate}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Expiry Date</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#fca5a5', textTransform: 'uppercase', margin: 0 }}>{expiryDate}</p>
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
              <span className="text-4xl font-black text-yellow-300 tracking-tighter">{passId}</span>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(passId);
                    alert("Pass ID copied to clipboard!");
                  }}
                  className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Copy className="h-3 w-3" /> Copy ID
                </button>
              </div>
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
                <span className="font-bold">{passengerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">Validity</span>
                <span className="font-bold">{durations.find(d => d.value === duration)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">Expiry Date</span>
                <span className="font-bold text-green-300">{expiryDate}</span>
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
          <h1 className="text-xl font-bold uppercase tracking-tight">Payment Method</h1>
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
          <h1 className="text-xl font-bold uppercase tracking-tight">Select Pass Duration</h1>
        </header>
        <main className="p-6 max-w-lg mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
            <div className="space-y-4">
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
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Commuter Pass</span>
                  </div>
                  <span className="text-2xl font-black text-blue-300">₹{d.price}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleDurationSubmit}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-2xl"
            >
              Continue to Payment
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
        <h1 className="text-xl font-bold uppercase tracking-tight">New Pass Application</h1>
      </header>
      <main className="p-6 max-w-lg mx-auto w-full">
        <form onSubmit={handleDetailsSubmit} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Full Name</label>
              <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                <User className="h-5 w-5 text-white/40 group-focus-within:text-white" />
                <input 
                  type="text" 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Enter your name" 
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Gender</label>
                <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="outline-none bg-transparent w-full text-lg font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#1a1a6e]">Select</option>
                    <option value="Male" className="bg-[#1a1a6e]">Male</option>
                    <option value="Female" className="bg-[#1a1a6e]">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Age</label>
                <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age" 
                    className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Email Address</label>
              <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                <Mail className="h-5 w-5 text-white/40 group-focus-within:text-white" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com" 
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Mobile Number</label>
              <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                <Phone className="h-5 w-5 text-white/40 group-focus-within:text-white" />
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10 digit number" 
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-2xl">
            Select Duration
            <ChevronRight className="h-6 w-6" />
          </button>
        </form>
      </main>
    </div>
  );
}
