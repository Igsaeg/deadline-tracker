import { BrowserRouter } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/supabase_client";
import _Routes from "./routes";

const SessionContext = createContext<Session | null>(null);
export const useSession = () => useContext(SessionContext);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) setSession(session);
      } catch (error) {
        console.error(error);
        if (active) setSession(null);
      }
    };

    void initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={session}>
      <BrowserRouter>
        <main>
          <_Routes />
        </main>
      </BrowserRouter>
    </SessionContext.Provider>
  );
}