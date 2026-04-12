"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, Search, Smartphone, ShieldCheck, CheckCircle, XCircle, Calendar, User, Mail, RefreshCw, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PassStatusPage() {
  const [passId, setPassId] = useState("");
  const [mobile, setMobile] = useState("");
  const [foundPass, setFoundPass] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passId && !mobile) {
      alert("Please enter Pass ID or Mobile Number");
      return;
    }

    // Pass ID validation (if entered)
    if (passId && !/^PASS[A-Z0-9]{6}$/.test(passId)) {
      setError("Invalid Bus Pass ID format. It should be PASS followed by 6 characters.");
      return;
    }

    // Mobile validation (if entered)
    if (mobile && mobile.length !== 10) {
      setError("Please enter exactly 10 digits for the registered mobile number.");
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      setError("Mobile number must contain only numbers.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    try {
      const response = await fetch(`/api/bus-pass?passId=${passId}&mobile=${mobile}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        setFoundPass(data[0]);
      } else {
        setFoundPass(null);
        setError("Invalid Bus Pass ID or Phone Number. Please check and try again.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const downloadPDF = async () => {
    const element = document.getElementById("bus-pass-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#1a1a6e",
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bus_Pass_${foundPass.passId}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <Link href="/bus-pass" className="rounded-lg p-2 hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-tight">Application Status</h1>
      </header>
      <main className="p-6 max-w-lg mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <Search className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Check Pass Status</h2>
            <p className="text-white/60 text-sm font-medium">Search using your Pass ID or Registered Mobile Number.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Bus Pass ID</label>
              <div className="flex items-center gap-4 border-b border-white/20 pb-3 group">
                <ShieldCheck className="h-5 w-5 text-white/40 group-focus-within:text-white" />
                <input 
                  type="text" 
                  value={passId}
                  onChange={(e) => setPassId(e.target.value.toUpperCase())}
                  placeholder="PASSXXXXXX" 
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20 uppercase" 
                />
              </div>
            </div>

            <div className="relative text-center">
              <span className="bg-[#1a1a6e] px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest relative z-10">OR</span>
              <div className="absolute top-1/2 left-0 w-full border-t border-white/10"></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Registered Mobile</label>
              <div className={`flex items-center gap-4 border-b pb-3 group transition-colors ${error && mobile.length !== 10 ? 'border-red-500' : 'border-white/20'}`}>
                <Smartphone className={`h-5 w-5 transition-colors ${error && mobile.length !== 10 ? 'text-red-400' : 'text-white/40 group-focus-within:text-white'}`} />
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (error) setError("");
                  }}
                  placeholder="10 digit number" 
                  maxLength={10}
                  className="outline-none bg-transparent w-full text-lg font-medium placeholder:text-white/20" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-[#1a1a6e] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50"
            >
              {loading ? "Checking Status..." : "Track Pass"}
              <Search className="h-6 w-6" />
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-bold text-red-300 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="h-3.5 w-3.5" />
                Note: {error}
              </p>
            </div>
          )}

          {searched && !loading && foundPass && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {foundPass ? (
                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                  <div className={`p-6 flex items-center justify-between ${isExpired(foundPass.expiryDate) ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                    <div className="flex items-center gap-4">
                      {isExpired(foundPass.expiryDate) ? (
                        <XCircle className="h-8 w-8 text-red-400" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Status</p>
                        <p className={`text-xl font-black uppercase tracking-tight ${isExpired(foundPass.expiryDate) ? 'text-red-400' : 'text-green-400'}`}>
                          {isExpired(foundPass.expiryDate) ? 'Expired' : 'Active'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isExpired(foundPass.expiryDate) && (
                        <button 
                          onClick={downloadPDF}
                          className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5 text-white" />
                        </button>
                      )}
                      {isExpired(foundPass.expiryDate) && (
                        <Link href="/bus-pass/renewal" className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                          <RefreshCw className="h-5 w-5 text-white" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Hidden PDF Template */}
                  <div id="bus-pass-card" className="fixed -left-[9999px] bg-[#1a1a6e] text-white p-12 rounded-[40px] w-[600px] border-4 border-white/20 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                            <Bus className="h-8 w-8 text-yellow-300" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">City Commuter</h3>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Bus Pass System</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pass Status</p>
                          <p className={`text-lg font-black uppercase tracking-tight ${isExpired(foundPass.expiryDate) ? 'text-red-400' : 'text-green-400'}`}>
                            {isExpired(foundPass.expiryDate) ? 'Expired' : 'Active'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-md mb-8">
                        <div className="flex flex-col items-center mb-8">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Bus Pass ID</p>
                          <p className="text-5xl font-black text-yellow-300 tracking-tighter">{foundPass.passId}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-left">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Passenger</p>
                            <p className="text-lg font-black uppercase tracking-tight truncate">{foundPass.passengerName}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gender/Age</p>
                            <p className="text-lg font-black uppercase tracking-tight">{foundPass.gender} / {foundPass.age}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Issue Date</p>
                            <p className="text-lg font-black uppercase tracking-tight">{foundPass.startDate}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Expiry Date</p>
                            <p className={`text-lg font-black uppercase tracking-tight ${isExpired(foundPass.expiryDate) ? 'text-red-300' : 'text-green-300'}`}>
                              {foundPass.expiryDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 opacity-40">
                        <div className="h-1 w-1 bg-white rounded-full"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Authentic Bus Pass</p>
                        <div className="h-1 w-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pass ID</p>
                        <p className="text-sm font-bold text-yellow-300">{foundPass.passId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Duration</p>
                        <p className="text-sm font-bold">{foundPass.duration}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Passenger Details</p>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-300" />
                        </div>
                        <p className="text-sm font-bold">{foundPass.passengerName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Issue Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/30" />
                          <p className="text-sm font-bold">{foundPass.startDate}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Expiry Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-white/30" />
                          <p className={`text-sm font-bold ${isExpired(foundPass.expiryDate) ? 'text-red-300' : 'text-green-300'}`}>
                            {foundPass.expiryDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
