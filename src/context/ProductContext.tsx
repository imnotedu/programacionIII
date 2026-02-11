import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Product } from '@/types';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: string | null;
    getProductByCode: (code: string) => Promise<Product | null>;
    getProductById: (id: string) => Promise<Product | null>;
    refreshProducts: () => Promise<void>;
    addProduct: (data: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
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

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/products');
            if (response.data.success) {
                setProducts(response.data.data.products);
                setError(null);
            }
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError(err.response?.data?.message || "Error al cargar productos");
            // No mostrar toast aquí para no spammear al inicio
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getProductByCode = async (code: string): Promise<Product | null> => {
        try {
            const response = await axios.get(`http://localhost:5000/api/products/code/${code}`);
            if (response.data.success) {
                return response.data.data.product;
            }
            return null;
        } catch (error) {
            console.error("Error getting product by code:", error);
            return null;
        }
    };

    const getProductById = async (id: string): Promise<Product | null> => {
        try {
            const response = await axios.get(`http://localhost:5000/api/products/${id}`);
            if (response.data.success) {
                return response.data.data.product;
            }
            return null;
        } catch (error) {
            console.error("Error getting product by id:", error);
            return null;
        }
    }

    const createProduct = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/products', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    const addProduct = async (data: Omit<Product, 'id'>) => {
        // Crear un producto localmente (sin backend)
        const newProduct: Product = {
            id: Date.now().toString(),
            ...data
        };
        setProducts(prev => [...prev, newProduct]);
        toast({ title: "Éxito", description: "Producto agregado correctamente" });
    };

    const updateProduct = async (id: string, data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/products/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            addProduct,
            updateProduct,
            deleteProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};
