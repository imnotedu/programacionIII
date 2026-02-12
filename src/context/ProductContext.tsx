import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

import { Product } from "@/types";

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: string | null;
    getProductByCode: (code: string) => Promise<Product | null>;
    getProductById: (id: string) => Promise<Product | null>;
    refreshProducts: () => Promise<void>;
    createProduct: (data: any) => Promise<void>;
    addProduct: (data: any) => Promise<void>; // Alias
    updateProduct: (id: string, data: any) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};

interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const mapProduct = (p: any): Product => ({
        ...p,
        image: p.imageUrl || p.image || '/placeholder.png',
        imageUrl: p.imageUrl || p.image || '/placeholder.png',
        price: Number(p.price),
        stock: Number(p.stock)
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            if (response.data.success) {
                const mapped = response.data.data.products.map(mapProduct);
                setProducts(mapped);
                setError(null);
            }
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError(err.response?.data?.message || "Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getProductByCode = async (code: string): Promise<Product | null> => {
        try {
            const response = await api.get(`/products/code/${code}`);
            if (response.data.success) {
                return mapProduct(response.data.data.product);
            }
            return null;
        } catch (error) {
            console.error("Error getting product by code:", error);
            return null;
        }
    };

    const getProductById = async (id: string): Promise<Product | null> => {
        try {
            const response = await api.get(`/products/${id}`);
            if (response.data.success) {
                return mapProduct(response.data.data.product);
            }
            return null;
        } catch (error) {
            console.error("Error getting product by id:", error);
            return null;
        }
    }

    const createProduct = async (data: any) => {
        try {
            const payload = {
                ...data,
                imageUrl: data.image || data.imageUrl,
                code: data.code || `PROD-${Date.now()}`
            };

            const response = await api.post('/products', payload);
            if (response.data.success) {
                toast({ title: "Éxito", description: "Producto creado correctamente" });
                await fetchProducts();
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al crear producto";
            toast({ title: "Error", description: msg, variant: "destructive" });
            throw err;
        }
    };

    const updateProduct = async (id: string, data: any) => {
        try {
            const payload = {
                ...data,
                imageUrl: data.image || data.imageUrl
            };

            const response = await api.put(`/products/${id}`, payload);
            if (response.data.success) {
                toast({ title: "Éxito", description: "Producto actualizado correctamente" });
                await fetchProducts();
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al actualizar producto";
            toast({ title: "Error", description: msg, variant: "destructive" });
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const response = await api.delete(`/products/${id}`);
            if (response.data.success) {
                toast({ title: "Éxito", description: "Producto eliminado correctamente" });
                await fetchProducts();
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Error al eliminar producto";
            toast({ title: "Error", description: msg, variant: "destructive" });
            throw err;
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            error,
            getProductByCode,
            getProductById,
            refreshProducts: fetchProducts,
            createProduct,
            addProduct: createProduct,
            updateProduct,
            deleteProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};
