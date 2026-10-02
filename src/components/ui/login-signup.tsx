"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function LoginCardSection({ error, isRegister = false }: { error?: string, isRegister?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="fixed inset-0 bg-[#09090b] text-zinc-50 overflow-hidden font-sans">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        
        .card-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s cubic-bezier(.22,.61,.36,1) 0.4s forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.04),transparent_60%)]" />

      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-8 py-6 border-b border-zinc-800/80 z-20 bg-[#09090b]/80 backdrop-blur-md">
        <span className="text-sm tracking-[0.2em] uppercase font-bold text-[#F5C518]">
          Azuraya Grup
        </span>
        <Link href="/">
          <button type="button" className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer">
            <span className="mr-2">Kembali ke Beranda</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </header>

      <div className="h-full w-full flex items-center justify-center px-4 relative z-10 pt-16">
        <form action={isRegister ? "/api/auth/register" : "/api/auth/login"} method="POST" className="w-full max-w-[400px]">
          <div className="card-animate w-full border border-zinc-800 bg-[#111113]/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="p-8 pb-6 flex flex-col space-y-2">
              <h3 className="text-2xl font-semibold leading-none tracking-tight text-zinc-100">
                {isRegister ? "Daftar Akun Baru" : "Selamat Datang"}
              </h3>
              <p className="text-sm text-zinc-400">
                {isRegister 
                  ? "Bergabung dengan Azuraya untuk mulai berbelanja." 
                  : "Silakan masuk ke akun Azuraya Anda."}
              </p>
            </div>

            <div className="p-8 pt-0 grid gap-5">
              {error && (
                <div className="bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-3 rounded-md text-sm font-medium">
                  {error === 'true' ? 'Email atau Password salah.' : error}
                </div>
              )}

              {isRegister && (
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none text-zinc-300">Nama Lengkap</label>
                  <div className="relative flex items-center w-full">
                    <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                      <svg className="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Nama Anda"
                      className="block h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5C518]/50 focus:border-[#F5C518]/50 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium leading-none text-zinc-300">Email</label>
                <div className="relative flex items-center w-full">
                  <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="anda@email.com"
                    className="block h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5C518]/50 focus:border-[#F5C518]/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium leading-none text-zinc-300">Password</label>
                <div className="relative flex items-center w-full">
                  <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-10 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#F5C518]/50 focus:border-[#F5C518]/50 transition-all"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                    className="absolute right-2 top-0 bottom-0 my-auto h-9 w-9 flex items-center justify-center p-0 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isRegister && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#F5C518] focus:ring-[#F5C518] focus:ring-offset-zinc-950"
                    />
                    <label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer">
                      Ingat saya
                    </label>
                  </div>
                  <a href="#" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                    Lupa password?
                  </a>
                </div>
              )}

              <button type="submit" className="w-full h-11 mt-4 rounded-lg bg-[#F5C518] text-black font-bold text-sm hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all">
                {isRegister ? "Daftar Sekarang" : "Masuk"}
              </button>
            </div>

            <div className="p-6 pt-0 mt-auto bg-zinc-950/30 border-t border-zinc-800/50 flex flex-col items-center gap-3 text-sm text-zinc-400">
              <div className="mt-4">
                {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}
                <Link className="ml-2 text-zinc-200 hover:text-[#F5C518] font-semibold transition-colors" href={isRegister ? "/login" : "/register"}>
                  {isRegister ? "Masuk di sini" : "Daftar di sini"}
                </Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
}


