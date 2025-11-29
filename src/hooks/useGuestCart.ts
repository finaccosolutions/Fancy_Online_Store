import { useState, useEffect } from 'react';

interface GuestCartItem {
  product_id: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'guest_cart';

export const useGuestCart = () => {
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setGuestCart(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading guest cart:', e);
        setGuestCart([]);
      }
    }
  }, []);

  const saveToStorage = (items: GuestCartItem[]) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    setGuestCart(items);
    window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: items }));
  };

  const addToGuestCart = (productId: string, quantity: number = 1) => {
    const existingIndex = guestCart.findIndex(item => item.product_id === productId);

    if (existingIndex >= 0) {
      const updated = [...guestCart];
      updated[existingIndex].quantity += quantity;
      saveToStorage(updated);
    } else {
      saveToStorage([...guestCart, { product_id: productId, quantity }]);
    }
  };

  const updateGuestCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromGuestCart(productId);
      return;
    }

    const updated = guestCart.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    );
    saveToStorage(updated);
  };

  const removeFromGuestCart = (productId: string) => {
    saveToStorage(guestCart.filter(item => item.product_id !== productId));
  };

  const clearGuestCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setGuestCart([]);
  };

  const getGuestCartCount = () => {
    return guestCart.reduce((total, item) => total + item.quantity, 0);
  };

  const migrateToUserCart = async (userId: string, supabase: any) => {
    if (guestCart.length === 0) return;

    try {
      for (const item of guestCart) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: item.product_id,
              quantity: item.quantity,
            });
        }
      }

      clearGuestCart();
    } catch (error) {
      console.error('Error migrating guest cart:', error);
    }
  };

  return {
    guestCart,
    addToGuestCart,
    updateGuestCartQuantity,
    removeFromGuestCart,
    clearGuestCart,
    getGuestCartCount,
    migrateToUserCart,
  };
};
