"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Clock, ChevronDown, CheckCircle2, Bus } from "lucide-react";

export default function ViewTicketPage() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("Success");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    alert(`Searching history for ${email}, ${mobile} from ${fromDate} to ${toDate} with status ${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <Link href="/" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm p-1">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter mt-1">
            Bus Reservation System
          </span>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-600 shadow-lg cursor-pointer">
          <div className="h-6 w-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-8 pt-8">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-center mb-10 tracking-wide uppercase">Transaction History</h1>
          
          <div className="w-full h-[1px] bg-white/10 mb-12"></div>

          <form onSubmit={handleSubmit} className="space-y-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            {/* Email ID */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Email ID *</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email ID"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-14 pr-6 outline-none placeholder:text-white/20 text-lg focus:bg-white/10 focus:border-white/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Mobile Number *</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-14 pr-6 outline-none placeholder:text-white/20 text-lg focus:bg-white/10 focus:border-white/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Date Range *</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    placeholder="From Date"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none placeholder:text-white/20 text-sm focus:bg-white/10 focus:border-white/40 transition-all"
                    required
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    placeholder="To Date"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none placeholder:text-white/20 text-sm focus:bg-white/10 focus:border-white/40 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Transaction Status</label>
              <div className="relative group">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 outline-none text-lg focus:bg-white/10 focus:border-white/40 transition-all appearance-none cursor-pointer font-bold"
                >
                  <option className="bg-[#1a1a6e]">Success</option>
                  <option className="bg-[#1a1a6e]">Pending</option>
                  <option className="bg-[#1a1a6e]">Failed</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl mt-12 shadow-2xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-lg"
            >
              Search Transactions
            </button>
          </form>
        </div>
      </main>

      {/* Footer Branding */}
      <div className="p-12 flex flex-col items-center gap-2 opacity-60">
        <Bus className="h-6 w-6" />
        <p className="text-xs font-bold uppercase tracking-widest">Bus Reservation System</p>
      </div>
    </div>
  );
}
