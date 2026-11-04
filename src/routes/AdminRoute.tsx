import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0ea9df]/25 border-t-[#0ea9df]"></div>
      </div>
    );
  }

  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
