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
    if (!passId && !mobile) {
      alert("Please enter Pass ID or Mobile Number");
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
        setError("Invalid Bus Pass ID or Phone Number.");
      }
    } catch (error) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  const downloadPDF = async () => {
    const element = document.getElementById("bus-pass-card");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#1a1a6e", logging: false, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bus_Pass_${foundPass.passId}.pdf`);
    } catch (error) {
      console.error("PDF failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] text-white flex flex-col font-sans">
      <header className="p-4 flex items-center gap-4 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <Link href="/bus-pass" className="rounded-lg p-2 hover:bg-white/10 transition-colors"><ArrowLeft className="h-6 w-6" /></Link>
        <h1 className="text-xl font-bold uppercase tracking-tight">Application Status</h1>
      </header>
      <main className="p-6 max-w-lg mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <Search className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Check Pass Status</h2>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Bus Pass ID</label>
              <input type="text" value={passId} onChange={(e) => setPassId(e.target.value.toUpperCase())} placeholder="PASSXXXXXX" className="w-full bg-transparent border-b border-white/20 pb-2 outline-none text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Registered Mobile</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digit number" className="w-full bg-transparent border-b border-white/20 pb-2 outline-none text-lg" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-white text-[#1a1a6e] font-black py-4 rounded-2xl uppercase tracking-widest">{loading ? "Checking..." : "Track Pass"}</button>
          </form>
          {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}
          {searched && !loading && foundPass && (
            <div className="mt-8 space-y-6">
              <div className={`p-6 rounded-2xl flex items-center justify-between ${isExpired(foundPass.expiryDate) ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                <div className="flex items-center gap-4">
                  {isExpired(foundPass.expiryDate) ? <XCircle className="h-8 w-8 text-red-400" /> : <CheckCircle className="h-8 w-8 text-green-400" />}
                  <div>
                    <p className="text-xs font-bold uppercase text-white/40">Status</p>
                    <p className={`text-xl font-black uppercase ${isExpired(foundPass.expiryDate) ? 'text-red-400' : 'text-green-400'}`}>{isExpired(foundPass.expiryDate) ? 'Expired' : 'Active'}</p>
                  </div>
                </div>
                {!isExpired(foundPass.expiryDate) && <button onClick={downloadPDF} className="bg-white/10 p-2 rounded-xl"><Download className="h-5 w-5" /></button>}
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-white/40 uppercase">Pass ID</p><p className="font-bold text-yellow-300">{foundPass.passId}</p></div>
                  <div><p className="text-xs text-white/40 uppercase">Duration</p><p className="font-bold">{foundPass.duration}</p></div>
                </div>
                <div><p className="text-xs text-white/40 uppercase">Passenger</p><p className="font-bold">{foundPass.passengerName}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-white/40 uppercase">Issue Date</p><p className="font-bold">{foundPass.startDate}</p></div>
                  <div><p className="text-xs text-white/40 uppercase">Expiry Date</p><p className={`font-bold ${isExpired(foundPass.expiryDate) ? 'text-red-400' : 'text-green-400'}`}>{foundPass.expiryDate}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div id="bus-pass-card" style={{ position: 'fixed', left: '-9999px', backgroundColor: '#1a1a6e', color: '#ffffff', padding: '48px', borderRadius: '40px', width: '600px', border: '4px solid rgba(255, 255, 255, 0.2)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '16px' }}><Bus style={{ height: '32px', width: '32px', color: '#fde047' }} /></div>
            <div style={{ textAlign: 'left' }}><h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>City Commuter</h3><p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>Bus Pass System</p></div>
          </div>
          <div style={{ textAlign: 'right' }}><p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: 0 }}>Pass Status</p><p style={{ fontSize: '18px', fontWeight: 900, color: '#4ade80', margin: 0 }}>Active</p></div>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '32px', marginBottom: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '8px' }}>Bus Pass ID</p>
          <p style={{ fontSize: '48px', fontWeight: 900, color: '#fde047', margin: 0 }}>{foundPass?.passId}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 4px 0' }}>Passenger</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{foundPass?.passengerName}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '16px 0 4px 0' }}>Gender/Age</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{foundPass?.gender} / {foundPass?.age}</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0 4px 0' }}>Issue Date</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{foundPass?.startDate}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', margin: '16px 0 4px 0' }}>Expiry Date</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{foundPass?.expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
