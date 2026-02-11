import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { useFavorites } from "@/context/FavoritesContext";

const Favorites: React.FC = () => {
    const { products } = useProducts();
    const { favorites } = useFavorites();

    // Filter products that are in the favorites list
    const favoriteProducts = products.filter((product) =>
        favorites.includes(product.id)
    );

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-28 md:pb-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                            Mis Favoritos
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {favoriteProducts.length} {favoriteProducts.length === 1 ? "producto guardado" : "productos guardados"}
                        </p>
                    </div>

                    <Link to="/tienda" className="btn-secondary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Seguir comprando
                    </Link>
                </div>

                {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favoriteProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">No tienes favoritos aún</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                            Guarda los productos que más te gusten haciendo clic en el corazón para encontrarlos fácilmente después.
                        </p>
                        <Link to="/tienda" className="btn-primary inline-flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Explorar productos
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Favorites;
