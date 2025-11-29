// src/hooks/useSupabaseCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session, loading: authLoading, isAdmin } = useAuth();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure user is authenticated and is an admin before fetching
      if (!user || !isAdmin) {
        setError('Unauthorized access to categories.');
        setCategories([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err.message);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchCategories();
    } else if (!authLoading && (!user || !isAdmin)) {
      setCategories([]);
      setLoading(false);
      setError('Not authorized to view categories.');
    }
  }, [authLoading, user, isAdmin, fetchCategories]);

  const createCategory = async (name: string, imageUrl?: string, description?: string) => {
    if (!user || !isAdmin) return { data: null, error: new Error('Unauthorized') };
    try {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({
          name,
          image_url: imageUrl || '',
          description: description || ''
        })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchCategories();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating category:', err.message);
      return { data: null, error: err };
    }
  };

  const updateCategory = async (id: string, name: string, imageUrl?: string, description?: string) => {
    if (!user || !isAdmin) return { data: null, error: new Error('Unauthorized') };
    try {
      const { data, error: updateError } = await supabase
        .from('categories')
        .update({
          name,
          image_url: imageUrl || '',
          description: description || ''
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchCategories();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating category:', err.message);
      return { data: null, error: err };
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user || !isAdmin) return { error: new Error('Unauthorized') };
    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchCategories(); // Re-fetch to update state
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting category:', err.message);
      return { error: err };
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
