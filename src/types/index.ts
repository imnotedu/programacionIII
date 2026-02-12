export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageUrl?: string; // Backend field
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  level?: string;
  role?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}
