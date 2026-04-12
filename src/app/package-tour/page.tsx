"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, Users, ChevronRight, Bus, User, Mail, Phone, CreditCard, Smartphone, Landmark, Wallet, CheckCircle, Copy, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";

const packages = [
  {
    id: 1,
    title: "SOMNATH PACKAGE TOUR",
    from: "AHMEDABAD",
    to: "SOMNATH",
    priceSingle: 4000,
    priceDouble: 7050,
    type: "Deluxe"
  },
  {
    id: 2,
    title: "STATUE OF UNITY (KEVADIA)",
    from: "VADODARA",
    to: "KEVADIA",
    priceSingle: 3200,
    priceDouble: 5800,
    type: "Premium"
  },
  {
    id: 3,
    title: "RANN UTSAV KUTCH",
    from: "BHUJ",
    to: "DHORDO",
    priceSingle: 8500,
    priceDouble: 15000,
    type: "Luxury"
  },
  {
    id: 4,
    title: "GIR SAFARI TOUR",
    from: "JUNAGADH",
    to: "SASAN GIR",
    priceSingle: 5500,
    priceDouble: 9800,
    type: "Wildlife"
  },
  {
    id: 5,
    title: "DWARKA DIVINE TOUR",
    from: "JAMNAGAR",
    to: "DWARKA",
    priceSingle: 3500,
    priceDouble: 6200,
    type: "Spiritual"
  },
  {
    id: 6,
    title: "SAPUTARA HILL STATION",
    from: "SURAT",
    to: "SAPUTARA",
    priceSingle: 4500,
    priceDouble: 8200,
    type: "Leisure"
  }
];

export default function PackageTourPage() {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: List, 2: Details, 3: Payment, 4: Success
  const [passengers, setPassengers] = useState("1");
  const [passengersData, setPassengersData] = useState<any[]>(
    Array.from({ length: 1 }, () => ({ name: "", gender: "", age: "", isChild: false }))
  );
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnr, setPnr] = useState("");
  const [txnId, setTxnId] = useState("");
  const [selectedSharingType, setSelectedSharingType] = useState<"single" | "double">("single");
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [roomCombinations, setRoomCombinations] = useState<any[]>([]);
  const [selectedCombination, setSelectedCombination] = useState<any>(null);

  const CustomCalendarInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Handle manual text input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Format as dd-mm-yyyy
      val = val.replace(/\D/g, '').slice(0, 8);
      if (val.length >= 4) {
        val = val.slice(0, 2) + '-' + val.slice(2, 4) + '-' + val.slice(4);
      } else if (val.length >= 2) {
        val = val.slice(0, 2) + '-' + val.slice(2);
      }
      onChange(val);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        onChange(format(date, "dd-MM-yyyy"));
        setIsOpen(false);
      }
    };

    const handleToday = () => {
      handleDateSelect(new Date());
    };

    const handleClear = () => {
      onChange("");
      setIsOpen(false);
    };

    return (
      <div className="relative w-full">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between border-b border-white/20 pb-3 group">
            <input 
              type="text" 
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
            />
            <PopoverTrigger asChild>
              <button type="button" className="outline-none">
                <CalendarIcon className={`h-6 w-6 transition-colors ${isOpen ? "text-white" : "text-white/40 group-focus-within:text-white"}`} />
              </button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-auto p-0 bg-[#2d2d2d] border-white/10 shadow-2xl rounded-xl" align="end">
            <div className="p-3 bg-[#2d2d2d] text-white">
              <Calendar
                mode="single"
                selected={value ? parse(value, "dd-MM-yyyy", new Date()) : undefined}
                onSelect={handleDateSelect}
                initialFocus
                className="bg-transparent"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-black uppercase tracking-widest text-white",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-white/5 hover:bg-white/10 rounded-md transition-colors flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-white/40 rounded-md w-9 font-bold text-[10px] uppercase",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-bold aria-selected:opacity-100 hover:bg-white/10 rounded-md transition-all",
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600 rounded-md",
                  day_today: "bg-white/5 text-blue-400",
                  day_outside: "text-white/10 opacity-50",
                  day_disabled: "text-white/10 opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <button 
                  onClick={handleClear}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  Clear
                </button>
                <button 
                  onClick={handleToday}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  Today
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const generateRoomCombinations = (numPassengers: number, priceSingle: number, priceDouble: number) => {
    const combinations = [];
    for (let i = 0; i <= Math.floor(numPassengers / 2); i++) {
      const doubleRooms = i;
      const singleRooms = numPassengers - (doubleRooms * 2);
      if (singleRooms >= 0) {
        const combination = {
          double: doubleRooms,
          single: singleRooms,
          price: (doubleRooms * priceDouble) + (singleRooms * priceSingle)
        };
        combinations.push(combination);
      }
    }
    setRoomCombinations(combinations);
    if (combinations.length > 0) {
      setSelectedCombination(combinations[0]);
    }
  };

  const handleBookAnother = () => {
    setStep(1);
    setSelectedPackage(null);
    setPassengerName("");
    setGender("");
    setAge("");
    setEmail("");
    setMobile("");
    setTravelDate("");
    setPassengers("1");
    setPaymentMethod("");
    setSelectedAddons([]);
    setSelectedSharingType("single");
  };

  const availableAddons = [
    { id: 1, name: "Luxury Meals", price: 500, description: "Premium breakfast, lunch, and dinner" },
    { id: 2, name: "Hotel Upgrade", price: 1500, description: "Upgrade to 5-star accommodation" },
    { id: 3, name: "Guided City Tour", price: 800, description: "Personal guide for local sightseeing" },
    { id: 4, name: "Travel Insurance", price: 300, description: "Comprehensive travel coverage" },
  ];

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    
    let basePrice = 0;
    const passengerCount = Number(passengers);
    
    if (selectedSharingType === "single") {
      // Single sharing: charged per person
      basePrice = passengerCount * selectedPackage.priceSingle;
    } else {
      // Double sharing: charged per pair (2 persons = 1 unit)
      // If there's an odd number of passengers, the extra person is treated as a full double sharing unit
      const pairs = Math.ceil(passengerCount / 2);
      basePrice = pairs * selectedPackage.priceDouble;
    }
    
    const addonsPrice = selectedAddons.reduce((acc, id) => {
      const addon = availableAddons.find(a => a.id === id);
      return acc + (addon?.price || 0);
    }, 0);
    
    return basePrice + addonsPrice;
  };

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe)", icon: Smartphone, color: "text-purple-400" },
    { id: "card", name: "Credit / Debit Card", icon: CreditCard, color: "text-blue-400" },
    { id: "netbanking", name: "Net Banking", icon: Landmark, color: "text-orange-400" },
    { id: "wallet", name: "Wallets", icon: Wallet, color: "text-pink-400" },
  ];

  const handleBookClick = (pkg: any) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incompletePassenger = passengersData.some(p => !p.name || !p.gender || !p.age);
    if (incompletePassenger || !email || !mobile || !travelDate) {
      alert("Please fill all details");
      return;
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // Child age validation
    const invalidChildAge = passengersData.some(p => p.isChild && Number(p.age) > 12);
    if (invalidChildAge) {
      alert("Children must be 12 years old or younger.");
      return;
    }

    setStep(3);
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    
    // Create the booking first
    try {
      const generatedPnr = `PKG${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const generatedTxnId = `TXN${Math.floor(Math.random() * 1000000000)}`;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busName: selectedPackage.title,
          fromLocation: selectedPackage.from,
          toLocation: selectedPackage.to,
          journeyDate: travelDate,
          departureTime: "06:00 AM", // Default for package tours
          arrivalTime: "09:00 PM", // Default for package tours
          adults: Number(passengers),
          children: 0,
          passengerName: passengersData[0].name,
          gender: passengersData[0].gender,
          age: Number(passengersData[0].age),
          email,
          mobile,
          isPackage: true,
          sharingType: selectedSharingType,
          addons: selectedAddons.map(id => availableAddons.find(a => a.id === id)),
          amountPaid: calculateTotalPrice(),
          totalPrice: calculateTotalPrice(),
          allPassengers: passengersData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Now update payment status
        await fetch("/api/bookings/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pnr: data.pnr,
            paymentMethod,
            transactionId: generatedTxnId
          }),
        });

        setPnr(data.pnr);
        setTxnId(generatedTxnId);
        setPaymentProcessing(false);
        setStep(4);
      } else {
        alert(data.error || "Booking failed");
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Error during package booking:", error);
      alert("Something went wrong. Please try again.");
      setPaymentProcessing(false);
    }
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
      pdf.save(`Package_Booking_${pnr}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight">CONFIRMED!</h1>
            <p className="text-white/70 mt-2">Your package tour has been booked successfully.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] font-black text-white/40 text-center mb-2 uppercase tracking-[0.3em]">Booking PNR</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-4xl font-black text-yellow-300 tracking-tighter">{pnr}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pnr);
                  alert("PNR Copied!");
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6 text-sm relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Package</span>
                <span className="font-bold text-right max-w-[200px] leading-tight">{selectedPackage.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Passenger</span>
                <span className="font-bold">{passengersData[0]?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Date</span>
                <span className="font-bold">{travelDate}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest">Total Paid</span>
                <span className="text-2xl font-black text-yellow-300">₹{calculateTotalPrice()}</span>
              </div>
            </div>

            {selectedAddons.length > 0 && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Custom Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAddons.map(id => {
                    const addon = availableAddons.find(a => a.id === id);
                    return (
                      <span key={id} className="text-[10px] bg-blue-500/30 text-blue-200 px-3 py-1.5 rounded-lg font-bold border border-blue-500/20">
                        {addon?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={downloadPDF}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all hover:scale-[1.02] shadow-xl uppercase tracking-widest text-xs"
            >
              <Download className="h-4 w-4" />
              Download PDF Receipt
            </button>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/" className="w-full bg-blue-600/20 text-white font-bold py-4 rounded-2xl text-center hover:bg-blue-600/30 border border-blue-500/20 transition-all text-xs uppercase tracking-widest">
                Back to Home
              </Link>
              <button 
                onClick={handleBookAnother}
                className="w-full bg-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/20 border border-white/10 transition-all text-xs uppercase tracking-widest"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>

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
                  <h3 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', margin: 0 }}>Package Tour</h3>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0 }}>Booking Confirmation</p>
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
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Package Tour</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{selectedPackage.title}</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Passengers</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{passengers} Person(s)</p>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{selectedSharingType} Sharing</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Route</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{selectedPackage.from} → {selectedPackage.to}</p>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Travel Date</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{travelDate}</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Mobile Number</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{mobile}</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Email Address</p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Price</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#fde047', margin: 0 }}>₹{calculateTotalPrice()}</p>
                </div>
              </div>
            </div>

            {selectedAddons.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Custom Add-ons Included</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedAddons.map(id => {
                    const addon = availableAddons.find(a => a.id === id);
                    return (
                      <span key={id} style={{ fontSize: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {addon?.name} (+₹{addon?.price})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'medium' }}>This is an electronically generated booking confirmation. No signature required.</p>
            </div>
          </div>
        </div>
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
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/40 uppercase font-bold tracking-widest text-[10px]">Total Amount</span>
                <span className="text-3xl font-black text-yellow-300 tracking-tighter">₹{calculateTotalPrice()}</span>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Base Package</span>
                  <span className="font-bold">
                    ₹{selectedSharingType === "single" ? selectedPackage.priceSingle : selectedPackage.priceDouble} x {selectedSharingType === "single" ? passengers : Math.ceil(Number(passengers) / 2)} {selectedSharingType === "single" ? "Person(s)" : "Pair(s)"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Sharing Type</span>
                  <span className="font-bold uppercase">{selectedSharingType} SHARING</span>
                </div>
                {selectedAddons.map(id => {
                  const addon = availableAddons.find(a => a.id === id);
                  return (
                    <div key={id} className="flex justify-between text-xs text-blue-300">
                      <span>{addon?.name}</span>
                      <span className="font-bold">+₹{addon?.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={!paymentMethod || paymentProcessing}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-[0.2em] shadow-2xl"
            >
              {paymentProcessing ? "Processing..." : `Pay ₹${calculateTotalPrice()}`}
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
          <h1 className="text-xl font-bold uppercase tracking-tight">Customer Details</h1>
        </header>
        <main className="p-6 max-w-lg mx-auto w-full">
          <form onSubmit={handleDetailsSubmit} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
            <div className="space-y-6">
              {passengersData.map((passenger, index) => (
                <div key={index} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Passenger {index + 1}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Full Name</label>
                    <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                      <input 
                        type="text" 
                        value={passenger.name}
                        onChange={(e) => {
                          const newPassengers = [...passengersData];
                          newPassengers[index].name = e.target.value;
                          setPassengersData(newPassengers);
                        }}
                        placeholder="Enter name" 
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
                          value={passenger.gender}
                          onChange={(e) => {
                            const newPassengers = [...passengersData];
                            newPassengers[index].gender = e.target.value;
                            setPassengersData(newPassengers);
                          }}
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
                          value={passenger.age}
                          onChange={(e) => {
                            const newPassengers = [...passengersData];
                            newPassengers[index].age = e.target.value;
                            setPassengersData(newPassengers);
                          }}
                          placeholder="Age" 
                          className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input 
                      type="checkbox"
                      id={`isChild-${index}`}
                      checked={passenger.isChild}
                      onChange={(e) => {
                        const newPassengers = [...passengersData];
                        newPassengers[index].isChild = e.target.checked;
                        setPassengersData(newPassengers);
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-transparent cursor-pointer"
                    />
                    <label htmlFor={`isChild-${index}`} className="text-xs font-bold text-white/60 uppercase tracking-widest cursor-pointer select-none">Is Child?</label>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                 <p className="text-[10px] font-bold text-blue-300 flex items-center gap-2 uppercase tracking-widest">
                   <CheckCircle className="h-3 w-3" />
                   Note: Half ticket for children.
                 </p>
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Travel Date</label>
                <CustomCalendarInput 
                  value={travelDate}
                  onChange={setTravelDate}
                  placeholder="dd-mm-yyyy"
                />
              </div>

              {/* Custom Items / Add-ons Section */}
              <div className="pt-4">
                <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] block mb-4">Enhance Your Trip (Custom Add-ons)</label>
                <div className="grid grid-cols-1 gap-3">
                  {availableAddons.map((addon) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedAddons.includes(addon.id)
                          ? "bg-white/20 border-white shadow-lg"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm">{addon.name}</p>
                        <p className="text-[10px] text-white/40">{addon.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-300">+₹{addon.price}</p>
                        {selectedAddons.includes(addon.id) && (
                          <CheckCircle className="h-4 w-4 text-green-400 ml-auto mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated Total</p>
                <p className="text-2xl font-black text-white">₹{calculateTotalPrice()}</p>
              </div>
              <button type="submit" className="bg-white text-[#1a1a6e] font-black px-8 py-4 rounded-xl flex items-center gap-3 hover:scale-[1.05] transition-all uppercase tracking-widest text-xs">
                Next Step
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-tight">Package tour booking</h1>
        </div>
        <div className="flex flex-col items-center">
          <Bus className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase opacity-60 tracking-widest">BRS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 uppercase tracking-wide">{pkg.title}</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3 text-white/70 font-bold text-xs tracking-widest">
                <span className="bg-white/10 px-3 py-1 rounded-full uppercase">From: {pkg.from}</span>
                <span className="text-white/30">→</span>
                <span className="bg-white/10 px-3 py-1 rounded-full uppercase">To: {pkg.to}</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Select Travel Date</label>
                <CustomCalendarInput 
                  value={travelDate}
                  onChange={setTravelDate}
                  placeholder="dd-mm-yyyy"
                />
              </div>

              <div className="flex items-center justify-between gap-8">
                <div className="flex flex-col flex-grow">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Passengers</label>
                  <select 
                    value={passengers}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setPassengers(e.target.value);
                      setPassengersData(Array.from({ length: count }, () => ({ name: "", gender: "", age: "", isChild: false })));
                      if (selectedPackage) {
                        generateRoomCombinations(count, selectedPackage.priceSingle, selectedPackage.priceDouble);
                      }
                    }}
                    className="outline-none bg-transparent text-xl font-black py-2 cursor-pointer appearance-none border-b border-white/20"
                  >
                    <option value="1" className="bg-[#1a1a6e]">1</option>
                    <option value="2" className="bg-[#1a1a6e]">2</option>
                    <option value="3" className="bg-[#1a1a6e]">3</option>
                    <option value="4" className="bg-[#1a1a6e]">4</option>
                    <option value="5" className="bg-[#1a1a6e]">5</option>
                    <option value="6" className="bg-[#1a1a6e]">6</option>
                    <option value="7" className="bg-[#1a1a6e]">7</option>
                    <option value="8" className="bg-[#1a1a6e]">8</option>
                    <option value="9" className="bg-[#1a1a6e]">9</option>
                    <option value="10" className="bg-[#1a1a6e]">10</option>
                  </select>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-white/40 uppercase block mb-1">Bus Type</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-black uppercase tracking-widest">{pkg.type}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSharingType("single")}
                  className={`bg-white/5 p-5 rounded-2xl border transition-all text-left group hover:bg-white/10 ${
                    selectedSharingType === "single" ? "border-blue-400 bg-white/10 shadow-lg shadow-blue-500/10" : "border-white/10"
                  }`}
                >
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Single Sharing</p>
                  <p className={`text-2xl font-black transition-colors ${selectedSharingType === "single" ? "text-blue-400" : "text-blue-300"}`}>₹{pkg.priceSingle}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSharingType("double")}
                  className={`bg-white/5 p-5 rounded-2xl border transition-all text-left group hover:bg-white/10 ${
                    selectedSharingType === "double" ? "border-blue-400 bg-white/10 shadow-lg shadow-blue-500/10" : "border-white/10"
                  }`}
                >
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Double Sharing</p>
                  <p className={`text-2xl font-black transition-colors ${selectedSharingType === "double" ? "text-white" : "text-white/90"}`}>₹{pkg.priceDouble}</p>
                </button>
              </div>
            </div>

            <button 
              onClick={() => handleBookClick(pkg)}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl uppercase tracking-[0.2em]"
            >
              Book Now
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        ))}
      </main>

      {/* Footer Branding */}
      <div className="mt-auto p-6 flex flex-col items-center gap-2 opacity-60">
        <Bus className="h-6 w-6" />
        <p className="text-xs font-bold uppercase tracking-widest">Bus Reservation System</p>
      </div>
    </div>
  );
}
