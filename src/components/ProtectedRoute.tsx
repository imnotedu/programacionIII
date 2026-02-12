import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin) {
        // Backend uses 'level', frontend might type it as 'role' or 'level'
        const isAdmin = user?.level === 'admin' || user?.role === 'admin';

        if (!isAdmin) {
            return <Navigate to="/access-denied" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
