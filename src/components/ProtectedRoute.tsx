import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean; // Prop opcional para rutas que requieren admin
}

/**
 * ProtectedRoute Component
 * 
 * Componente que protege rutas requiriendo autenticación.
 * Opcionalmente puede requerir nivel de administrador.
 * 
 * @param children - Componentes hijos a renderizar si el acceso es permitido
 * @param requireAdmin - Si es true, solo usuarios admin pueden acceder
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireAdmin = false 
}) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        // Guardamos la ruta actual para redirigir después del login
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Si la ruta requiere admin y el usuario no es admin, redirigir a página de acceso denegado
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
