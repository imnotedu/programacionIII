import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Cargar carrito del backend cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setItems([]);
      setTotalPrice(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setItems(response.data.data.items);
        setTotalPrice(response.data.data.total);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/cart/items', {
        productId: product.id,
        quantity
      });

      if (response.data.success) {
        toast({
          title: "Agregado",
          description: "Producto agregado al carrito",
        });
        await fetchCart(); // Recargar para obtener el estado actualizado
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al agregar al carrito";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.delete(`/cart/items/${productId}`);
      if (response.data.success) {
        toast({
          title: "Eliminado",
          description: "Producto eliminado del carrito",
        });
        await fetchCart();
      }
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      // Optimistic update (opcional, pero por ahora simple: loading)
      // setLoading(true); // Puede ser molesto si actualiza cada click, mejor debounce o silent update.
      // Haremos update directo y si falla revertimos o mostramos error.

      const response = await api.put(`/cart/items/${productId}`, {
        quantity
      });

      if (response.data.success) {
        await fetchCart();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al actualizar cantidad";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.delete('/cart');
      if (response.data.success) {
        setItems([]);
        setTotalPrice(0);
        toast({
          title: "Carrito vaciado",
          description: "Se han eliminado todos los productos",
        });
      }
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
