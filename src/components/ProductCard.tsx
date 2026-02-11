import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { toast } from "@/hooks/use-toast";
import { getProductImage } from "@/utils/productHelpers";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // El error ya se maneja en el CartContext
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const isFav = isFavorite(product.id);

  return (
    <Link
      to={`/producto/${product.id}`}
      className="card-product bg-card group block cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <span className="badge-new">Nuevo</span>}
          {product.isSale && <span className="badge-sale">Oferta</span>}
        </div>

        {/* Action Buttons Container */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 
              ${isFav
                ? "bg-red-500 text-white"
                : "bg-background/80 text-foreground hover:bg-background hover:scale-110"
              }`}
          >
            <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
            <span className="sr-only">Añadir a favoritos</span>
          </button>
        </div>

        {/* Quick Add Button - Mobile visible, Desktop on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-primary text-primary-foreground rounded-full 
                     flex items-center justify-center shadow-lg transition-all duration-300
                     md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                     hover:scale-110 active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-primary font-medium uppercase tracking-wide">
          {product.category}
        </span>

        <h3 className="font-semibold text-foreground mt-1 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Desktop Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="hidden md:flex w-full mt-4 btn-primary justify-center items-center gap-2 py-2.5"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar al carrito
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
