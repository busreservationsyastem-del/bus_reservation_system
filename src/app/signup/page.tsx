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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a6e] via-[#2d2d8e] to-[#6b21a8] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Bus className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-white/60">Join BRS for a better travel experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/30"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/30"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-white/60">
            <p>Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Log In</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
