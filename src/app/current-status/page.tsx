"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Activity, Bus, MapPin, Navigation, Clock, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";

interface BusStatus {
  no: string;
  from: string;
  to: string;
  departureTime: string; // HH:MM format
  durationHours: number;
  stops: string[];
}

export default function CurrentStatusPage() {
  const [busNo, setBusNo] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Simulation Data
  const routes: BusStatus[] = [
    { 
      no: "GJ-01-AZ-1234", 
      from: "Ahmedabad", 
      to: "Vadodara", 
      departureTime: "06:00", 
      durationHours: 3,
      stops: ["Ahmedabad", "Nadiad", "Anand", "Vadodara"]
    },
    { 
      no: "GJ-18-BT-5678", 
      from: "Ahmedabad", 
      to: "Surat", 
      departureTime: "07:00", 
      durationHours: 5,
      stops: ["Ahmedabad", "Vadodara", "Bharuch", "Surat"]
    },
    { 
      no: "GJ-03-CV-9012", 
      from: "Rajkot", 
      to: "Jamnagar", 
      departureTime: "08:00", 
      durationHours: 2,
      stops: ["Rajkot", "Dhrol", "Jamnagar"]
    },
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  const calculateProgress = (bus: BusStatus) => {
    const [depH, depM] = bus.departureTime.split(":").map(Number);
    const departure = new Date();
    departure.setHours(depH, depM, 0, 0);

    const now = new Date();
    // For simulation purposes, if "now" is before departure, we might want to show it as "Scheduled"
    // If it's after arrival, show as "Arrived"
    
    const diffMs = now.getTime() - departure.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 0) return { status: "Scheduled", progress: 0, currentStop: bus.from };
    if (diffHours >= bus.durationHours) return { status: "Arrived", progress: 100, currentStop: bus.to };
    
    const progress = (diffHours / bus.durationHours) * 100;
    
    // Determine current stop based on progress
    const stopIndex = Math.floor((progress / 100) * bus.stops.length);
    const currentStop = bus.stops[Math.min(stopIndex, bus.stops.length - 1)];
    const nextStop = bus.stops[Math.min(stopIndex + 1, bus.stops.length - 1)];

    return { 
      status: "Running", 
      progress, 
      currentStop, 
      nextStop,
      remainingTime: Math.max(0, bus.durationHours - diffHours)
    };
  };

  const handleTrack = () => {
    const bus = routes.find(b => b.no.toUpperCase() === busNo.toUpperCase());
    if (bus) {
      setTrackingResult({
        ...bus,
        ...calculateProgress(bus)
      });
    } else {
      setTrackingResult({ error: "Bus not found. Try GJ-01-AZ-1234 or GJ-18-BT-5678" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-tight">Real-Time Tracking</h1>
        </div>
        {mounted && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Current Time</p>
            <p className="text-sm font-black text-blue-300">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-10 flex-grow">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Tracking Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center shadow-lg border border-white/20">
                <Activity className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight">Live Bus Status</h2>
                <p className="text-sm text-white/60">Simulating real-time progress based on route duration.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={busNo}
                  onChange={(e) => setBusNo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  placeholder="Enter Bus Number (e.g. GJ-01-AZ-1234)"
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-6 outline-none shadow-inner focus:bg-white/10 focus:border-white/40 transition-all font-bold tracking-widest uppercase placeholder:text-white/20"
                />
              </div>
              <button 
                onClick={handleTrack}
                className="bg-white text-[#1a1a6e] font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-xl hover:scale-[1.02] uppercase tracking-widest whitespace-nowrap"
              >
                Track
                <Navigation className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tracking Result */}
          {trackingResult && !trackingResult.error && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{trackingResult.no}</h3>
                  <p className="text-blue-300 font-bold">{trackingResult.from} → {trackingResult.to}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  trackingResult.status === 'Running' ? 'bg-green-500/20 text-green-400' : 
                  trackingResult.status === 'Arrived' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {trackingResult.status}
                </div>
              </div>

              {/* Progress Bar Area */}
              <div className="space-y-6">
                <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
                    style={{ width: `${trackingResult.progress}%` }}
                  >
                    <div className="absolute top-0 right-0 h-full w-8 bg-white/20 blur-md animate-shimmer"></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/40">
                  <div className="flex flex-col items-start gap-1">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span>{trackingResult.from}</span>
                    <span className="text-[10px] text-white/20">Dep: {trackingResult.departureTime}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <CheckCircle2 className={`h-4 w-4 ${trackingResult.status === 'Arrived' ? 'text-green-400' : 'text-white/20'}`} />
                    <span>{trackingResult.to}</span>
                    <span className="text-[10px] text-white/20">Duration: {trackingResult.durationHours}h</span>
                  </div>
                </div>
              </div>

              {/* Real-time details */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="h-4 w-4 text-blue-300" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">Current Position</span>
                  </div>
                  <p className="text-lg font-black">{trackingResult.currentStop}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-300" />
                    <span className="text-[10px] font-bold text-white/40 uppercase">
                      {trackingResult.status === 'Arrived' ? 'Journey Time' : 'Time Remaining'}
                    </span>
                  </div>
                  <p className="text-lg font-black">
                    {trackingResult.status === 'Arrived' ? `${trackingResult.durationHours}h 00m` : 
                     trackingResult.status === 'Scheduled' ? 'Not started' : 
                     `${Math.floor(trackingResult.remainingTime)}h ${Math.round((trackingResult.remainingTime % 1) * 60)}m`}
                  </p>
                </div>
              </div>

              {/* Route Timeline */}
              <div className="pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Route Timeline</h4>
                <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {trackingResult.stops.map((stop: string, idx: number) => {
                    const stopProgress = (idx / (trackingResult.stops.length - 1)) * 100;
                    const isPassed = trackingResult.progress >= stopProgress;
                    return (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-8 top-1 h-3 w-3 rounded-full border-2 border-[#1a1a6e] z-10 ${
                          isPassed ? 'bg-blue-400' : 'bg-white/10'
                        }`}></div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isPassed ? 'text-white' : 'text-white/30'}`}>{stop}</span>
                          {idx === 0 && <span className="text-[10px] text-white/20 font-bold uppercase">Source</span>}
                          {idx === trackingResult.stops.length - 1 && <span className="text-[10px] text-white/20 font-bold uppercase">Destination</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {trackingResult?.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-top-2">
              <p className="text-red-400 font-bold">{trackingResult.error}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <div className="p-10 flex flex-col items-center gap-2 opacity-40">
        <Bus className="h-6 w-6" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center">Bus Reservation System</p>
      </div>
    </div>
  );
}
