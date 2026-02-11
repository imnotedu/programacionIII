import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Dumbbell, LogOut, User as UserIcon, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { favorites } = useFavorites();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/tienda", label: "Tienda" },
    { to: "/#populares", label: "Populares" },
    { to: "/#contacto", label: "Contacto" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate initials from name (e.g. "Juan Perez" -> "JP")
  const userInitials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "U";

  // Determine styles based on scroll and location
  // Home page starts transparent (white text), becomes backdrop (black text) on scroll
  // Other pages always backdrop (black text)
  const isTransparent = location.pathname === "/" && !isScrolled;

  const headerClass = `fixed top-0 z-50 w-full transition-all duration-300 ${isTransparent
      ? "bg-transparent border-transparent"
      : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm"
    }`;

  const textColorClass = isTransparent ? "text-white" : "text-foreground";
  const mutedTextColorClass = isTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground";
  const iconColorClass = isTransparent ? "text-white" : "text-foreground";
  const buttonHoverClass = isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-accent hover:text-accent-foreground text-foreground";
  const mobileMenuButtonClass = isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent hover:text-accent-foreground";

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 mr-8 transition-opacity hover:opacity-90 group">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isTransparent ? "bg-white/20" : "bg-primary/10"
              }`}>
              <Dumbbell className={`w-5 h-5 ${isTransparent ? "text-white" : "text-primary"}`} />
            </div>
            <span className={`text-lg font-bold tracking-tight hidden sm:inline-block ${textColorClass}`}>
              Power<span className="text-primary">Fit</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors uppercase tracking-wide text-xs font-bold ${isActive(link.to)
                    ? "text-primary"
                    : mutedTextColorClass
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer to push actions to the right */}
          <div className="flex-1" />

          {/* Desktop Actions Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Admin Link (Discreet) */}
            {isAuthenticated && isAdmin() && (
              <Link
                to="/admin-products"
                className={`text-xs font-medium transition-colors mr-2 ${mutedTextColorClass}`}
              >
                Admin
              </Link>
            )}

            {/* Favorites Link */}
            <Link
              to="/favoritos" // Assuming we might make a page for it later, or just a placeholder
              className={`relative flex items-center justify-center w-9 h-9 rounded-md transition-colors ${buttonHoverClass}`}
              title="Mis Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              <span className="sr-only">Favoritos ({favorites.length})</span>
            </Link>


            {/* Cart Button */}
            <Link
              to="/carrito"
              className={`relative flex items-center justify-center w-9 h-9 rounded-md transition-colors ${buttonHoverClass}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
              <span className="sr-only">Carrito ({totalItems})</span>
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1">
                    <Avatar className={`h-8 w-8 border ${isTransparent ? "border-white/50" : "border-border/50"}`}>
                      <AvatarImage src="" alt={user?.name || "User"} />
                      <AvatarFallback className={`${isTransparent ? "bg-white/20 text-white" : "bg-primary/10 text-primary"} text-xs font-medium`}>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin() && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-products" className="cursor-pointer w-full">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${isTransparent
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
              >
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            {/* Mobile Favorites */}
            <Link
              to="/favoritos"
              className={`relative flex items-center justify-center w-9 h-9 ${iconColorClass}`}
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Link>

            <Link
              to="/carrito"
              className={`relative flex items-center justify-center w-9 h-9 ${iconColorClass}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center rounded-md p-2 focus:outline-none ${mobileMenuButtonClass}`}
            >
              <span className="sr-only">Abrir menú</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background absolute top-full left-0 w-full shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${isActive(link.to)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border/40 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  {isAdmin() && (
                    <Link
                      to="/admin-products"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
