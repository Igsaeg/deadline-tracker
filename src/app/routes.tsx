import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthSession } from "../app/App"

import HomePage from "../pages/home"
import AuthPage from "../pages/auth"

function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthSession();

  if (session === undefined) return <div>Loading...</div>;
  return session ? children : <Navigate to="/auth" replace />;
}

export default function AppRoutes() {
  const session = useAuthSession();
  
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />

      <Route path="*" element={<h1>404 Page not found.</h1>} />
    </Routes>
  )
}
