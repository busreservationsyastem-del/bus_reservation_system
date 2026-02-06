"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bus, ArrowLeft, User, CheckCircle, Copy } from "lucide-react";

function PassengerForm() {
  const searchParams = useSearchParams();

  const busName = searchParams.get("busName") || "";
  const fromLocation = searchParams.get("from") || "";
  const toLocation = searchParams.get("to") || "";
  const journeyDate = searchParams.get("date") || "";
  const departureTime = searchParams.get("departure") || "";
  const arrivalTime = searchParams.get("arrival") || "";
  const fare = searchParams.get("fare") || "0";
  const adults = searchParams.get("adults") || "1";
  const children = searchParams.get("children") || "0";

  const [passengerName, setPassengerName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pnr, setPnr] = useState("");
  const [booked, setBooked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!passengerName || !gender || !age || !email || !mobile) {
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
    if (Number(age) < 1 || Number(age) > 120) {
      setError("Please enter a valid age.");
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
          passengerName,
          gender,
          age: Number(age),
          email,
          mobile,
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
        <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
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
        </header>
        <main className="px-4 pb-12 sm:px-8">
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
              <p className="text-white/70 mb-6">Your ticket has been booked. Keep your PNR safe.</p>

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
                  <span className="font-medium">{passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Fare</span>
                  <span className="font-medium text-green-300">₹{fare}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
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
      </header>

      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Trip Summary */}
          <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">{busName}</span>
              <span className="text-green-300 font-bold">₹{fare}</span>
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

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  Passenger Name
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
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
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    min={1}
                    max={120}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>

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
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-800 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5" />
              {loading ? "Confirming..." : "Confirm Booking"}
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
