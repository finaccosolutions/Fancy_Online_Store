import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface WishlistItem {
  id: string; product_id: string; created_at: string; product: { id: string; name: string; price: number; image_url: string; category: string; category_name: string; };
}

export const useSupabaseWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isFetchingRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  const fetchWishlistItems = useCallback(async (force = false) => {
    if (!user?.id) {
      setWishlistItems([]);
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
        .from('wishlist_items')
        .select(`
            id,
            product_id,
            created_at,
            product:products (
              id,
              name,
              price,
              image_url,
              category,
              categories(name)
            )
          `)
          .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist items:', error.message);
        setWishlistItems([]);
      } else {
        const mappedData = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            category_name: item.product.categories.name
          }
        }));
        setWishlistItems(mappedData || []);
      }
    } catch (error: any) {
      console.error('Error fetching wishlist items (caught exception):', error.message);
      setWishlistItems([]);
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
      if (!initialLoadComplete || wishlistItems.length === 0) {
        fetchWishlistItems();
      }

      const channel = supabase
        .channel('wishlist_changes_' + user.id)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wishlist_items',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Wishlist change detected:', payload);
            fetchWishlistItems(true);
          }
        )
        .subscribe((status) => {
          console.log('Wishlist subscription status:', status);
        });

      subscriptionRef.current = channel;

      return () => {
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current);
          subscriptionRef.current = null;
        }
      };
    } else {
      setWishlistItems([]);
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.id, authLoading]);


  const addToWishlist = async (productId: string) => {
    if (!user) return { error: new Error('Please login to add items to wishlist') };

    try {
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        return { error: new Error('Product already in wishlist') };
      }

      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      await fetchWishlistItems(true);

      return { error: null };
    } catch (error: any) {
      console.error('Error adding to wishlist:', error.message);
      return { error };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWishlistItems(true);

      return { error: null };
    } catch (error: any) {
      console.error('Error removing from wishlist:', error.message);
      return { error };
    }
  };

  const getWishlistItemsCount = () => {
    return wishlistItems.length;
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const removeFromWishlistByProductId = async (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.product_id === productId);
    if (wishlistItem) {
      return await removeFromWishlist(wishlistItem.id);
    }
    return { error: new Error('Item not found in wishlist') };
  };

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    getWishlistItemsCount,
    isInWishlist,
    fetchWishlistItems,
  };
};
