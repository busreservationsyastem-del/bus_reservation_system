"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Mail, Lock, ArrowRight, Loader2, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Forgot Password States
  const [view, setView] = useState<"login" | "forgot" | "otp" | "reset">("login");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetUserEmail, setResetUserEmail] = useState("");

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("vJt32KRgSstJ0YzW5");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid email or password");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.password !== password) {
        throw new Error("Invalid email or password");
      }

      // Store in localStorage for session simulation
      localStorage.setItem("customer_user", JSON.stringify({ ...userData, id: userDoc.id }));
      
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("email", "==", resetUserEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No account found with this email");
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(generatedOtp);

      const templateParams = {
        to_email: resetUserEmail,
        user_email: resetUserEmail,
        reply_to: resetUserEmail,
        otp_code: generatedOtp,
        otp: generatedOtp,
        code: generatedOtp,
        message: generatedOtp,
        user_name: querySnapshot.docs[0].data().name || "User"
      };

      await emailjs.send(
        "service_h7dtyva",
        "template_fypj07w",
        templateParams,
        "vJt32KRgSstJ0YzW5"
      );

      toast.success("OTP sent to your email!");
      setView("otp");
    } catch (err: any) {
      console.error("OTP Error:", err);
      // Display the actual error text if available
      const errorMessage = err?.text || err?.message || "Failed to send OTP. Please check your EmailJS configuration.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === sentOtp) {
      toast.success("OTP Verified!");
      setView("reset");
      setError("");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("email", "==", resetUserEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "customers", userDoc.id), {
        password: newPassword
      });

      toast.success("Password reset successful! Please log in.");
      setView("login");
      setEmail(resetUserEmail);
      setPassword("");
    } catch (err: any) {
      console.error("Reset Error:", err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (view === "forgot") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
              <KeyRound className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Forgot Password</CardTitle>
            <CardDescription className="text-white/60 font-medium">Enter your email to receive a reset code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-white/5 border-white/10 pl-12 h-12 text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all"
                    value={resetUserEmail}
                    onChange={(e) => setResetUserEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-900/40">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Code"}
              </Button>
            </form>
            <button onClick={() => setView("login")} className="w-full text-center text-sm font-bold text-white/60 hover:text-white transition-colors">
              Back to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
              <ShieldCheck className="h-8 w-8 text-green-400" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Verify OTP</CardTitle>
            <CardDescription className="text-white/60 font-medium">Enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="bg-white/5 border-white/10 h-16 text-center text-3xl font-black tracking-[0.5em] text-white placeholder:text-white/10 focus:border-green-500/50 transition-all rounded-2xl"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-green-900/40">
                Verify Code
              </Button>
            </form>
            <button onClick={() => setView("forgot")} className="w-full text-center text-sm font-bold text-white/60 hover:text-white transition-colors">
              Resend Code
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "reset") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white shadow-2xl rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30">
              <Lock className="h-8 w-8 text-purple-400" />
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">New Password</CardTitle>
            <CardDescription className="text-white/60 font-medium">Create a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 pl-12 h-12 text-white placeholder:text-white/20 focus:border-purple-500/50 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 pl-12 h-12 text-white placeholder:text-white/20 focus:border-purple-500/50 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-900/40">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-[40px] overflow-hidden p-6 border border-white/20">
        <CardHeader className="text-center pt-6 pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/10 shadow-inner">
            <Bus className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-5xl font-bold tracking-tight mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-white/50 font-medium text-lg leading-relaxed">Log in to manage your bookings and passes</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-white/5 border-white/10 pl-12 h-14 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/10 focus:border-white/20 transition-all text-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-white/5 border-white/10 pl-12 h-14 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/10 focus:border-white/20 transition-all text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setView("forgot")} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white/60 uppercase hover:text-white transition-colors tracking-widest"
                  >
                    Forgot?
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-[#1d63ff] hover:bg-[#1d63ff]/90 text-white h-16 text-xl font-bold rounded-2xl transition-all shadow-xl mt-4">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Log In"}
            </Button>
          </form>
          <div className="mt-10 text-center">
            <p className="text-lg font-medium text-white/50">
              Don't have an account? <Link href="/signup" className="text-white font-bold hover:underline ml-1">Sign Up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
