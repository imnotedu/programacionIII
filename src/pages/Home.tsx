import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ShoppingBag, Truck, Shield, Clock, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";

const Home: React.FC = () => {
  const location = useLocation();
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);
  const saleProducts = products.filter((product) => product.isSale);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Función para desplazar el carrusel manualmente
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200; // píxeles a desplazar
      const currentScroll = carouselRef.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;
      carouselRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

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

  const brands = [
    {
      name: "Optimum Nutrition",
      logo: "https://cdn.shopify.com/s/files/1/0052/1298/7782/files/ON_Logo_Gold_Std_RGB.png?v=1613587891"
    },
    {
      name: "MuscleTech",
      logo: "https://www.muscletech.com/cdn/shop/files/mtech-logo-white_1.png?v=1718649844"
    },
    {
      name: "BSN",
      logo: "https://www.bsnonline.com/cdn/shop/files/BSN_Primary_Logo_360x.png?v=1668550696"
    },
    {
      name: "Dymatize",
      logo: "https://www.dymatize.com/cdn/shop/files/Dymatize_Logo_rgb-01.png?v=1614350966"
    },
    {
      name: "MyProtein",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Myprotein_logo.svg/2560px-Myprotein_logo.svg.png"
    },
    {
      name: "Universal Nutrition",
      logo: "https://www.universalnutrition.com/cdn/shop/files/UN_Logo_2020.png?v=1613705917"
    },
    {
      name: "MuscleMeds",
      logo: "https://musclemeds.com/cdn/shop/files/MuscleMeds-Logo-White.png?v=1614353849"
    },
    {
      name: "Cellucor",
      logo: "https://www.cellucor.com/cdn/shop/files/cellucor-logo.png?v=1614353849"
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
                <Link to="/register" className="btn-secondary inline-flex items-center justify-center">
                  Crear cuenta
                </Link>
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

        {/* Destacados Section */}
        <section id="destacados" className="py-16 md:py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title justify-center text-center">Productos Destacados</h2>
                <p className="text-muted-foreground mt-2 text-center justify-center">
                  Las mejores ofertas y promociones
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

            {saleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {saleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

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

        {/* Marcas Section */}
        <section id="marcas" className="py-16 md:py-20 bg-muted scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="section-title">Nuestras Marcas</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Trabajamos con las mejores marcas de suplementos deportivos del mundo
              </p>
            </div>

            {/* Carousel with Navigation */}
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 -ml-2 md:-ml-6"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 -mr-2 md:-mr-6"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Carousel Container */}
              <div
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth px-8"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div
                  className={`flex gap-6 py-4 ${!isPaused ? 'animate-carousel' : ''}`}
                  style={{ width: 'fit-content' }}
                >
                  {/* Marcas con logos */}
                  {[...brands, ...brands].map((brand, index) => (
                    <div
                      key={`brand-${index}`}
                      className="flex-shrink-0 w-44 md:w-52 bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center hover:border-primary/50 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    >
                      <div className="w-full h-20 flex items-center justify-center mb-4 bg-white rounded-lg p-3">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const initials = brand.name.split(' ').map(w => w[0]).join('');
                            target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-primary">${initials}</span>`;
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground text-center">
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-20">
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

        {/* Contacto Section */}
        {/* <section id="contacto" className="py-16 md:py-20 bg-charcoal text-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  ¿Tienes preguntas?
                  <span className="text-primary"> Contáctanos</span>
                </h2>
                <p className="text-white/70 mb-8">
                  Estamos aquí para ayudarte. Ponte en contacto con nosotros y te responderemos lo antes posible.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Email</p>
                      <p className="font-medium">info@powerfit.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Teléfono</p>
                      <p className="font-medium">+1 234 567 890</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Ubicación</p>
                      <p className="font-medium">Ciudad, País</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold mb-6">Envíanos un mensaje</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Nombre</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Mensaje</label>
                    <textarea
                      rows={4}
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                    onClick={(e) => e.preventDefault()}
                  >
                    Enviar mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
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
              <Link to="/register" className="btn-secondary inline-flex items-center justify-center">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

