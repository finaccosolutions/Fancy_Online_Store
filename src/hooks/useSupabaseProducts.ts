// src/hooks/useSupabaseProducts.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Product as ProductType } from '../types';

// Define the structure of a product as returned from Supabase, including category name
interface SupabaseProduct extends Omit<ProductType, 'category' | 'reviews' | 'inStock' | 'stockQuantity'> {
  category: string;
  category_name: string;
  reviews_count: number;
  in_stock: boolean;
  stock_quantity: number; // NEW: Add stock_quantity
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth(); // Removed isVisible
  const isFetchingRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('fetchProducts: Starting fetch...');

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          image_url,
          category,
          in_stock,
          rating,
          reviews_count,
          features,
          ingredients,
          created_at,
          updated_at,
          stock_quantity,
          gst_percentage,
          hsn_code,
          price_inclusive_of_tax,
          default_delivery_days,
          categories!inner(name)
        `)
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const mappedProducts: SupabaseProduct[] = data.map((p: any) => ({
        ...p,
        category_name: p.categories.name,
        category: p.category,
        stockQuantity: p.stock_quantity, // Map stock_quantity to stockQuantity for frontend ProductType
      }));

      setProducts(mappedProducts || []);
      console.log('fetchProducts: Successfully set products state.');

    } catch (e: any) {
      console.error('fetchProducts: Error fetching products:', e.message);
      setError(e.message);
      setProducts([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const fetchCategoriesForFilter = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }
      const uniqueCategories = [...new Set(data?.map((item: any) => item.name) || [])];
      setCategories(['All', ...uniqueCategories]);
    } catch (error: any) {
      console.error('fetchCategoriesForFilter: Error fetching categories:', error.message);
      setCategories(['All']);
    }
  }, []);

    useEffect(() => {
      console.log('useSupabaseProducts useEffect: user:', user);
    
      let isMounted = true;
    
      const executeFetch = async () => {
        if (!isMounted || isFetchingRef.current) return;
    
        isFetchingRef.current = true;
        console.log('useSupabaseProducts: Starting fetch operations...');
    
        try {
          await fetchProducts();
          await fetchCategoriesForFilter();
        } catch (error) {
          console.error('useSupabaseProducts: Error during fetch operations:', error);
        } finally {
          if (isMounted) {
            isFetchingRef.current = false;
            console.log('useSupabaseProducts: Fetch operations completed');
          }
        }
      };
    
      // Only fetch on initial mount, not when session changes
      if (!isFetchingRef.current) {
        console.log('useSupabaseProducts: Executing fetch.');
        executeFetch();
      }
    
      return () => {
        isMounted = false;
      };
    }, [fetchProducts, fetchCategoriesForFilter]); // Removed user and session from dependencies


  const getProductById = async (id: string) => {
    console.log(`getProductById: Attempting to fetch product with ID: ${id}`);
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            original_price,
            image_url,
            category,
            in_stock,
            rating,
            reviews_count,
            features,
            ingredients,
            created_at,
            updated_at,
            stock_quantity,
            gst_percentage,
            hsn_code,
            price_inclusive_of_tax,
            default_delivery_days,
            categories!inner(name)
          `)
          .eq('id', id)
          .single(),
        new Promise((_, reject) =>
          // MODIFIED: Increased timeout duration to 30 seconds
          setTimeout(() => reject(new Error(`Product ${id} fetch timed out after 30 seconds`)), 30000) 
        )
      ]);

      if (error) {
        console.error(`getProductById: Supabase query error for product ${id}:`, error);
        throw error;
      }

      if (!data) {
        console.warn(`getProductById: No data returned for product ${id}.`);
        return { data: null, error: new Error(`Product ${id} not found.`) };
      }

      const mappedProduct: SupabaseProduct = {
        ...data,
        category_name: data.categories.name,
        category: data.category,
        stockQuantity: data.stock_quantity, // Map stock_quantity to stockQuantity
      };
      console.log(`getProductById: Successfully fetched and mapped product ${id}:`, mappedProduct);
      return { data: mappedProduct, error: null };
    } catch (error: any) {
      console.error('getProductById: Caught unexpected exception:', error.message);
      return { data: null, error };
    }
  };

  interface ProductInsertUpdate {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    image_url: string;
    category: string;
    in_stock?: boolean;
    rating?: number;
    reviews_count?: number;
    features?: string[];
    ingredients?: string[] | null;
    stock_quantity?: number;
    gst_percentage?: number;
    hsn_code?: string;
    price_inclusive_of_tax?: boolean;
    default_delivery_days?: number;
  }

  const createProduct = async (product: ProductInsertUpdate) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategoriesForFilter();

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductInsertUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      await fetchCategoriesForFilter();

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating product:', error.message);
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      await fetchCategoriesForFilter();

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      return { error };
    }
  };

  return {
    products,
    loading,
    error,
    categories,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

