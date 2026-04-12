"use client";

import Link from "next/link";
import { ArrowLeft, Bus, ChevronRight, FileText, RefreshCw, Search, HelpCircle } from "lucide-react";

const services = [
  {
    id: "new",
    title: "New Commuter Bus Pass",
    href: "/bus-pass/new",
    icon: FileText,
  },
  {
    id: "renewal",
    title: "Renewal Commuter Bus Pass",
    href: "/bus-pass/renewal",
    icon: RefreshCw,
  },
  {
    id: "status",
    title: "Application Status",
    href: "/bus-pass/status",
    icon: Search,
  },
  {
    id: "faq",
    title: "FAQ",
    href: "/bus-pass/faq",
    icon: HelpCircle,
  },
];

export default function BusPassServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <Link href="/" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-tight">Bus Pass Services</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-lg mx-auto w-full flex-grow flex flex-col justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Bus Pass Services</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="flex items-center justify-between p-6 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5 text-blue-400 group-hover:scale-110 transition-transform">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-lg tracking-tight group-hover:text-blue-300 transition-colors">
                    {service.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Branding/Info */}
        <div className="mt-12 text-center space-y-4 opacity-60">
          <div className="flex flex-col items-center gap-2">
            <Bus className="h-8 w-8" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Bus Reservation System</p>
          </div>
          <p className="text-[10px] max-w-xs mx-auto font-medium leading-relaxed">
            Apply for new bus passes or renew existing ones with ease. Select from 1, 2, or 6 months validity options.
          </p>
        </div>
      </main>
    </div>
  );
}
