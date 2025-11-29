const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veloratradings.com/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class HostingerClient {
  private token: string | null = null;

  constructor() {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('hostinger_auth_token');
    }
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('hostinger_auth_token', token);
  }

  private removeToken() {
    this.token = null;
    localStorage.removeItem('hostinger_auth_token');
  }

  private getHeaders(includeAuth = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const options: RequestInit = {
        method,
        headers: this.getHeaders(includeAuth),
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }

        return {
          error: error.error || `Request failed with status ${response.status}`,
        };
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request error:', error);
      return {
        error: error.message || 'An error occurred',
      };
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getAuthHeader() {
    return this.token ? `Bearer ${this.token}` : null;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public async signup(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<ApiResponse<{ user: User; session: Session }>> {
    const response = await this.request<{ user: User; session: Session }>(
      '/auth/signup.php',
      'POST',
      { email, password, full_name: fullName, phone },
      false
    );

    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }

    return response;
  }

  public async signin(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; session: Session }>> {
    const response = await this.request<{ user: User; session: Session }>(
      '/auth/signin.php',
      'POST',
      { email, password },
      false
    );

    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
    }

    return response;
  }

  public logout() {
    this.removeToken();
  }

  public async getUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/get-user.php', 'GET');
  }

  public async updateProfile(updates: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/update-profile.php', 'PUT', updates);
  }

  public async getProducts(): Promise<ApiResponse<{ products: any[]; total: number }>> {
    return this.request('/products/list.php', 'GET', undefined, false);
  }

  public async getProduct(id: string): Promise<ApiResponse<{ product: any }>> {
    return this.request(`/products/get.php?id=${id}`, 'GET', undefined, false);
  }

  public async getCategories(): Promise<ApiResponse<{ categories: any[]; total: number }>> {
    return this.request('/products/categories.php', 'GET', undefined, false);
  }

  public async getCart(): Promise<ApiResponse<{ cart_items: any[]; total: number }>> {
    return this.request('/cart/get.php', 'GET');
  }

  public async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<any>> {
    return this.request('/cart/add.php', 'POST', { product_id: productId, quantity });
  }

  public async updateCartItem(cartItemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.request('/cart/update.php', 'PUT', { cart_item_id: cartItemId, quantity });
  }

  public async removeFromCart(cartItemId: string): Promise<ApiResponse<any>> {
    return this.request('/cart/remove.php', 'DELETE', { cart_item_id: cartItemId });
  }

  public async clearCart(): Promise<ApiResponse<any>> {
    return this.request('/cart/clear.php', 'DELETE');
  }

  public async getWishlist(): Promise<ApiResponse<{ wishlist_items: any[]; total: number }>> {
    return this.request('/wishlist/get.php', 'GET');
  }

  public async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.request('/wishlist/add.php', 'POST', { product_id: productId });
  }

  public async removeFromWishlist(wishlistItemId: string): Promise<ApiResponse<any>> {
    return this.request('/wishlist/remove.php', 'DELETE', { wishlist_item_id: wishlistItemId });
  }

  public async getAddresses(): Promise<ApiResponse<{ addresses: any[]; total: number }>> {
    return this.request('/addresses/list.php', 'GET');
  }

  public async createAddress(addressData: any): Promise<ApiResponse<{ address: any }>> {
    return this.request('/addresses/create.php', 'POST', addressData);
  }

  public async updateAddress(addressData: any): Promise<ApiResponse<any>> {
    return this.request('/addresses/update.php', 'PUT', addressData);
  }

  public async deleteAddress(id: string): Promise<ApiResponse<any>> {
    return this.request(`/addresses/delete.php?id=${id}`, 'DELETE');
  }

  public async getOrders(): Promise<ApiResponse<{ orders: any[]; total: number }>> {
    return this.request('/orders/list.php', 'GET');
  }

  public async getOrder(id: string): Promise<ApiResponse<{ order: any; items: any[] }>> {
    return this.request(`/orders/get.php?id=${id}`, 'GET');
  }

  public async createOrder(orderData: any): Promise<ApiResponse<{ order: any }>> {
    return this.request('/orders/create.php', 'POST', orderData);
  }

  public async createRazorpayOrder(amount: number, orderId: string): Promise<ApiResponse<any>> {
    return this.request('/payment/create-razorpay-order.php', 'POST', { amount, order_id: orderId });
  }

  public async verifyRazorpayPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    orderId: string
  ): Promise<ApiResponse<{ order: any }>> {
    return this.request('/payment/verify-razorpay-payment.php', 'POST', {
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
      order_id: orderId,
    });
  }

  public async getSettings(): Promise<ApiResponse<{ settings: any }>> {
    return this.request('/settings/get.php', 'GET', undefined, false);
  }
}

export const hostingerClient = new HostingerClient();
