"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bus, LogOut, Search, RefreshCw, Calendar, User, 
  Mail, Phone, Ticket, Home, Settings, LayoutDashboard,
  Users as UsersIcon, ChevronRight, Menu, X, Trash2, Eye,
  ShieldCheck, Bell, Database, Globe, ArrowRight,
  TrendingUp, Activity, CreditCard, UserCheck, Package, Clock, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Booking {
  id: string;
  pnr: string;
  busName: string;
  fromLocation: string;
  toLocation: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  gender?: string;
  age?: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  mobile: string;
  email: string;
  isPackage?: boolean;
  adults?: number;
  children?: number;
  sharingType?: string;
  allPassengers?: any[];
  createdAt: any;
  totalPrice?: number;
  amountPaid?: number;
}

interface BusPass {
  id: string;
  passId: string;
  passengerName: string;
  gender: string;
  age: number;
  email: string;
  mobile: string;
  passType: string;
  duration: string;
  startDate: string;
  expiryDate: string;
  status: string;
  price: number;
  createdAt: any;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: any;
}

type TabType = "dashboard" | "bookings" | "passes" | "customers" | "settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [passes, setPasses] = useState<BusPass[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<BusPass | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Bookings
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }

      // Fetch Passes
      const passesRes = await fetch("/api/admin/bus-pass");
      if (passesRes.ok) {
        const data = await passesRes.json();
        setPasses(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
     setSelectedBooking(booking);
     setIsViewModalOpen(true);
   };
 
   const handleViewPass = (pass: BusPass) => {
     setSelectedPass(pass);
     setIsPassModalOpen(true);
   };

   const handleViewHistory = (email: string) => {
     setSelectedCustomerEmail(email);
     setIsHistoryModalOpen(true);
   };
 
   const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin/login");
  };

  const handleDeleteBooking = async (id: string, isPackage?: boolean) => {
    if (!confirm(`Are you sure you want to delete this ${isPackage ? 'package ' : ''}booking?`)) return;

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPackage }),
      });

      if (response.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleDeletePass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bus pass?")) return;

    try {
      const response = await fetch("/api/admin/bus-pass", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setPasses(passes.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting pass:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin/login");
      return;
    }

    // Set up real-time listener for regular Bookings
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const regularData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      setBookings(prev => {
        const tourData = prev.filter(b => b.isPackage || b.pnr?.startsWith("PKG"));
        const combined = [...regularData, ...tourData].sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
        return combined;
      });
      setLoading(false);
    });

    // Set up real-time listener for Package Bookings
    const packageBookingsQuery = query(collection(db, "package_bookings"), orderBy("createdAt", "desc"));
    const unsubscribePackageBookings = onSnapshot(packageBookingsQuery, (snapshot) => {
      const tourData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      setBookings(prev => {
        const regularData = prev.filter(b => !b.isPackage && !b.pnr?.startsWith("PKG"));
        const combined = [...regularData, ...tourData].sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });
        return combined;
      });
    });

    // Set up real-time listener for Bus Passes
    const passesQuery = query(collection(db, "bus_passes"), orderBy("createdAt", "desc"));
    const unsubscribePasses = onSnapshot(passesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusPass[];
      setPasses(data);
    });

    // Set up real-time listener for Customers
    const customersQuery = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(data);
    });

    return () => {
      unsubscribeBookings();
      unsubscribePackageBookings();
      unsubscribePasses();
      unsubscribeCustomers();
    };
  }, [router]);

  if (!mounted) {
    return <div className="flex h-screen bg-slate-100" />;
  }

  // Filter bookings
  const filteredBookings = bookings.filter((booking) =>
    (booking.pnr?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (booking.passengerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (booking.mobile || "").includes(searchTerm)
  );

  const filteredPasses = passes.filter((pass) =>
    (pass.passId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (pass.passengerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (pass.mobile || "").includes(searchTerm)
  );

  const filteredCustomers = customers.filter(c => 
    (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.mobile || "").includes(searchTerm)
  );

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0) + passes.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <button 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1a6e] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bus className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BRS Admin</h1>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-4">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`admin-sidebar-item w-full ${activeTab === 'dashboard' ? 'active' : 'text-white/70'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`admin-sidebar-item w-full ${activeTab === 'bookings' ? 'active' : 'text-white/70'}`}
            >
              <Ticket className="h-5 w-5" />
              <span>Bookings</span>
            </button>
            <button 
              onClick={() => setActiveTab("passes")}
              className={`admin-sidebar-item w-full ${activeTab === 'passes' ? 'active' : 'text-white/70'}`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Bus Passes</span>
            </button>
            <button 
              onClick={() => setActiveTab("customers")}
              className={`admin-sidebar-item w-full ${activeTab === 'customers' ? 'active' : 'text-white/70'}`}
            >
              <UsersIcon className="h-5 w-5" />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`admin-sidebar-item w-full ${activeTab === 'settings' ? 'active' : 'text-white/70'}`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>

          <div className="p-4 mt-auto">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Admin User</span>
            <div className="h-8 w-8 rounded-full bg-[#1a1a6e] flex items-center justify-center text-white text-xs font-bold">AD</div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
                        <p className="text-slate-500 mt-1 font-medium">Welcome back, Khushi. Here's what's happening today.</p>
                      </div>
                      <Button onClick={fetchData} className="bg-[#1a1a6e] hover:bg-[#2d2d8e] shadow-lg shadow-blue-900/20 rounded-xl px-6">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                      <Card className="stat-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bus Bookings</CardTitle>
                          <div className="bg-blue-50 p-2.5 rounded-xl"><Ticket className="h-5 w-5 text-blue-600" /></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-black text-slate-900">{bookings.length}</div>
                          <p className="text-xs font-semibold text-slate-400 mt-2">Total bus reservations</p>
                        </CardContent>
                      </Card>
                      <Card className="stat-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Passes</CardTitle>
                          <div className="bg-emerald-50 p-2.5 rounded-xl"><CreditCard className="h-5 w-5 text-emerald-600" /></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-black text-slate-900">{passes.filter(p => p.status === 'active').length}</div>
                          <p className="text-xs font-semibold text-slate-400 mt-2">Active commuter passes</p>
                        </CardContent>
                      </Card>
                      <Card className="stat-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customers</CardTitle>
                          <div className="bg-amber-50 p-2.5 rounded-xl"><UsersIcon className="h-5 w-5 text-amber-600" /></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-black text-slate-900">{customers.length}</div>
                          <p className="text-xs font-semibold text-slate-400 mt-2">Unique users registered</p>
                        </CardContent>
                      </Card>
                      <Card className="stat-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</CardTitle>
                          <div className="bg-violet-50 p-2.5 rounded-xl"><TrendingUp className="h-5 w-5 text-violet-600" /></div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                          <p className="text-xs font-semibold text-slate-400 mt-2">Combined total earnings</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
                        <div>
                          <CardTitle className="text-xl font-black text-slate-900">Recent Activity</CardTitle>
                          <CardDescription className="font-medium text-slate-400">Latest 5 bookings processed</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")} className="rounded-xl font-bold border-slate-200 hover:bg-slate-50">
                          View All <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="modern-table-header">
                              <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="px-8 py-4">PNR Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Passenger</TableHead>
                                <TableHead>Route Details</TableHead>
                                <TableHead className="text-right px-8">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bookings.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">No recent activity found.</TableCell>
                                </TableRow>
                              ) : (
                                bookings.slice(0, 5).map(booking => (
                                  <TableRow key={booking.id} className="modern-table-row border-slate-50">
                                    <TableCell className="px-8 py-5 font-mono font-bold text-blue-600 tracking-tighter">{booking.pnr}</TableCell>
                                    <TableCell>
                                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${booking.isPackage || booking.pnr?.startsWith("PKG") ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                        {booking.isPackage || booking.pnr?.startsWith("PKG") ? "Tour" : "Bus"}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">
                                          {booking.passengerName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <span className="font-bold text-slate-700">{booking.passengerName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-600">{booking.fromLocation} → {booking.toLocation}</span>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{booking.busName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8 flex items-center justify-end gap-2">
                                      <span className={`modern-badge ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {booking.status}
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                                        onClick={() => handleViewBooking(booking)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {activeTab === "bookings" && (
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white px-8 py-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <CardTitle className="text-2xl font-black text-slate-900">Bus Bookings</CardTitle>
                          <CardDescription className="font-medium text-slate-400">Manage all regular bus ticket reservations</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="Search PNR, Name or Mobile..." 
                            className="pl-12 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm font-medium" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="modern-table-header">
                            <TableRow className="hover:bg-transparent border-none">
                              <TableHead className="px-8 py-4">PNR</TableHead>
                              <TableHead>Passenger Details</TableHead>
                              <TableHead>Gender/Age</TableHead>
                              <TableHead>Route & Bus</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right px-8">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="bg-slate-100 p-4 rounded-full mb-2"><Search className="h-8 w-8 text-slate-300" /></div>
                                    <p className="text-lg font-bold text-slate-900">No bus bookings found</p>
                                    <p className="text-sm font-medium text-slate-400">Try adjusting your search filters.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredBookings.map(booking => (
                                <TableRow key={booking.id} className="modern-table-row border-slate-50">
                                  <TableCell className="px-8 py-5 font-mono font-bold text-blue-600 tracking-tighter">{booking.pnr}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-700">{booking.passengerName}</span>
                                      <span className="text-xs font-bold text-slate-400">{booking.mobile}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-600">{booking.gender || "N/A"}</span>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{booking.age ? `${booking.age} yrs` : "N/A"}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-600">{booking.fromLocation} → {booking.toLocation}</span>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{booking.busName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-600">{booking.journeyDate}</span>
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{booking.departureTime}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className={`modern-badge ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {booking.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                                        onClick={() => handleViewBooking(booking)}
                                      >
                                        <Eye className="h-4.5 w-4.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                                        onClick={() => handleDeleteBooking(booking.id, booking.isPackage || booking.pnr?.startsWith("PKG"))}
                                      >
                                        <Trash2 className="h-4.5 w-4.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "passes" && (
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white px-8 py-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <CardTitle className="text-2xl font-black text-slate-900">Manage Bus Passes</CardTitle>
                          <CardDescription className="font-medium text-slate-400">Monitor and manage all active and expired commuter passes</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="Search Pass ID, Name or Mobile..." 
                            className="pl-12 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm font-medium" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="modern-table-header">
                            <TableRow className="hover:bg-transparent border-none">
                              <TableHead>Pass ID</TableHead>
                               <TableHead>Passenger</TableHead>
                               <TableHead>Validity Period</TableHead>
                               <TableHead>Expiry Date</TableHead>
                               <TableHead>Fare Paid</TableHead>
                               <TableHead>Status</TableHead>
                               <TableHead className="text-right px-8">Actions</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {filteredPasses.length === 0 ? (
                               <TableRow>
                                 <TableCell colSpan={7} className="h-64 text-center">
                                   <div className="flex flex-col items-center justify-center gap-2">
                                     <div className="bg-slate-100 p-4 rounded-full mb-2"><CreditCard className="h-8 w-8 text-slate-300" /></div>
                                     <p className="text-lg font-bold text-slate-900">No passes found</p>
                                     <p className="text-sm font-medium text-slate-400">Try adjusting your search filters.</p>
                                   </div>
                                 </TableCell>
                               </TableRow>
                             ) : (
                               filteredPasses.map(pass => (
                                 <TableRow key={pass.id} className="modern-table-row border-slate-50">
                                   <TableCell className="px-8 py-5 font-mono font-bold text-blue-600 tracking-tighter">{pass.passId}</TableCell>
                                   <TableCell>
                                     <div className="flex flex-col">
                                       <span className="font-bold text-slate-700">{pass.passengerName}</span>
                                       <span className="text-xs font-bold text-slate-400">{pass.mobile}</span>
                                     </div>
                                   </TableCell>
                                   <TableCell>
                                     <div className="flex flex-col">
                                       <span className="text-sm font-bold text-slate-600">{pass.duration}</span>
                                       <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Issue: {pass.startDate}</span>
                                     </div>
                                   </TableCell>
                                   <TableCell>
                                     <div className="flex flex-col">
                                       <span className="text-sm font-bold text-slate-600">{pass.expiryDate}</span>
                                       <span className={`text-[10px] font-bold uppercase ${new Date(pass.expiryDate) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                                         {new Date(pass.expiryDate) < new Date() ? 'Expired' : 'Valid'}
                                       </span>
                                     </div>
                                   </TableCell>
                                   <TableCell>
                                     <span className="text-sm font-black text-green-600">₹{pass.price}</span>
                                   </TableCell>
                                   <TableCell>
                                     <span className={`modern-badge ${pass.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                       {pass.status}
                                     </span>
                                   </TableCell>
                                  <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                                        onClick={() => handleViewPass(pass)}
                                      >
                                        <Eye className="h-4.5 w-4.5" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                                        onClick={() => handleDeletePass(pass.id)}
                                      >
                                        <Trash2 className="h-4.5 w-4.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "customers" && (
                  <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white px-8 py-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <CardTitle className="text-2xl font-black text-slate-900">Customer Directory</CardTitle>
                          <CardDescription className="font-medium text-slate-400">View and manage unique customers who have used the system</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            placeholder="Search by Name, Email or Mobile..." 
                            className="pl-12 py-6 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm font-medium" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="modern-table-header">
                            <TableRow className="hover:bg-transparent border-none">
                              <TableHead className="px-8 py-4">Customer Name</TableHead>
                              <TableHead>Contact Information</TableHead>
                              <TableHead>Activity</TableHead>
                              <TableHead>Last Journey</TableHead>
                              <TableHead className="text-right px-8">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCustomers.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="bg-slate-100 p-4 rounded-full mb-2"><UsersIcon className="h-8 w-8 text-slate-300" /></div>
                                    <p className="text-lg font-bold text-slate-900">No customers found</p>
                                    <p className="text-sm font-medium text-slate-400">Try a different search term.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredCustomers.map((customer) => {
                                const customerBookings = bookings.filter(b => b.email === customer.email);
                                const customerPasses = passes.filter(p => p.email === customer.email);
                                const lastBooking = customerBookings[0];
                                const lastPass = customerPasses[0];

                                return (
                                  <TableRow key={customer.id} className="modern-table-row border-slate-50">
                                    <TableCell className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-600/20">
                                          {customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-bold text-slate-700">{customer.name || "Unknown Passenger"}</span>
                                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Active Member</span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /> {customer.email}</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.mobile}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-sm font-black text-slate-700">B: {customerBookings.length} | P: {customerPasses.length}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Activity Count</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-slate-600">{lastBooking?.journeyDate || lastPass?.startDate || "No activity"}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Latest Action</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="rounded-xl font-bold text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleViewHistory(customer.email)}
                                      >
                                        History
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
                      <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <CardTitle className="text-xl font-black text-slate-900">System Settings</CardTitle>
                        <CardDescription className="font-medium text-slate-400">Manage administrative preferences and system behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-10">
                        <div className="space-y-6">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Bell className="h-4 w-4" /> Notifications
                          </h3>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                            <div className="space-y-1">
                              <Label className="text-sm font-bold text-slate-700">Email Notifications</Label>
                              <p className="text-xs font-medium text-slate-400">Receive alerts for new ticket bookings in real-time</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                            <div className="space-y-1">
                              <Label className="text-sm font-bold text-slate-700">System Alerts</Label>
                              <p className="text-xs font-medium text-slate-400">Get notified about database or server health issues</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Database className="h-4 w-4" /> System Maintenance
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button variant="outline" className="justify-start gap-3 py-6 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                              <Database className="h-5 w-5 text-blue-500" /> Backup Database
                            </Button>
                            <Button variant="outline" className="justify-start gap-3 py-6 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                              <Globe className="h-5 w-5 text-emerald-500" /> Clear System Cache
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white h-fit">
                      <CardHeader className="px-8 py-6 text-center border-b border-slate-50">
                        <CardTitle className="text-xl font-black text-slate-900">Admin Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
                        <div className="relative group">
                          <div className="h-24 w-24 rounded-3xl bg-[#1a1a6e] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-900/30 group-hover:scale-105 transition-transform duration-300">
                            AD
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white shadow-lg"></div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900">Khushi</h4>
                          <p className="text-xs font-bold text-slate-400">admin@brs-gujarat.com</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider">Super Admin</Badge>
                        <div className="w-full pt-4 space-y-3">
                          <Button variant="outline" className="w-full py-5 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-xs">Edit Profile Information</Button>
                          <Button variant="outline" className="w-full py-5 rounded-2xl border-slate-200 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all text-xs">Change Account Password</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl overflow-hidden border-none p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Detailed information about the selected booking.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col">
              <div className="bg-[#1a1a6e] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block ${selectedBooking.pnr?.startsWith('PKG') ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {selectedBooking.pnr?.startsWith('PKG') ? 'Package Tour' : 'Regular Booking'}
                      </span>
                      <h2 className="text-4xl font-black tracking-tighter mb-1">{selectedBooking.pnr}</h2>
                      <p className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em]">Booking ID: {selectedBooking.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`modern-badge px-4 py-2 text-xs ${selectedBooking.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Passenger Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Primary Passenger</span>
                        <span className="text-sm font-black text-slate-900">{selectedBooking.passengerName}</span>
                      </div>
                      
                      {selectedBooking.allPassengers && selectedBooking.allPassengers.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight block border-b border-slate-50 pb-2">Full Passenger List</span>
                          <div className="space-y-2">
                            {selectedBooking.allPassengers.map((p, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700">{p.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase font-black">{p.gender}</span>
                                </div>
                                <span className="text-xs font-black bg-slate-50 px-2 py-1 rounded-lg text-slate-600">{p.age} yrs</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Gender / Age</span>
                        <span className="text-sm font-black text-slate-900">{selectedBooking.gender || 'N/A'} / {selectedBooking.age || 'N/A'} yrs</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Passengers</span>
                        <span className="text-sm font-black text-slate-900">
                          {selectedBooking.adults || 1} Adult(s) {selectedBooking.children ? `, ${selectedBooking.children} Child(ren)` : ''}
                        </span>
                      </div>
                      {selectedBooking.sharingType && (
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Sharing Type</span>
                          <span className="text-sm font-black text-blue-600 uppercase">
                            {selectedBooking.sharingType} Sharing
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Mobile</span>
                        <span className="text-sm font-black text-slate-900">{selectedBooking.mobile}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Email</span>
                        <span className="text-sm font-black text-slate-900 lowercase">{selectedBooking.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> Payment Information
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Payment Method</span>
                        <Badge variant="outline" className="font-black uppercase text-[10px] border-slate-200">{selectedBooking.paymentMethod || 'UPI'}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Amount Paid</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-black text-green-600">₹</span>
                          <span className="text-lg font-black text-green-600">{(Number(selectedBooking.amountPaid) || Number(selectedBooking.totalPrice) || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {(selectedBooking as any).addons && (selectedBooking as any).addons.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Add-ons</p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedBooking as any).addons.map((addon: any, idx: number) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                                {addon.name} (+₹{addon.price})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Bus className="h-3.5 w-3.5" /> Journey Details
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-[#1a1a6e]" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service / Package</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{selectedBooking.busName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <div className="w-0.5 h-8 bg-slate-100"></div>
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                          </div>
                          <div className="flex flex-col gap-4 flex-1">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Departure From</p>
                              <p className="text-sm font-bold text-slate-700">{selectedBooking.fromLocation}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination</p>
                              <p className="text-sm font-bold text-slate-700">{selectedBooking.toLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Timing Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Travel Date</p>
                        <p className="text-sm font-black text-slate-900">{selectedBooking.journeyDate}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Departure</p>
                        <p className="text-sm font-black text-slate-900">{selectedBooking.departureTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <Button onClick={() => setIsViewModalOpen(false)} className="bg-[#1a1a6e] hover:bg-[#2d2d8e] text-white font-black px-8 py-6 rounded-2xl uppercase tracking-widest text-xs">
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl overflow-hidden border-none p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Pass Details</DialogTitle>
            <DialogDescription>Detailed information about the selected bus pass.</DialogDescription>
          </DialogHeader>
          {selectedPass && (
            <div className="flex flex-col">
              <div className="bg-[#1a1a6e] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block bg-emerald-500/20 text-emerald-300">
                        Bus Pass
                      </span>
                      <h2 className="text-4xl font-black tracking-tighter mb-1">{selectedPass.passId}</h2>
                      <p className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em]">Internal ID: {selectedPass.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`modern-badge px-4 py-2 text-xs ${selectedPass.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {selectedPass.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Holder Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Full Name</span>
                        <span className="text-sm font-black text-slate-900">{selectedPass.passengerName}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Gender / Age</span>
                        <span className="text-sm font-black text-slate-900">{selectedPass.gender} / {selectedPass.age} yrs</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Mobile</span>
                        <span className="text-sm font-black text-slate-900">{selectedPass.mobile}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Email</span>
                        <span className="text-sm font-black text-slate-900 lowercase">{selectedPass.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> Pass Info
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Pass Type</span>
                        <Badge variant="outline" className="font-black uppercase text-[10px] border-slate-200">{selectedPass.passType}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Price Paid</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-black text-green-600">₹</span>
                          <span className="text-lg font-black text-green-600">{(Number(selectedPass.price) || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> Validity Period
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{selectedPass.duration}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          <div className="w-0.5 h-8 bg-slate-100"></div>
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex flex-col gap-4 flex-1">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Issued On</p>
                            <p className="text-sm font-bold text-slate-700">{selectedPass.startDate}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Expires On</p>
                            <p className="text-sm font-bold text-slate-700">{selectedPass.expiryDate}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest ${new Date(selectedPass.expiryDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {new Date(selectedPass.expiryDate) < new Date() ? 'Expired' : 'Valid Pass'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <Button onClick={() => setIsPassModalOpen(false)} className="bg-[#1a1a6e] hover:bg-[#2d2d8e] text-white font-black px-8 py-6 rounded-2xl uppercase tracking-widest text-xs">
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl bg-white rounded-3xl overflow-hidden border-none p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="p-8 bg-[#1a1a6e] text-white">
            <DialogTitle className="text-2xl font-black">Customer History</DialogTitle>
            <DialogDescription className="text-white/60 font-bold uppercase text-[10px] tracking-widest">
              Showing all activity for {selectedCustomerEmail}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
            {/* Bookings Section */}
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Ticket className="h-3.5 w-3.5" /> Booking History
              </h3>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase px-6">PNR</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Service</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Amount</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right px-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.filter(b => b.email === selectedCustomerEmail).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">No bookings found</TableCell>
                      </TableRow>
                    ) : (
                      bookings.filter(b => b.email === selectedCustomerEmail).map(booking => (
                        <TableRow key={booking.id} className="border-slate-50">
                          <TableCell className="px-6 py-4 font-mono font-bold text-blue-600">{booking.pnr}</TableCell>
                          <TableCell className="font-bold text-slate-700">{booking.busName}</TableCell>
                          <TableCell className="font-medium text-slate-500">{booking.journeyDate}</TableCell>
                          <TableCell className="font-black text-green-600">₹{(Number(booking.amountPaid) || Number(booking.totalPrice) || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right px-6">
                            <span className={`modern-badge ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {booking.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Passes Section */}
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" /> Bus Passes
              </h3>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase px-6">Pass ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Validity</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Price</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right px-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passes.filter(p => p.email === selectedCustomerEmail).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">No passes found</TableCell>
                      </TableRow>
                    ) : (
                      passes.filter(p => p.email === selectedCustomerEmail).map(pass => (
                        <TableRow key={pass.id} className="border-slate-50">
                          <TableCell className="px-6 py-4 font-mono font-bold text-blue-600">{pass.passId}</TableCell>
                          <TableCell className="font-bold text-slate-700">{pass.passType}</TableCell>
                          <TableCell className="font-medium text-slate-500">{pass.startDate} to {pass.expiryDate}</TableCell>
                          <TableCell className="font-black text-green-600">₹{pass.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right px-6">
                            <span className={`modern-badge ${pass.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {pass.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
            <Button onClick={() => setIsHistoryModalOpen(false)} className="bg-[#1a1a6e] hover:bg-[#2d2d8e] text-white font-black px-8 py-6 rounded-2xl uppercase tracking-widest text-xs">
              Close History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
