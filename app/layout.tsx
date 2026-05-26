import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SyncStatusBanner from "@/components/SyncStatusBanner";
import { EnergyProvider } from "@/lib/EnergyContext";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="es" className={`${jakarta.variable} ${spaceMono.variable} ${jetbrainsMono.variable}`}>
      <body className="flex flex-col min-h-screen antialiased" style={{ backgroundColor: "#fafbfc" }}>
        <AuthProvider>
          <EnergyProvider>
            <ProtectedLayout>
              <SyncStatusBanner />
              <Navbar />
              <main className="flex-1">
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
