import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

// Definir tipos ampliados para soportar AdminProduct
export interface Product {
    id: string;
    name: string;
    code: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;

    // Alias y campos adicionales para compatibilidad con AdminProduct
    image?: string;
    isNew?: boolean;
    isSale?: boolean;
    originalPrice?: number;

    stock: number;
    createdAt: string;
    updatedAt: string;
}

interface ProductContextType {
    products: Product[];
    loading: boolean;
    error: string | null;
    getProductByCode: (code: string) => Promise<Product | null>;
    getProductById: (id: string) => Promise<Product | null>;
    refreshProducts: () => Promise<void>;
    createProduct: (data: any) => Promise<void>;
    addProduct: (data: any) => Promise<void>; // Alias para createProduct
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

    // Función auxiliar para mapear datos de DB/API a formato consistente
    const mapProduct = (p: any): Product => ({
        ...p,
        image: p.imageUrl || p.image, // Asegurar que image exista si viene imageUrl
        imageUrl: p.imageUrl || p.image // Asegurar que imageUrl exista si viene image
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/products');
            if (response.data.success) {
                const mappedProducts = response.data.data.products.map(mapProduct);
                setProducts(mappedProducts);
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
            const response = await axios.get(`http://localhost:5000/api/products/code/${code}`);
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
            const response = await axios.get(`http://localhost:5000/api/products/${id}`);
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
            // Adaptar campos si vienen con nombres diferentes
            const payload = {
                ...data,
                imageUrl: data.image || data.imageUrl,
                code: data.code || `PROD-${Date.now()}` // Generar código temporal si no viene
            };

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/products', payload, {
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

    const updateProduct = async (id: string, data: any) => {
        try {
            const payload = {
                ...data,
                imageUrl: data.image || data.imageUrl
            };

            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/products/${id}`, payload, {
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
            createProduct,
            addProduct: createProduct, // Alias
            updateProduct,
            deleteProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};
