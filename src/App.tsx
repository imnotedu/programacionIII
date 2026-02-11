import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import AdminProduct from "./pages/AdminProduct";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";

<AuthProvider>
  <ProductProvider>
    <FavoritesProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<Store />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-products" element={<ProtectedRoute requireAdmin><AdminProduct /></ProtectedRoute>} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </FavoritesProvider>
  </ProductProvider>
</AuthProvider>
  </QueryClientProvider >
);


