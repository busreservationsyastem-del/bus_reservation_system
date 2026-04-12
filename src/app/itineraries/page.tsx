"use client";

import Link from "next/link";
import { ArrowLeft, Bus, Clock, MapPin, ArrowRight, IndianRupee } from "lucide-react";

const itineraries = [
  {
    id: 1,
    route: "Ahmedabad to Surat",
    from: "Ahmedabad Geeta Mandir",
    to: "Surat Central",
    distance: "265 km",
    duration: "4h 30m",
    fare: "₹350 - ₹950",
    stops: ["Nadiad", "Anand", "Vadodara", "Bharuch"],
    frequency: "Every 15 mins",
    firstBus: "4:00 AM",
    lastBus: "11:45 PM",
  },
  {
    id: 2,
    route: "Ahmedabad to Rajkot",
    from: "Ahmedabad Nehrunagar",
    to: "Rajkot Central",
    distance: "215 km",
    duration: "4h 00m",
    fare: "₹300 - ₹850",
    stops: ["Bavla", "Bagodra", "Limbdi", "Chotila"],
    frequency: "Every 20 mins",
    firstBus: "5:00 AM",
    lastBus: "11:00 PM",
  },
  {
    id: 3,
    route: "Vadodara to Surat",
    from: "Vadodara Central",
    to: "Surat Central",
    distance: "150 km",
    duration: "3h 00m",
    fare: "₹200 - ₹600",
    stops: ["Bharuch", "Ankleshwar"],
    frequency: "Every 10 mins",
    firstBus: "4:30 AM",
    lastBus: "12:30 AM",
  },
  {
    id: 4,
    route: "Rajkot to Jamnagar",
    from: "Rajkot Central",
    to: "Jamnagar Central",
    distance: "95 km",
    duration: "2h 00m",
    fare: "₹150 - ₹400",
    stops: ["Paddhari", "Dhrol"],
    frequency: "Every 30 mins",
    firstBus: "6:00 AM",
    lastBus: "10:30 PM",
  },
  {
    id: 5,
    route: "Ahmedabad to Bhavnagar",
    from: "Ahmedabad Geeta Mandir",
    to: "Bhavnagar Central",
    distance: "175 km",
    duration: "3h 30m",
    fare: "₹250 - ₹700",
    stops: ["Dhandhuka", "Barvala", "Sihor"],
    frequency: "Every 1 hour",
    firstBus: "5:30 AM",
    lastBus: "9:30 PM",
  },
  {
    id: 6,
    route: "Surat to Bhavnagar",
    from: "Surat Central",
    to: "Bhavnagar Central",
    distance: "360 km (via road)",
    duration: "7h 00m",
    fare: "₹450 - ₹1,100",
    stops: ["Bharuch", "Vadodara", "Ahmedabad", "Dhandhuka"],
    frequency: "Every 2 hours",
    firstBus: "6:00 AM",
    lastBus: "8:00 PM",
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
            Popular bus routes and schedules across Gujarat
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
