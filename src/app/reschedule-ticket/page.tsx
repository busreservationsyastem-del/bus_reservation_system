"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Ticket, CalendarDays, Bus } from "lucide-react";

export default function RescheduleTicketPage() {
  const [pnr, setPnr] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    alert(`Rescheduling ticket: PNR ${pnr}, Mobile ${mobile}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center p-1 overflow-hidden">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
              Bus Reservation System
            </span>
          </div>
        </div>
        <button className="rounded-lg p-2 hover:bg-white/10 transition-colors" aria-label="Toggle menu">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-10 mt-4">
            <h1 className="text-2xl font-bold tracking-wide uppercase mb-2">RESCHEDULE YOUR JOURNEY</h1>
            <p className="text-sm text-white/60 font-light">Verify your Details and Re-Schedule your Journey Tickets</p>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-12"></div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-3">
              <label className="block text-center text-sm font-semibold text-white/70 uppercase tracking-wider">PNR Number</label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 outline-none placeholder:text-white/30 text-lg focus:bg-white/10 focus:border-white/40 transition-all text-center"
                placeholder="Enter PNR"
                required
              />
            </div>

            <div className="text-center text-white/30 text-xl font-bold">+</div>

            <div className="space-y-3">
              <label className="block text-center text-sm font-semibold text-white/70 uppercase tracking-wider">Mobile No</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 outline-none placeholder:text-white/30 text-lg focus:bg-white/10 focus:border-white/40 transition-all text-center"
                placeholder="Enter Mobile No"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-full bg-white text-[#1a1a6e] font-bold py-5 rounded-2xl shadow-xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-lg"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Info Area */}
      <div className="bg-[#8c8c8c] py-4 text-center relative mt-auto">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button className="bg-[#d9534f] text-white px-4 py-2 rounded-md shadow-md text-sm font-medium flex items-center gap-1">
            Need Help?
          </button>
        </div>
        <p className="text-white text-xs mt-4">© Bus Reservation System All Rights Reserved 2026</p>
      </div>

      <div className="bg-white p-6 flex flex-col items-center gap-8 border-t border-gray-200">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Ticket className="h-16 w-16 text-gray-400" />
            <div className="absolute -bottom-2 -right-2 bg-blue-700 rounded-full p-1.5 border-2 border-white">
              <Search className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-center space-y-2 max-w-xs">
            <p className="text-sm font-semibold text-gray-600">Search Ticket:</p>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Enter your PNR Number and Transaction Password and Submit and enter OTP Number and Reschedule.
            </p>
          </div>
        </div>

        <div className="relative">
          <Ticket className="h-16 w-16 text-gray-400" />
          <div className="absolute -bottom-2 -right-2 bg-orange-400 rounded-full p-1.5 border-2 border-white">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="p-8 text-center bg-white border-t border-gray-200">
        <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
