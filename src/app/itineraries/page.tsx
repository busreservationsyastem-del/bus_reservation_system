"use client";

import Link from "next/link";
import { ArrowLeft, Bus, Clock, MapPin, ArrowRight, IndianRupee } from "lucide-react";

const itineraries = [
  {
    id: 1,
    route: "Delhi to Jaipur",
    from: "Delhi ISBT",
    to: "Jaipur Sindhi Camp",
    distance: "280 km",
    duration: "5h 30m",
    fare: "₹450 - ₹1,200",
    stops: ["Manesar", "Dharuhera", "Behror", "Shahpura"],
    frequency: "Every 30 mins",
    firstBus: "5:00 AM",
    lastBus: "11:30 PM",
  },
  {
    id: 2,
    route: "Mumbai to Pune",
    from: "Mumbai Dadar",
    to: "Pune Swargate",
    distance: "150 km",
    duration: "3h 00m",
    fare: "₹350 - ₹900",
    stops: ["Panvel", "Lonavala", "Khandala"],
    frequency: "Every 15 mins",
    firstBus: "4:30 AM",
    lastBus: "12:00 AM",
  },
  {
    id: 3,
    route: "Bangalore to Chennai",
    from: "Bangalore Majestic",
    to: "Chennai CMBT",
    distance: "350 km",
    duration: "6h 00m",
    fare: "₹550 - ₹1,500",
    stops: ["Hosur", "Krishnagiri", "Vellore", "Kanchipuram"],
    frequency: "Every 45 mins",
    firstBus: "5:30 AM",
    lastBus: "11:00 PM",
  },
  {
    id: 4,
    route: "Hyderabad to Vizag",
    from: "Hyderabad MGBS",
    to: "Vizag RTC Complex",
    distance: "620 km",
    duration: "10h 00m",
    fare: "₹700 - ₹1,800",
    stops: ["Suryapet", "Khammam", "Rajamahendravaram", "Kakinada"],
    frequency: "Every 1 hour",
    firstBus: "6:00 AM",
    lastBus: "10:00 PM",
  },
  {
    id: 5,
    route: "Kolkata to Patna",
    from: "Kolkata Esplanade",
    to: "Patna Gandhi Maidan",
    distance: "590 km",
    duration: "9h 30m",
    fare: "₹650 - ₹1,600",
    stops: ["Durgapur", "Asansol", "Dhanbad", "Gaya"],
    frequency: "Every 2 hours",
    firstBus: "5:00 AM",
    lastBus: "9:00 PM",
  },
  {
    id: 6,
    route: "Chennai to Coimbatore",
    from: "Chennai CMBT",
    to: "Coimbatore Gandhipuram",
    distance: "500 km",
    duration: "8h 00m",
    fare: "₹500 - ₹1,400",
    stops: ["Vellore", "Salem", "Erode", "Tirupur"],
    frequency: "Every 1 hour",
    firstBus: "5:00 AM",
    lastBus: "11:00 PM",
  },
];

export default function ItinerariesPage() {
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
          <h1 className="text-lg font-bold sm:text-xl">Bus Itineraries</h1>
        </div>
      </header>

      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6 text-center text-sm text-white/60">
            Popular bus routes and schedules across India
          </p>

          <div className="space-y-4">
            {itineraries.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5 transition-all hover:bg-white/[0.12]"
              >
                {/* Route Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg font-bold">{item.route}</h3>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    {item.distance}
                  </span>
                </div>

                {/* From / To */}
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-300" />
                    <span>{item.from}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30" />
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-300" />
                    <span>{item.to}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Duration</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-300" />
                      <span className="font-medium">{item.duration}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Fare Range</p>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-green-300" />
                      <span className="font-medium">{item.fare}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">First Bus</p>
                    <span className="font-medium">{item.firstBus}</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <p className="text-white/50 text-xs mb-1">Last Bus</p>
                    <span className="font-medium">{item.lastBus}</span>
                  </div>
                </div>

                {/* Stops */}
                <div className="mt-3">
                  <p className="text-xs text-white/40 mb-1.5">Stops:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.stops.map((stop) => (
                      <span
                        key={stop}
                        className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-white/70"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Frequency + Book CTA */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-white/50">
                    Frequency: {item.frequency}
                  </span>
                  <Link
                    href="/booking"
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2 text-sm font-semibold transition-all hover:from-blue-600 hover:to-blue-800"
                  >
                    Book This Route
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
