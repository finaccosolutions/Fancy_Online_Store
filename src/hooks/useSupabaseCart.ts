import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  id: string; product_id: string; quantity: number; product: { id: string; name: string; price: number; original_price?: number | null; image_url: string; category: string; category_name: string; in_stock: boolean; };
}

export const useSupabaseCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isFetchingRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  const fetchCartItems = useCallback(async (force = false) => {
    if (!user?.id) {
      setCartItems([]);
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    if (!force && isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    if (!initialLoadComplete) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
            id,
            product_id,
            quantity,
            product:products (
              id,
              name,
              price,
              original_price,
              image_url,
              category,
              in_stock,
              categories(name)
            )
          `)
          .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error.message);
        setCartItems([]);
      } else {
        const mappedData = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            category_name: item.product.categories.name
          }
        }));
        setCartItems(mappedData || []);
      }
    } catch (error: any) {
      console.error('Error fetching cart items (caught exception):', error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
      isFetchingRef.current = false;
    }
  }, [user?.id, initialLoadComplete]);

useEffect(() => {
  if (subscriptionRef.current) {
    supabase.removeChannel(subscriptionRef.current);
    subscriptionRef.current = null;
  }

  if (!authLoading) {
    if (user) {
      // Only fetch if this is a new user login, not a token refresh
      if (!initialLoadComplete || cartItems.length === 0) {
        fetchCartItems();
      }

      const channel = supabase
        .channel('cart_changes_' + user.id)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Cart change detected:', payload);
            fetchCartItems(true);
          }
        )
        .subscribe((status) => {
          console.log('Cart subscription status:', status);
        });

      subscriptionRef.current = channel;

      return () => {
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }
      };
    } else {
      setCartItems([]);
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.id, authLoading]);


  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return { error: new Error('Please login to add items to cart') };

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: quantity,
          });

        if (error) throw error;
      }

      await fetchCartItems(true);

      return { error: null };
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      return { error };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }

      setCartItems(prev =>
        prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) {
        await fetchCartItems(true);
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error updating quantity:', error.message);
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) {
        await fetchCartItems(true);
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removing from cart:', error.message);
      return { error };
    }
  };

  const clearCart = async () => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      return { error: null };
    } catch (error: any) {
      console.error('Error clearing cart:', error.message);
      return { error };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCartItems,
  };
};
