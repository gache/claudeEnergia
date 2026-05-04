"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, History, BarChart2, PenLine } from "lucide-react";

const nav = [
  { href: "/",            label: "Dashboard",         icon: LayoutDashboard, desc: "Vista principal" },
  { href: "/historial",   label: "Historial",          icon: History,          desc: "Datos por año" },
  { href: "/comparativa", label: "Comparativa de años",  icon: BarChart2,        desc: "Análisis interanual" },
  { href: "/registro",    label: "Registrar",           icon: PenLine,          desc: "Nuevo consumo" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-lg hover:bg-brand-700 transition-colors"
        title={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="md:hidden fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-40 shadow-2xl flex flex-col overflow-y-auto">
            {/* Close button (mobile) */}
            <div className="h-16 flex items-center px-5 border-b border-white/10">
              <p className="text-sm font-bold text-white">Navegación</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {nav.map(({ href, label, icon: Icon, desc }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                      active
                        ? "bg-brand-600 text-white shadow-md"
                        : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      active
                        ? "bg-white/30 shadow-lg shadow-brand-500/30"
                        : "bg-white/5 group-hover:bg-white/15 group-hover:shadow-md"
                    }`}>
                      <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="leading-none">{label}</p>
                      <p className={`text-[10px] mt-0.5 font-normal leading-none ${
                        active ? "text-blue-200" : "text-slate-600 group-hover:text-slate-400"
                      }`}>
                        {desc}
                      </p>
                    </div>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-[10px] text-slate-600 text-center">claudeEnergía v2.0</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
