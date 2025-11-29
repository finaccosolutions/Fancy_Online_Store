// src/hooks/useSiteSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }

      if (data && Array.isArray(data)) {
        const settingsMap: Record<string, any> = {};
        data.forEach((setting: SiteSetting) => {
          // Store both snake_case (original) and camelCase versions for convenience
          settingsMap[setting.key] = setting.value;
          // Also add camelCase version
          const camelKey = setting.key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          settingsMap[camelKey] = setting.value;
        });
        setSettings(settingsMap);
      } else {
        setSettings({});
      }
    } catch (err: any) {
      console.error('Error fetching site settings:', err.message);
      setError(err.message);
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [authLoading, fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    if (!user || !isAdmin) return { data: null, error: new Error('Unauthorized') };
    try {
      const { data: existingSetting } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      let result;
      if (existingSetting) {
        result = await supabase
          .from('site_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
          .select();
      } else {
        result = await supabase
          .from('site_settings')
          .insert({ key, value })
          .select();
      }

      if (result.error) throw result.error;

      // Update both snake_case and camelCase versions in state
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      setSettings(prev => ({ ...prev, [key]: value, [camelKey]: value }));
      return { data: result.data, error: null };
    } catch (err: any) {
      console.error(`Error updating setting '${key}':`, err.message);
      return { data: null, error: err };
    }
  };

  const updateMultipleSettings = async (updates: Record<string, any>) => {
    if (!user || !isAdmin) return { data: null, error: new Error('Unauthorized') };

    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) => updateSetting(key, value))
    );

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return { data: null, error: errors[0].error };
    }

    return { data: results.map(r => r.data), error: null };
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    updateMultipleSettings,
  };
};
