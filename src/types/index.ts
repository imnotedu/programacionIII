// Re-exportar tipos desde contexts o definir tipos globales
// Esto ayuda a AdminProduct.tsx que importa Product desde "@/types"

export type { Product } from '@/context/ProductContext';
export type { CartItem } from '@/context/CartContext';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}
