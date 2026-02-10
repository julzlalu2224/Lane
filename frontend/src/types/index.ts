export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId: string;
  supplierId: string;
  category?: Category;
  supplier?: Supplier;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  cost: number;
  subtotal: number;
  profit: number;
  product?: Product;
}

export interface Sale {
  id: string;
  total: number;
  profit: number;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  daily: {
    revenue: number;
    profit: number;
    sales: number;
  };
  monthly: {
    revenue: number;
    profit: number;
    sales: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
  };
  bestSelling: Array<{
    product: Product;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentSales: Sale[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateSaleRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
