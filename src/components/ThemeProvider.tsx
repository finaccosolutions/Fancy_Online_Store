import React, { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, loading } = useSiteSettings();

  useEffect(() => {
    if (!loading && settings) {
      const root = document.documentElement;

      // Apply color theme
      if (settings.primary_color) {
        root.style.setProperty('--color-primary', settings.primary_color);
      }
      if (settings.secondary_color) {
        root.style.setProperty('--color-secondary', settings.secondary_color);
      }

      // Apply font settings
      if (settings.font_family) {
        root.style.setProperty('--font-body', settings.font_family);
        // Load Google Font if it's a Google Font
        const fontName = settings.font_family.replace(/['"]/g, '').split(',')[0].trim();
        if (fontName && fontName !== 'system-ui' && fontName !== 'Arial' && fontName !== 'Helvetica' && !fontName.includes('sans-serif') && !fontName.includes('serif')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }
      }

      if (settings.heading_font_family) {
        root.style.setProperty('--font-heading', settings.heading_font_family);
        // Load Google Font if it's a Google Font
        const fontName = settings.heading_font_family.replace(/['"]/g, '').split(',')[0].trim();
        if (fontName && fontName !== 'system-ui' && fontName !== 'Arial' && fontName !== 'Helvetica' && !fontName.includes('sans-serif') && !fontName.includes('serif')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
          document.head.appendChild(link);
        }
      }

      if (settings.font_size) {
        root.style.setProperty('--font-size-base', settings.font_size);
      }
    }
  }, [settings, loading]);

  return <>{children}</>;
};

export default ThemeProvider;
