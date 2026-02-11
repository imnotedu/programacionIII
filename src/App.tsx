import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminProduct from "./pages/AdminProduct";
import ProductDetail from "./pages/ProductDetail";
import AccessDenied from "./pages/AccessDenied";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tienda" element={<Store />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-products" element={<ProtectedRoute requireAdmin><AdminProduct /></ProtectedRoute>} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </ProductProvider>
    </AuthProvider>
  </QueryClientProvider>
);


