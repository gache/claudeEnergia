"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, onSnapshot } from "firebase/firestore";
import {
  RegistroMensual, KPIMensual, TarifaMensual,
  calcularKPI, datosIniciales, TARIFAS_INICIALES, TARIFA_HC, TARIFA_HP,
} from "./data";
import { useAuth } from "./AuthContext";
import { getDb } from "./firebase";

const KEY_REGISTROS = "energia-registros-v1";
const KEY_TARIFAS   = "energia-tarifas-v2";

type EnergyContextType = {
  registros: RegistroMensual[];
  tarifas:   TarifaMensual[];
  addOrUpdate: (r: RegistroMensual) => void;
  setTarifa:   (año: number, mes: number, hc: number, hp: number) => void;
  getTarifa:   (año: number, mes: number) => { hc: number; hp: number };
  getByYear:   (año: number) => KPIMensual[];
  kpiFor:      (mes: number, año: number) => KPIMensual | null;
};

const EnergyContext = createContext<EnergyContextType | null>(null);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<RegistroMensual[]>(datosIniciales);
  const [tarifas,   setTarifas]   = useState<TarifaMensual[]>(TARIFAS_INICIALES);
  const [hydrated,  setHydrated]  = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const storedR = localStorage.getItem(KEY_REGISTROS);
      if (storedR) setRegistros(JSON.parse(storedR));
      const storedT = localStorage.getItem(KEY_TARIFAS);
      if (storedT) setTarifas(JSON.parse(storedT));
    } catch {
      localStorage.removeItem(KEY_REGISTROS);
      localStorage.removeItem(KEY_TARIFAS);
    }
    setHydrated(true);
  }, []);

  // Cargar datos de Firestore y escuchar cambios en tiempo real
  useEffect(() => {
    if (!hydrated) return;

    let unsubscribe: (() => void) | null = null;

    const initializeFirestore = async () => {
      try {
        const db = getDb();
        const docRef = doc(db, "familias", "hogar", "data", "profile");
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          // Intenta migrar datos de /users (datos antiguos de Google Login)
          try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            if (!usersSnapshot.empty) {
              const firstUser = usersSnapshot.docs[0];
              const userDataRef = doc(db, "users", firstUser.id, "data", "profile");
              const userDataSnap = await getDoc(userDataRef);

              if (userDataSnap.exists()) {
                const migratedData = userDataSnap.data();
                const registros = migratedData.registros || datosIniciales;
                const tarifas = migratedData.tarifas || TARIFAS_INICIALES;

                await setDoc(docRef, {
                  registros,
                  tarifas,
                  updatedAt: serverTimestamp(),
                });
                console.log("✅ Datos migrados de Google account a /familias/hogar");
              }
            }
          } catch (migrationError) {
            console.log("No legacy data found, using initial data");
          }

          // Si no hay datos antiguos, crear documento inicial
          const initialData = {
            registros: datosIniciales,
            tarifas: TARIFAS_INICIALES,
            updatedAt: serverTimestamp(),
          };
          await setDoc(docRef, initialData);
        }

        // Configurar listener en tiempo real
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const registros = data.registros || datosIniciales;
            const tarifas = data.tarifas || TARIFAS_INICIALES;

            setRegistros(registros);
            setTarifas(tarifas);
            localStorage.setItem(KEY_REGISTROS, JSON.stringify(registros));
            localStorage.setItem(KEY_TARIFAS, JSON.stringify(tarifas));
          }
        });
      } catch (error) {
        console.error("Error initializing Firestore:", error);
      }
    };

    initializeFirestore();

    // Limpiar listener al desmontar
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hydrated]);

  // Guardar en Firestore con debounce (máx 1 vez por segundo)
  useEffect(() => {
    if (!hydrated) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const db = getDb();
        const docRef = doc(db, "familias", "hogar", "data", "profile");
        await setDoc(docRef, {
          registros,
          tarifas,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [registros, tarifas, hydrated]);

  // Guardar en localStorage siempre (como caché local)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_REGISTROS, JSON.stringify(registros));
    localStorage.setItem(KEY_TARIFAS, JSON.stringify(tarifas));
  }, [registros, tarifas, hydrated]);

  function addOrUpdate(r: RegistroMensual) {
    setRegistros(prev => {
      const idx = prev.findIndex(x => x.mes === r.mes && x.año === r.año);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = r;
        return next;
      }
      return [...prev, r].sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes);
    });
  }

  function setTarifa(año: number, mes: number, hc: number, hp: number) {
    setTarifas(prev => {
      const idx = prev.findIndex(t => t.año === año && t.mes === mes);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { año, mes, hc, hp };
        return next;
      }
      return [...prev, { año, mes, hc, hp }]
        .sort((a, b) => a.año !== b.año ? a.año - b.año : a.mes - b.mes);
    });
  }

  function getTarifa(año: number, mes: number): { hc: number; hp: number } {
    const candidates = tarifas
      .filter(t => t.año < año || (t.año === año && t.mes <= mes))
      .sort((a, b) => a.año !== b.año ? b.año - a.año : b.mes - a.mes);
    if (candidates.length > 0) return { hc: candidates[0].hc, hp: candidates[0].hp };
    return { hc: TARIFA_HC, hp: TARIFA_HP };
  }

  function getByYear(año: number): KPIMensual[] {
    return registros
      .filter(r => r.año === año)
      .sort((a, b) => a.mes - b.mes)
      .map(r => calcularKPI(r, getTarifa(r.año, r.mes)));
  }

  function kpiFor(mes: number, año: number): KPIMensual | null {
    const r = registros.find(x => x.mes === mes && x.año === año);
    if (!r) return null;
    return calcularKPI(r, getTarifa(año, mes));
  }

  return (
    <EnergyContext.Provider value={{ registros, tarifas, addOrUpdate, setTarifa, getTarifa, getByYear, kpiFor }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error("useEnergy must be inside EnergyProvider");
  return ctx;
}
