import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

/**
 * AccessDenied Component
 * 
 * Página que se muestra cuando un usuario intenta acceder a una ruta
 * que requiere permisos de administrador pero no los tiene.
 */
const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Acceso Denegado
        </h1>
        
        <p className="text-muted-foreground mb-8">
          No tienes permisos suficientes para acceder a esta página. 
          Esta sección está reservada solo para administradores.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
