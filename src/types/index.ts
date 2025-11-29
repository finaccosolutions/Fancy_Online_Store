export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: string;
  category_name?: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  features: string[];
  ingredients?: string[];
  stockQuantity?: number;
  gst_percentage?: number;
  hsn_code?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  shipping_charges?: number;
  discount_amount?: number;
  customer_state?: string;
  invoice_number?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  createdAt: Date;
}

export interface TaxBreakdown {
  subtotal: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
