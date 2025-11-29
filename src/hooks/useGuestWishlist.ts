import { useState, useEffect } from 'react';

const WISHLIST_STORAGE_KEY = 'guest_wishlist';

export const useGuestWishlist = () => {
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      try {
        setGuestWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading guest wishlist:', e);
        setGuestWishlist([]);
      }
    }
  }, []);

  const saveToStorage = (items: string[]) => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    setGuestWishlist(items);
    window.dispatchEvent(new CustomEvent('guestWishlistUpdated', { detail: items }));
  };

  const addToGuestWishlist = (productId: string) => {
    if (!guestWishlist.includes(productId)) {
      saveToStorage([...guestWishlist, productId]);
      return { error: null };
    }
    return { error: new Error('Product already in wishlist') };
  };

  const removeFromGuestWishlist = (productId: string) => {
    saveToStorage(guestWishlist.filter(id => id !== productId));
  };

  const isInGuestWishlist = (productId: string) => {
    return guestWishlist.includes(productId);
  };

  const clearGuestWishlist = () => {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    setGuestWishlist([]);
  };

  const migrateToUserWishlist = async (userId: string, supabase: any) => {
    if (guestWishlist.length === 0) return;

    try {
      for (const productId of guestWishlist) {
        const { data: existing } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        if (!existing) {
          await supabase
            .from('wishlist_items')
            .insert({
              user_id: userId,
              product_id: productId,
            });
        }
      }

      clearGuestWishlist();
    } catch (error) {
      console.error('Error migrating guest wishlist:', error);
    }
  };

  return {
    guestWishlist,
    addToGuestWishlist,
    removeFromGuestWishlist,
    isInGuestWishlist,
    clearGuestWishlist,
    migrateToUserWishlist,
  };
};
