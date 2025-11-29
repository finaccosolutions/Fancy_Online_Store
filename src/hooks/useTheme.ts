import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

export const useTheme = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;

      root.style.setProperty('--primary-bg-color', settings.primary_bg_color || '#0A8DB0');
      root.style.setProperty('--primary-text-color', settings.primary_text_color || '#ffffff');
      root.style.setProperty('--secondary-bg-color', settings.secondary_bg_color || '#f3f4f6');
      root.style.setProperty('--accent-color', settings.accent_color || '#D4AF37');
      root.style.setProperty('--button-primary-color', settings.button_primary_color || '#0A8DB0');
      root.style.setProperty('--button-hover-color', settings.button_hover_color || '#0891b2');
      root.style.setProperty('--border-color', settings.border_color || '#e5e7eb');
      root.style.setProperty('--footer-bg-color', settings.footer_bg_color || '#1e293b');
      root.style.setProperty('--header-bg-color', settings.header_bg_color || '#ffffff');
    }
  }, [settings]);
};
