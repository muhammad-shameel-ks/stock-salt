"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { LoadingScreen } from "@/components/loading-screen";
import { DatabaseInactivePage } from "@/components/database-inactive-page";
import { checkDatabaseHealth } from "@/lib/db-health";

interface SessionContextType {
  session: any | null;
  user: any | null;
  loading: boolean;
  dbHealthy: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: true,
  dbHealthy: true,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbHealthy, setDbHealthy] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const isHealthy = await checkDatabaseHealth();
      setDbHealthy(isHealthy);

      if (!isHealthy) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange((event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    getSession();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!dbHealthy) {
    return <DatabaseInactivePage />;
  }

  return (
    <SessionContext.Provider value={{ session, user, loading, dbHealthy }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
