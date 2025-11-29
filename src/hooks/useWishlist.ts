import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseWishlist } from './useSupabaseWishlist';
import { useGuestWishlist } from './useGuestWishlist';
import { useSupabaseProducts } from './useSupabaseProducts';
import { supabase } from '../lib/supabase';

export const useWishlist = () => {
  const { user } = useAuth();
  const supabaseWishlist = useSupabaseWishlist();
  const guestWishlistHook = useGuestWishlist();
  const { products } = useSupabaseProducts();
  const [guestWishlistVersion, setGuestWishlistVersion] = useState(0);

  // Always create guest wishlist items (memoized)
  const guestWishlistItems = useMemo(() =>
    guestWishlistHook.guestWishlist
      .map(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;
        return {
          id: productId,
          product_id: productId,
          created_at: new Date().toISOString(),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            category_name: product.category_name,
          },
        };
      })
      .filter(item => item !== null),
    [guestWishlistHook.guestWishlist, products, guestWishlistVersion]
  );

  useEffect(() => {
    if (user && guestWishlistHook.guestWishlist.length > 0) {
      guestWishlistHook.migrateToUserWishlist(user.id, supabase);
    }
  }, [user]);

  useEffect(() => {
    const handleGuestWishlistUpdate = () => {
      setGuestWishlistVersion(v => v + 1);
    };

    window.addEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
    return () => {
      window.removeEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
    };
  }, []);

  // Return appropriate wishlist based on user state
  if (user) {
    return {
      wishlistItems: supabaseWishlist.wishlistItems,
      loading: supabaseWishlist.loading,
      addToWishlist: supabaseWishlist.addToWishlist,
      removeFromWishlist: supabaseWishlist.removeFromWishlist,
      removeFromWishlistByProductId: supabaseWishlist.removeFromWishlistByProductId,
      getWishlistItemsCount: supabaseWishlist.getWishlistItemsCount,
      isInWishlist: supabaseWishlist.isInWishlist,
      fetchWishlistItems: supabaseWishlist.fetchWishlistItems,
    };
  }

  return {
    wishlistItems: guestWishlistItems,
    loading: false,
    addToWishlist: async (productId: string) => {
      return guestWishlistHook.addToGuestWishlist(productId);
    },
    removeFromWishlist: async (wishlistItemId: string) => {
      guestWishlistHook.removeFromGuestWishlist(wishlistItemId);
      return { error: null };
    },
    removeFromWishlistByProductId: async (productId: string) => {
      guestWishlistHook.removeFromGuestWishlist(productId);
      return { error: null };
    },
    getWishlistItemsCount: () => {
      return guestWishlistHook.guestWishlist.length;
    },
    isInWishlist: (productId: string) => {
      return guestWishlistHook.isInGuestWishlist(productId);
    },
    fetchWishlistItems: async () => {},
  };
};
