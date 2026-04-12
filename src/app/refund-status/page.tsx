"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Home, ChevronRight, Bus } from "lucide-react";

export default function RefundStatusPage() {
  const [option, setOption] = useState("Transaction Status");
  const [refNo, setRefNo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Enquiring for ${option}: ${refNo}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center p-1 overflow-hidden">
            <Bus className="h-8 w-8 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tighter uppercase">Bus Reservation System</span>
        </div>
        <button className="rounded-lg p-2 hover:bg-white/10 transition-colors" aria-label="Toggle menu">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white/5 backdrop-blur-sm px-6 py-4 flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wider border-b border-white/10">
        <Link href="/" className="bg-white/10 p-1.5 rounded-md hover:bg-white/20 transition-colors">
          <Home className="h-4 w-4 text-white" />
        </Link>
        <ChevronRight className="h-3 w-3 text-white/30" />
        <span className="text-white/70">PG REFUND / TRANSACTION ENQUIRY</span>
      </div>

      {/* Main Content */}
      <main className="p-6 flex-grow">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-bold text-white uppercase tracking-wide">PG REFUND / TRANSACTION ENQUIRY</h1>
            <div className="text-[10px] text-white/40 font-bold tracking-widest">
              <span className="text-red-400">*</span> MANDATORY FIELD
            </div>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-8"></div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-400/20 p-5 rounded-2xl mb-10 backdrop-blur-sm">
            <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
              Verify your <span className="font-bold uppercase text-white">PG REFUND / TRANSACTION DETAILS</span> of your Journey Tickets
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Radio Options */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
              <label className="flex items-center gap-4 cursor-pointer group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="refund-option"
                    value="Transaction Status"
                    checked={option === "Transaction Status"}
                    onChange={(e) => setOption(e.target.value)}
                    className="appearance-none h-6 w-6 rounded-full border-2 border-white/30 checked:border-white transition-all"
                  />
                  {option === "Transaction Status" && (
                    <div className="absolute h-3 w-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className={`text-lg font-bold ${option === "Transaction Status" ? "text-white" : "text-white/40"}`}>
                  Transaction Status
                </span>
              </label>

              <label className="flex items-center gap-4 cursor-pointer group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="refund-option"
                    value="Refund"
                    checked={option === "Refund"}
                    onChange={(e) => setOption(e.target.value)}
                    className="appearance-none h-6 w-6 rounded-full border-2 border-white/30 checked:border-white transition-all"
                  />
                  {option === "Refund" && (
                    <div className="absolute h-3 w-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className={`text-lg font-bold ${option === "Refund" ? "text-white" : "text-white/40"}`}>
                  Refund
                </span>
              </label>
            </div>

            {/* Input Field */}
            <div className="max-w-md mx-auto space-y-3">
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest">
                OB Ref No.<span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-5 outline-none placeholder:text-white/30 text-lg focus:bg-white/10 focus:border-white/40 transition-all"
                placeholder="Enter Reference Number"
                required
              />
            </div>

            <div className="w-full h-[1px] bg-white/10 mt-12"></div>

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-start pt-8">
              <button
                type="submit"
                className="bg-white text-[#1a1a6e] font-bold py-5 px-16 rounded-2xl shadow-xl hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-lg"
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="h-20 bg-[#bae6fd]/40 mt-auto border-t border-[#bae6fd]"></div>
    </div>
  );
}
