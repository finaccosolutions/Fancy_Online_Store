import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Address {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_gst_registered?: boolean;
  gstin?: string;
  address_type?: 'delivery' | 'billing' | 'both';
  created_at: string;
  updated_at: string;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) {
      setAddresses([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching addresses:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          ...addressData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAddresses();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding address:', error.message);
      return { data: null, error };
    }
  };

  const updateAddress = async (addressId: string, addressData: Partial<Address>) => {
    if (!user) return { error: new Error('Please login') };

    try {
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAddresses();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating address:', error.message);
      return { data: null, error };
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAddresses();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting address:', error.message);
      return { error };
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return { error: new Error('Please login') };

    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAddresses();
      return { error: null };
    } catch (error: any) {
      console.error('Error setting default address:', error.message);
      return { error };
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.is_default) || addresses[0] || null;
  };

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    fetchAddresses
  };
};
