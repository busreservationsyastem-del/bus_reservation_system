"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const customerId = `cust_${Math.random().toString(36).substr(2, 9)}`;
      const customerData = {
        name,
        email,
        mobile,
        password,
        id: customerId
      };

      // Store in Firestore - Required for deployment so data is shared across all users
      await setDoc(doc(collection(db, "customers"), customerId), {
        ...customerData,
        createdAt: serverTimestamp()
      });

      // Set local session
      localStorage.setItem("customer_user", JSON.stringify(customerData));
      
      router.push("/");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/10 text-white shadow-2xl rounded-[40px] overflow-hidden p-6 border border-white/20">
        <CardHeader className="text-center pt-6 pb-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 border border-white/10 shadow-inner">
            <Bus className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-5xl font-bold tracking-tight mb-2">Create Account</CardTitle>
          <CardDescription className="text-white/50 font-medium text-lg leading-relaxed">Join BRS for a better travel experience</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="bg-white/5 border-white/10 pl-12 h-14 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/10 focus:border-white/20 transition-all text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  className="bg-white/5 border-white/10 pl-12 h-14 text-white placeholder:text-white/30 rounded-2xl focus:bg-white/10 focus:border-white/20 transition-all text-lg"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
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
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-[#1d63ff] hover:bg-[#1d63ff]/90 text-white h-16 text-xl font-bold rounded-2xl transition-all shadow-xl mt-4">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          <div className="mt-10 text-center">
            <p className="text-lg font-medium text-white/50">
              Already have an account? <Link href="/login" className="text-white font-bold hover:underline ml-1">Log In</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
