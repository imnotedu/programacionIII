import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface FavoritesContextType {
    favorites: string[];
    addToFavorites: (productId: string) => void;
    removeFromFavorites: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>(() => {
        // Load from local storage on initial render
        const savedFavorites = localStorage.getItem("favorites");
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });
    const { toast } = useToast();

    useEffect(() => {
        // Save to local storage whenever favorites change
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (productId: string) => {
        if (!favorites.includes(productId)) {
            setFavorites((prev) => [...prev, productId]);
            toast({
                title: "Añadido a favoritos",
                description: "El producto se ha guardado en tu lista de favoritos.",
            });
        }
    };

    const removeFromFavorites = (productId: string) => {
        setFavorites((prev) => prev.filter((id) => id !== productId));
        toast({
            title: "Eliminado de favoritos",
            description: "El producto se ha eliminado de tu lista.",
        });
    };

    const toggleFavorite = (productId: string) => {
        if (favorites.includes(productId)) {
            removeFromFavorites(productId);
        } else {
            addToFavorites(productId);
        }
    };

    const isFavorite = (productId: string) => {
        return favorites.includes(productId);
    };

    return (
        <FavoritesContext.Provider
            value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};
