import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-charcoal text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Power<span className="text-primary">Fit</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              Tu tienda de confianza para suplementos deportivos de alta calidad.
              Potencia tu rendimiento con los mejores productos.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/tienda" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Tienda
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-white/70 text-sm">Proteínas</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Pre-entreno</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Aminoácidos</span>
              </li>
              <li>
                <span className="text-white/70 text-sm">Vitaminas</span>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                info@powerfit.com
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                +58 412-4295661
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                Guarico, Venezuela
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-white/70 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>

            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-white/50 text-sm">
            © 2026 PowerFit. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
