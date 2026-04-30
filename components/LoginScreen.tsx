"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginScreen() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Error al iniciar sesión. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #0f1f45 0%, #0a1628 60%, #080f2a 100%)" }}>
      <div className="w-full max-w-md px-6">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/40 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center" style={{ fontFamily: "var(--font-sora, Sora), sans-serif" }}>
            claudeEnergía
          </h1>
          <p className="text-slate-400 text-sm mt-2">Análisis inteligente HC/HP</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Bienvenido</h2>
            <p className="text-slate-400 text-sm">
              Inicia sesión con Google para sincronizar tus datos en la nube
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                       bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Iniciar sesión con Google
              </>
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-slate-500 text-center mt-6">
            Tus datos se sincronizarán de forma segura en Firebase. Solo tú podrás acceder.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          claudeEnergía v2.0 • Análisis energético HC/HP
        </p>

      </div>
    </div>
  );
}
