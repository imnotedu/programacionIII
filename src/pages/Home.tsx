import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ShoppingBag, Truck, Shield, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";

const Home: React.FC = () => {
  const location = useLocation();
  const { products } = useProducts();
  const { isAuthenticated } = useAuth();
  const featuredProducts = products.slice(0, 8); // Show more popular products since we removed discounts

  // Scroll suave a secciones cuando se navega con hash
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const features = [
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "En pedidos mayores a $50",
    },
    {
      icon: Shield,
      title: "Productos Originales",
      description: "100% garantizados",
    },
    {
      icon: Clock,
      title: "Soporte 24/7",
      description: "Atención personalizada",
    },
    {
      icon: ShoppingBag,
      title: "Compra Segura",
      description: "Pago protegido",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-charcoal overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
            <div className="max-w-2xl">
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4 animate-fade-in">
                Suplementos deportivos premium
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
                Potencia tu
                <span className="text-primary"> rendimiento</span> al máximo
              </h1>
              <p className="text-white/70 text-lg md:text-xl mt-6 leading-relaxed animate-fade-in">
                Descubre nuestra selección de suplementos de alta calidad para alcanzar tus metas fitness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in">
                <Link to="/tienda" className="btn-hero inline-flex items-center justify-center gap-2">
                  Ver productos
                  <ArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-secondary inline-flex items-center justify-center">
                    Crear cuenta
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Products (Formerly Destacados/Featured) */}
        <section id="populares" className="py-16 md:py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Productos Populares</h2>
                <p className="text-muted-foreground mt-2">
                  Los favoritos de nuestros clientes
                </p>
              </div>
              <Link
                to="/tienda"
                className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                to="/tienda"
                className="btn-primary inline-flex items-center gap-2"
              >
                Ver todos los productos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Contacto/CTA Section - Combined/Simplified */}
        <section className="py-16 md:py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="section-title mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Únete a miles de atletas que confían en PowerFit para alcanzar sus objetivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tienda" className="btn-primary inline-flex items-center justify-center gap-2">
                Explorar tienda
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn-secondary inline-flex items-center justify-center">
                  Crear cuenta gratis
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
