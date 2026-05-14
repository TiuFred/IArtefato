"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Bell, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/base-correcao", label: "Base de Correção" },
  { href: "/simular", label: "Simular Avaliação" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-14",
        isLanding
          ? "bg-transparent"
          : "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#1e1e2e]"
      )}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#4f8ef7]/10 border border-[#4f8ef7]/30 flex items-center justify-center group-hover:bg-[#4f8ef7]/20 transition-all duration-200">
            <Brain className="w-4 h-4 text-[#4f8ef7]" />
          </div>
          <span className="text-sm font-semibold text-[#e2e8f0]">
            I<span className="text-[#4f8ef7]">Artefato</span>
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-[#4f8ef7]/10 text-[#4f8ef7] border border-[#4f8ef7]/20">
            beta
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#4f8ef7]/10 text-[#4f8ef7]"
                      : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isLanding ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#4f8ef7] text-white hover:bg-[#3b71f5] transition-all duration-200 shadow-[0_0_20px_rgba(79,142,247,0.3)]"
              >
                Acessar plataforma
              </Link>
              <Link
                href="/dashboard"
                className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#4f8ef7]/10 border border-[#4f8ef7]/20 text-[#4f8ef7]"
              >
                <Menu className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94a3b8] hover:bg-white/5 transition-all">
                <Search className="w-4 h-4" />
              </button>
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94a3b8] hover:bg-white/5 transition-all">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4f8ef7]" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-white cursor-pointer">
                F
              </div>
              <button
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && !isLanding && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#1e1e2e] px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#4f8ef7]/10 text-[#4f8ef7]"
                    : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
