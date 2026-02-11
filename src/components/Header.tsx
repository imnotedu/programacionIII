import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Fitness Fuel
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Inicio</Link>
          <Link to="/tienda" className="text-sm font-medium hover:text-primary">Tienda</Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin-products" className="text-sm font-medium hover:text-primary">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
