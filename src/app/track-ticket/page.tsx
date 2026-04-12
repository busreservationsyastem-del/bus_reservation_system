"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Share2, Bus } from "lucide-react";

export default function TrackTicketPage() {
  const [pnr, setPnr] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    alert(`Tracking ticket: PNR ${pnr}, Mobile ${mobile}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <Menu className="h-8 w-8 cursor-pointer" />
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm p-1">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">
            Bus Reservation System
          </p>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-600 cursor-pointer shadow-lg shadow-green-900/20">
          <Share2 className="h-6 w-6 text-white" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-8 pt-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold text-center mb-10 tracking-wide">Track Ticket Details</h1>
          
          <div className="w-full h-[1px] bg-white/10 mb-12"></div>

          <form onSubmit={handleSubmit} className="space-y-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">PNR No</label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="PNR No"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 outline-none placeholder:text-white/30 text-lg focus:bg-white/10 focus:border-white/40 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Mobile No</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile No"
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 outline-none placeholder:text-white/30 text-lg focus:bg-white/10 focus:border-white/40 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-[#1a1a6e] font-bold py-5 rounded-2xl mt-12 shadow-xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-lg"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
      
      {/* Home Link */}
      <div className="p-8 text-center">
        <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
