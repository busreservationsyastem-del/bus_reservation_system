"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Navigation, Bus, Globe, Compass } from "lucide-react";

export default function NearbyLocationPage() {
  const [search, setSearch] = useState("");

  const locations = [
    { name: "Ahmedabad Central", distance: "2.5 km", address: "Gita Mandir Road, Ahmedabad" },
    { name: "Ranip Bus Port", distance: "5.1 km", address: "Subhash Bridge, Ahmedabad" },
    { name: "Nehrunagar Bus Stand", distance: "3.8 km", address: "Nehrunagar Circle, Ahmedabad" },
    { name: "Satellite Bus Stand", distance: "6.2 km", address: "Satellite Road, Ahmedabad" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-tight">Nearby Location</h1>
        </div>
        <div className="flex flex-col items-center">
          <Bus className="h-6 w-6" />
          <span className="text-[8px] font-bold uppercase opacity-60 tracking-widest">BRS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8 flex-grow">
        <div className="relative group max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for nearby bus stands..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl py-4 pl-12 pr-6 outline-none shadow-2xl focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/30"
          />
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 px-2">Popular Locations</h2>
          {locations.map((loc, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-[#1a1a6e]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{loc.name}</h3>
                  <p className="text-xs text-white/50">{loc.address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-300">{loc.distance}</span>
                <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase mt-1">
                  <Navigation className="h-3 w-3" />
                  <span>View Map</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-lg mx-auto text-center space-y-6">
          <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border-2 border-white/20">
            <Compass className="h-10 w-10 text-white/60 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Use Current Location</h3>
            <p className="text-sm text-white/40 mt-2">Grant permission to find the nearest bus stands to you automatically.</p>
          </div>
          <button className="bg-white text-[#1a1a6e] font-black px-10 py-4 rounded-full shadow-xl hover:bg-blue-50 transition-all hover:scale-[1.05] active:scale-[0.95] uppercase tracking-widest text-xs">
            Allow Access
          </button>
        </div>
      </main>

      {/* Footer Branding */}
      <div className="p-8 flex flex-col items-center gap-2 opacity-40">
        <Bus className="h-5 w-5" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Bus Reservation System</p>
      </div>
    </div>
  );
}
