import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { EnergyProvider } from "@/lib/EnergyContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "claudeEnergía — Análisis HC/HP",
  description: "Dashboard de análisis energético con tarifas Heures Creuses y Heures Pleines",
  keywords: ["energía", "HC", "HP", "kWh", "consumo eléctrico", "análisis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 antialiased flex-col md:flex-row">
        <EnergyProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </EnergyProvider>
      </body>
    </html>
  );
}
