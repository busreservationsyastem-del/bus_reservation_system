"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

      const userData = querySnapshot.docs[0].data();
      
      // Store in localStorage for session simulation
      localStorage.setItem("customer_user", JSON.stringify(userData));
      
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
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
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-white/60">Log in to manage your bookings and passes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-white/60">
            <p>Don't have an account? <Link href="/signup" className="text-white font-bold hover:underline">Sign Up</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
