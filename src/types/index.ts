export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}
