"use client";

import { useState } from "react";
import Link from "next/link";
import { Bus, ArrowLeft, XCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function CancellationPage() {
  const [pnr, setPnr] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!pnr || !email || !mobile) {
      setError("All fields are required.");
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
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pnr: pnr.toUpperCase(), email, mobile }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setPnr("");
        setEmail("");
        setMobile("");
      } else {
        setError(data.error || "Cancellation failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <XCircle className="h-6 w-6" />
          <h1 className="text-lg font-bold sm:text-xl">Cancel Ticket</h1>
        </div>
      </header>

      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-lg">
          {/* Info banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <p className="text-sm text-yellow-200/80">
              Cancellation charges may apply based on the time of cancellation. Refund will be
              processed to the original payment method within 7 working days.
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
              <p className="text-sm text-green-200">{success}</p>
            </div>
          )}

          {/* Cancellation Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8"
          >
            <h2 className="mb-6 text-lg font-semibold">Enter Booking Details</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  PNR Number
                </label>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="Enter your PNR number"
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 font-mono tracking-wider uppercase"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email used during booking"
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
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
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  required
                />
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-red-600 hover:to-red-800 disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              {loading ? "Processing..." : "Submit Cancellation"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
