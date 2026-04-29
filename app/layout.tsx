import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { EnergyProvider } from "@/lib/EnergyContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "claudeEnergía — Análisis HC/HP",
  description: "Dashboard de análisis energético con tarifas Heures Creuses y Heures Pleines",
  keywords: ["energía", "HC", "HP", "kWh", "consumo eléctrico", "análisis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-screen bg-slate-100 antialiased">
        <EnergyProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </EnergyProvider>
      </body>
    </html>
  );
}
