"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus, ArrowLeft, Search, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { locations } from "@/lib/buses";

interface BusResult {
  id: string;
  name: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  type: string;
  fare: number;
}

export default function BookingPage() {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [buses, setBuses] = useState<BusResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fromLocation || !toLocation || !journeyDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (fromLocation === toLocation) {
      setError("From and To locations cannot be the same.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/buses?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`
      );
      const data = await res.json();
      setBuses(data.buses || []);
      setSearched(true);
    } catch {
      setError("Failed to search buses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (bus: BusResult) => {
    // Pass booking info via query params
    const params = new URLSearchParams({
      busId: bus.id,
      busName: bus.name,
      from: fromLocation,
      to: toLocation,
      date: journeyDate,
      departure: bus.departureTime,
      arrival: bus.arrivalTime,
      fare: bus.fare.toString(),
      adults: adults.toString(),
      children: children.toString(),
    });
    router.push(`/passenger?${params.toString()}`);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

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
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold sm:text-xl">Book Your Ticket</h1>
        </div>
      </header>

      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* From Location */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  <MapPin className="mb-0.5 mr-1 inline h-4 w-4" />
                  From Location
                </label>
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                >
                  <option value="" className="text-gray-900">Select departure city</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="text-gray-900">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Location */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  <MapPin className="mb-0.5 mr-1 inline h-4 w-4" />
                  To Location
                </label>
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                >
                  <option value="" className="text-gray-900">Select arrival city</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="text-gray-900">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Journey Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/70">
                  Journey Date
                </label>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  min={today}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 [color-scheme:dark]"
                  required
                />
              </div>

              {/* Adults & Children */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    Adults
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/70">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-800 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              {loading ? "Searching..." : "Search Bus"}
            </button>
          </form>

          {/* Bus Results */}
          {searched && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold">
                {buses.length} Buses Found — {fromLocation} to {toLocation}
              </h2>
              <div className="space-y-4">
                {buses.map((bus) => (
                  <div
                    key={bus.id}
                    className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 transition-all hover:bg-white/15"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-bold">{bus.name}</h3>
                        <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/70">
                          {bus.type}
                        </span>
                        <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-300" />
                            <span>{bus.departureTime}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-white/40" />
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-green-300" />
                            <span>{bus.arrivalTime}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-sm text-white/60">
                          <Users className="h-4 w-4" />
                          <span>
                            {bus.availableSeats} seats available
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-2xl font-bold text-green-300">
                          ₹{bus.fare}
                        </span>
                        <button
                          onClick={() => handleBookNow(bus)}
                          disabled={bus.availableSeats === 0}
                          className="rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-green-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {bus.availableSeats === 0 ? "Sold Out" : "Book Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
