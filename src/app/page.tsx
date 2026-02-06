"use client";

import Link from "next/link";
import {
  Bus,
  Ticket,
  MapPin,
  RefreshCw,
  Search,
  Package,
  Navigation,
  Activity,
  CreditCard,
  Eye,
  CalendarX2,
  Route,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const featureButtons = [
  { icon: RefreshCw, label: "Refund Status", href: "#" },
  { icon: Search, label: "Track Ticket", href: "#" },
  { icon: CalendarX2, label: "Reschedule Ticket", href: "#" },
  { icon: Package, label: "Package Tour Booking", href: "#" },
  { icon: Navigation, label: "Nearby Location", href: "#" },
  { icon: Activity, label: "Current Status", href: "#" },
  { icon: CreditCard, label: "Bus Pass", href: "#" },
  { icon: Eye, label: "View Ticket", href: "#" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Bus Reservation System
          </h1>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="mx-4 mb-4 rounded-xl bg-white/10 backdrop-blur-md p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="block rounded-lg px-4 py-2 hover:bg-white/10 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/booking" className="block rounded-lg px-4 py-2 hover:bg-white/10 transition-colors">
                Booking
              </Link>
            </li>
            <li>
              <Link href="/cancellation" className="block rounded-lg px-4 py-2 hover:bg-white/10 transition-colors">
                Cancellation
              </Link>
            </li>
            <li>
              <Link href="/itineraries" className="block rounded-lg px-4 py-2 hover:bg-white/10 transition-colors">
                Itineraries
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Hero Section */}
      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Welcome text */}
          <div className="mb-8 mt-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Welcome Traveller!</h2>
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              Book your bus tickets easily and travel hassle-free across the country.
            </p>
          </div>

          {/* Three Big Action Buttons */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/booking"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg group-hover:shadow-blue-500/40">
                <Ticket className="h-8 w-8 text-white" />
              </div>
              <span className="text-lg font-semibold">Booking</span>
              <span className="text-xs text-white/60">Reserve your seat</span>
            </Link>

            <Link
              href="/cancellation"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg group-hover:shadow-red-500/40">
                <CalendarX2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-lg font-semibold">Cancellation</span>
              <span className="text-xs text-white/60">Cancel your ticket</span>
            </Link>

            <Link
              href="/itineraries"
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg group-hover:shadow-green-500/40">
                <Route className="h-8 w-8 text-white" />
              </div>
              <span className="text-lg font-semibold">Itineraries</span>
              <span className="text-xs text-white/60">View travel routes</span>
            </Link>
          </div>

          {/* Feature Grid */}
          <div>
            <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-white/50">
              Quick Services
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {featureButtons.map((feature) => (
                <Link
                  key={feature.label}
                  href={feature.href}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.07] p-4 backdrop-blur-sm border border-white/[0.06] transition-all hover:bg-white/15 hover:border-white/20"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                    <feature.icon className="h-5 w-5 text-white/80" />
                  </div>
                  <span className="text-center text-xs font-medium text-white/80">
                    {feature.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer area */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-white/30">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Connecting cities across India</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
