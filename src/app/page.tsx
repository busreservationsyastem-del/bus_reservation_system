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
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

const featureButtons = [
  { icon: RefreshCw, label: "Refund Status", href: "/refund-status" },
  { icon: Search, label: "Track Ticket", href: "/track-ticket" },
  { icon: CalendarX2, label: "Reschedule Ticket", href: "/reschedule-ticket" },
  { icon: Package, label: "Package Tour Booking", href: "/package-tour" },
  { icon: Navigation, label: "Nearby Location", href: "/nearby-location" },
  { icon: Activity, label: "Current Status", href: "/current-status" },
  { icon: CreditCard, label: "Bus Pass", href: "/bus-pass" },
  { icon: Eye, label: "View Ticket", href: "/view-ticket" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("customer_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_user");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white">
      {/* Header & Navigation */}
      <header className="bg-[#1a1a6e] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-4 sm:px-8 gap-4">
          <div className="flex items-center gap-4 self-start lg:self-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-white">
              Bus Reservation System
            </h1>
            {mounted && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300">
                <Clock className="h-3 w-3" />
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
          </div>
          
          {/* Main Navigation - Visible on Desktop, Toggle on Mobile */}
          <nav className={`${menuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-auto transition-all duration-300`}>
            <ul className="flex flex-wrap items-center justify-center lg:justify-end gap-x-8 gap-y-4 py-2 lg:py-0">
              <li>
                <Link href="/" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                  Home
                </Link>
              </li>
              {user ? (
                <>
                  <li className="text-base font-medium text-white/60 whitespace-nowrap">Hello, {user.name}</li>
                  <li>
                    <button onClick={handleLogout} className="text-base font-medium hover:text-white/70 transition-colors text-red-400 whitespace-nowrap">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/booking" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                  Booking
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                  Cancellation
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="text-base font-medium hover:text-white/70 transition-colors whitespace-nowrap">
                  Itineraries
                </Link>
              </li>
            </ul>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden absolute right-4 top-5 rounded-lg p-2 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 pb-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Welcome text */}
          <div className="mb-8 mt-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Welcome to BRS!</h2>
            <p className="mt-2 text-base text-white/80 sm:text-lg">
              Book your BRS bus tickets easily and travel hassle-free across Gujarat.
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
          <div className="mt-8">
            <h3 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Quick Services
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featureButtons.map((feature) => (
                <Link
                  key={feature.label}
                  href={feature.href}
                  className="group flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-all shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-center text-sm font-bold text-white/90">
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
              <span className="text-xs">Connecting cities across Gujarat</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
