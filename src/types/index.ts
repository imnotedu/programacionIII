// Product types (compatible con backend)
export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
  // Campos opcionales para compatibilidad con frontend antiguo
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Auth types - re-exported from auth.ts for convenience
export type {
  User,
  UserLevel,
  RegisteredUser,
  AuthToken,
  LoginCredentials,
  RegisterData,
  AuthContextType,
  AuthFormData
} from './auth';
