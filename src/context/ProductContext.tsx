import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";
import { products as initialProducts } from "@/data/products";

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id">) => void;
    updateProduct: (id: string, product: Omit<Product, "id">) => void;
    deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 1. Inicializamos el estado buscando en localStorage primero
    const [products, setProducts] = useState<Product[]>(() => {
        try {
            const storedProducts = localStorage.getItem("products");
            // Si hay datos guardados, los usamos. Si no, usamos los de products.ts
            return storedProducts ? JSON.parse(storedProducts) : initialProducts;
        } catch {
            // Si hay error al parsear, usamos los productos por defecto
            return initialProducts;
        }
    });

    // 2. Cada vez que 'products' cambie, actualizamos el localStorage
    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);

    const addProduct = (newProductData: Omit<Product, "id">) => {
        const newProduct: Product = {
            ...newProductData,
            id: Date.now().toString(), // Generamos ID único basado en la fecha
        };
        setProducts((prev) => [newProduct, ...prev]); // Agregamos al principio
    };

    const updateProduct = (id: string, updatedProductData: Omit<Product, "id">) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === id ? { ...updatedProductData, id } : product
            )
        );
    };

    const deleteProduct = (id: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error("useProducts debe usarse dentro de un ProductProvider");
    }
    return context;
};
