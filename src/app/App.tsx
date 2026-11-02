import { BrowserRouter } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/supabase_client";
import AppRoutes from "./routes";

const AuthSessionContext = createContext<Session | null>(null);
export const useAuthSession = () => useContext(AuthSessionContext);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (isMounted) setSession(session);
      } catch (error) {
        console.error(error);
        if (isMounted) setSession(null);
      }
    };

    void loadSession();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (isMounted) setSession(updatedSession);
    });

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
  }, []);

  return (
    <AuthSessionContext.Provider value={session}>
      <BrowserRouter>
        <main>
          <AppRoutes />
        </main>
      </BrowserRouter>
    </AuthSessionContext.Provider>
  );
}