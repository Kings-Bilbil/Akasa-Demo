"use client";

import * as React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function LoginCardSection({ error, isRegister = false }: { error?: string, isRegister?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="fixed inset-0 bg-black text-zinc-50 overflow-hidden font-sans">
      <style>{`
        /* === Card minimal fade-up animation === */
        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Override Chrome Autofill background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 40px #18181b inset !important; /* matches bg-zinc-900 */
            -webkit-text-fill-color: #fafafa !important;
            caret-color: white;
        }
      `}</style>

      {/* Azuraya Background Triangles */}
      <div className="hero__flash-container" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="flash-light flash-light--left" />
        <div className="flash-light flash-light--right" />
      </div>

      {/* Back Button (Top Left) */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-zinc-300 font-semibold transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-base tracking-wide">Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="h-full w-full grid place-items-center px-4 relative z-10">
        <form action={isRegister ? "/api/auth/register" : "/api/auth/login"} method="POST" className="w-full max-w-md">
          <Card className="card-animate w-full border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-4 text-center pb-4" style={{ paddingTop: "80px" }}>
              <div className="flex justify-center items-center gap-3 mb-1">
                <img 
                  src="/images/logo.png" 
                  alt="Azuraya Logo" 
                  className="object-contain drop-shadow-md" style={{ height: "45px", width: "auto" }}
                />
                <span className="text-3xl font-bold tracking-widest text-[#F5C518]">AZURAYA</span>
              </div>
              <CardTitle className="text-2xl font-bold text-zinc-100 tracking-tight">
                {isRegister ? "Daftar Akun Baru" : "Selamat Datang"}
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6 pb-8">
              {error && (
                <div className="bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-3 rounded-md text-sm font-medium">
                  {error === 'true' ? 'Email atau Password salah.' : error}
                </div>
              )}

              {isRegister && (
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-300 font-medium" style={{ paddingLeft: "12px" }}>
                    Nama Lengkap
                  </Label>
                  <div className="relative flex items-center w-full">
                    <svg className="absolute left-3 h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Nama Anda"
                      className="!pl-10 h-12 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-[#F5C518]"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300 font-medium" style={{ paddingLeft: "12px" }}>
                  Email
                </Label>
                <div className="relative flex items-center w-full">
                  <Mail className="absolute left-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="anda@email.com"
                    className="!pl-10 h-12 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-[#F5C518]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-zinc-300 font-medium" style={{ paddingLeft: "12px" }}>
                  Password
                </Label>
                <div className="relative flex items-center w-full">
                  <Lock className="absolute left-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="!pl-10 !pr-10 h-12 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-[#F5C518]"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                    className="absolute right-2 p-2 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>



              <Button type="submit" className="w-full h-12 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-yellow-400 transition-colors text-base cursor-pointer" style={{ marginTop: "40px", marginBottom: "20px" }}>
                {isRegister ? "Daftar Sekarang" : "Masuk"}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-3 pt-8 text-base text-zinc-400" style={{ paddingBottom: "80px" }}>
              <div>
                {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}
                <Link className="ml-2 font-bold text-zinc-200 hover:text-[#F5C518] transition-colors" href={isRegister ? "/login" : "/register"}>
                  {isRegister ? "Masuk di sini" : "Daftar di sini"}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </section>
  );
}













