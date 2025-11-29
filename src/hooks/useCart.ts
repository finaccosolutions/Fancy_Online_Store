import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCart } from './useSupabaseCart';
import { useGuestCart } from './useGuestCart';
import { useSupabaseProducts } from './useSupabaseProducts';
import { supabase } from '../lib/supabase';

export const useCart = () => {
  const { user } = useAuth();
  const supabaseCart = useSupabaseCart();
  const guestCartHook = useGuestCart();
  const { products } = useSupabaseProducts();
  const [guestCartVersion, setGuestCartVersion] = useState(0);

  // Always create guest cart items (memoized) - must be before conditional return
  const guestCartItems = useMemo(() =>
    guestCartHook.guestCart
      .map(item => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) return null;
        return {
          id: item.product_id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image_url: product.image_url,
            category: product.category,
            category_name: product.category_name,
            in_stock: product.in_stock,
          },
        };
      })
      .filter(item => item !== null),
    [guestCartHook.guestCart, products, guestCartVersion]
  );

  useEffect(() => {
    if (user && guestCartHook.guestCart.length > 0) {
      guestCartHook.migrateToUserCart(user.id, supabase);
    }
  }, [user]);

  useEffect(() => {
    const handleGuestCartUpdate = () => {
      setGuestCartVersion(v => v + 1);
    };

    window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
    return () => {
      window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
    };
  }, []);

  if (user) {
    return {
      cartItems: supabaseCart.cartItems,
      loading: supabaseCart.loading,
      addToCart: supabaseCart.addToCart,
      removeFromCart: supabaseCart.removeFromCart,
      updateQuantity: supabaseCart.updateQuantity,
      clearCart: supabaseCart.clearCart,
      getCartTotal: supabaseCart.getCartTotal,
      getCartItemsCount: supabaseCart.getCartItemsCount,
      fetchCartItems: supabaseCart.fetchCartItems,
    };
  }

  return {
    cartItems: guestCartItems,
    loading: false,
    addToCart: async (productId: string, quantity: number = 1) => {
      guestCartHook.addToGuestCart(productId, quantity);
      return { error: null };
    },
    removeFromCart: async (cartItemId: string) => {
      guestCartHook.removeFromGuestCart(cartItemId);
      return { error: null };
    },
    updateQuantity: async (cartItemId: string, quantity: number) => {
      guestCartHook.updateGuestCartQuantity(cartItemId, quantity);
      return { error: null };
    },
    clearCart: async () => {
      guestCartHook.clearGuestCart();
      return { error: null };
    },
    getCartTotal: () => {
      return guestCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    },
    getCartItemsCount: () => {
      return guestCartHook.getGuestCartCount();
    },
    fetchCartItems: async () => {},
  };
};