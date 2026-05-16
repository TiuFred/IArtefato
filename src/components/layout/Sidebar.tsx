"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  FlaskConical,
  ChevronRight,
  Zap,
  Settings,
  HelpCircle,
  FileText,
  TrendingUp,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Visão geral",
  },
  {
    href: "/base-correcao",
    icon: Database,
    label: "Base de Correção",
    description: "Alimentar base",
    badge: "18",
  },
  {
    href: "/simular",
    icon: FlaskConical,
    label: "Simular Avaliação",
    description: "Prever correção",
  },
  {
    href: "/criacao-perguntas",
    icon: PenLine,
    label: "Criação de Perguntas",
    description: "Gerar questões",
  },
];

const secondaryNav = [
  { href: "/atividades", icon: FileText, label: "Atividades" },
  { href: "/padroes", icon: TrendingUp, label: "Padrões Inferidos" },
  { href: "/tutorial", icon: HelpCircle, label: "Tutorial" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 fixed left-0 top-14 bottom-0 border-r border-[#1e1e2e] bg-[#0a0a0f] overflow-y-auto">
      <div className="flex flex-col gap-1 p-3 flex-1">
        {/* Status indicator */}
        <div className="mx-2 mb-3 mt-1 flex items-center gap-2 px-2 py-2 rounded-lg bg-[#10d98c]/5 border border-[#10d98c]/10">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-[#10d98c]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#10d98c] animate-ping opacity-50" />
          </div>
          <span className="text-xs text-[#10d98c] font-medium">Base ativa</span>
          <span className="ml-auto text-xs text-[#475569]">21 padrões</span>
        </div>

        {/* Main navigation */}
        <div className="mb-2">
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">
            Principal
          </p>
          {mainNav.map(({ href, icon: Icon, label, description, badge }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-[#4f8ef7]/10 text-[#4f8ef7]"
                    : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[#4f8ef7]" />
                )}
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    isActive
                      ? "bg-[#4f8ef7]/20"
                      : "bg-[#1e1e2e] group-hover:bg-[#2e2e4e]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium leading-none">
                      {label}
                    </span>
                    {badge && (
                      <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-[#4f8ef7]/10 text-[#4f8ef7]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#475569] mt-0.5 block">
                    {description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary navigation */}
        <div className="mb-2">
          <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">
            Análise
          </p>
          {secondaryNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-[#4f8ef7]/10 text-[#4f8ef7]"
                    : "text-[#475569] hover:text-[#94a3b8] hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-[#1e1e2e] flex flex-col gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[#475569] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configurações</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[#475569] hover:text-[#94a3b8] hover:bg-white/5 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Ajuda</span>
          </Link>
        </div>

        {/* Quick action */}
        <div className="mt-3 mx-1 p-3 rounded-xl bg-gradient-to-br from-[#4f8ef7]/10 to-[#8b5cf6]/10 border border-[#4f8ef7]/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#4f8ef7]" />
            <span className="text-xs font-semibold text-[#e2e8f0]">
              Simulação Rápida
            </span>
          </div>
          <p className="text-[11px] text-[#475569] mb-2.5 leading-relaxed">
            Use padrões inferidos para prever sua nota
          </p>
          <Link
            href="/simular"
            className="flex items-center gap-1 text-xs font-medium text-[#4f8ef7] hover:text-[#6ba3f9] transition-colors"
          >
            Simular agora
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
