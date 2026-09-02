"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, History, BarChart2, PenLine } from "lucide-react";

const nav = [
  { href: "/",            label: "Dashboard",          icon: LayoutDashboard, desc: "Vista principal" },
  { href: "/historial",   label: "Historial",           icon: History,          desc: "Datos por año" },
  { href: "/comparativa", label: "Comparativa de años", icon: BarChart2,        desc: "Análisis interanual" },
  { href: "/registro",    label: "Registrar",            icon: PenLine,          desc: "Nuevo consumo" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div id="mobile-nav-drawer" role="dialog" aria-label="Menú de navegación" className="md:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="h-16 flex items-center px-5 border-b border-slate-200">
              <p className="text-sm font-bold text-slate-900">Navegación</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 space-y-0.5">
              {nav.map(({ href, label, icon: Icon, desc }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                      active
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="leading-none">{label}</p>
                      <p className={`text-[10px] mt-0.5 font-normal leading-none ${
                        active ? "text-blue-500" : "text-slate-400"
                      }`}>
                        {desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200">
              <p className="text-[10px] text-slate-400 text-center">claudeEnergía v2.0</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
