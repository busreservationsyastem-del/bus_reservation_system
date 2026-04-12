"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, RefreshCw, Search, HelpCircle, ChevronRight, Bus, ArrowLeft, Clock } from "lucide-react";

export default function BusPassPage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      title: "New Customer Bus Pass",
      icon: FileText,
      href: "/bus-pass/new",
      color: "text-blue-400",
    },
    {
      title: "Renewal Customer Bus Pass",
      icon: RefreshCw,
      href: "/bus-pass/renewal",
      color: "text-blue-400",
    },
    {
      title: "Track Bus Pass",
      icon: Search,
      href: "/bus-pass/status",
      color: "text-blue-400",
    },
    {
      title: "FAQ",
      icon: HelpCircle,
      href: "/faq",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-8 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-yellow-300" />
            <h1 className="text-lg font-bold sm:text-xl">Bus Pass Services</h1>
          </div>
        </div>
        {mounted && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300">
            <Clock className="h-3 w-3" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-md rounded-[40px] border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Bus Pass Services</h2>
            </div>
            
            <div className="divide-y divide-white/10">
              {services.map((service, idx) => (
                <Link 
                  key={idx} 
                  href={service.href}
                  className="flex items-center justify-between px-8 py-8 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors border border-white/10">
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">{service.title}</span>
                  </div>
                  <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-40">
            <Bus className="h-8 w-8" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-center">Bus Reservation System</p>
          </div>
        </div>
      </main>
    </div>
  );
}
