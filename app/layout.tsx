import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SyncStatusBanner from "@/components/SyncStatusBanner";
import { EnergyProvider } from "@/lib/EnergyContext";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-fira-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "claudeEnergía — Análisis HC/HP",
  description: "Dashboard de análisis energético con tarifas Heures Creuses y Heures Pleines",
  keywords: ["energía", "HC", "HP", "kWh", "consumo eléctrico", "análisis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${firaCode.variable} ${firaSans.variable}`}>
      <body className="flex flex-col min-h-screen antialiased">
        <AuthProvider>
          <EnergyProvider>
            <ProtectedLayout>
              <SyncStatusBanner />
              <Navbar />
              <main id="main-content" className="flex-1">
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
