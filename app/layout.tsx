import type { Metadata } from "next";
import { Outfit, Space_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { EnergyProvider } from "@/lib/EnergyContext";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  weight: ["400", "700"],
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
    <html lang="es" className={`${outfit.variable} ${spaceMono.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen bg-gradient-subtle antialiased flex-col md:flex-row" style={{ backgroundColor: "#fafbfc" }}>
        <AuthProvider>
          <EnergyProvider>
            <ProtectedLayout>
              <MobileNav />
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                  {children}
                </div>
              </main>
            </ProtectedLayout>
          </EnergyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
