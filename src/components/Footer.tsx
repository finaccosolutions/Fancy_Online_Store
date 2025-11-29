import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const Footer: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {/* Company Info */}
          <div>
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name || 'Trendy Bazar'}
                className="h-12 w-auto mb-4 brightness-150"
              />
            ) : (
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-[#0A8DB0] to-[#D4AF37] p-2 rounded-lg">
                  <span className="text-white font-bold text-xl">TB</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{settings.site_name || 'Trendy Bazar'}</h3>
                  <p className="text-sm text-[#D4AF37] -mt-1">FASHION & STYLE</p>
                </div>
              </div>
            )}
            <p className="text-gray-300 mb-4">
              {settings.footerCompanyDescription || 'Discover premium fashion and accessories curated to match your unique style. Shop the latest trends at Trendy Bazar.'}
            </p>
            <div className="flex space-x-4">
              <a href={settings.footerSocialFacebook || '#'} className="text-yellow-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={settings.footerSocialInstagram || '#'} className="text-yellow-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={settings.footerSocialTwitter || '#'} className="text-yellow-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links and Customer Service - Combined on mobile */}
          <div className="sm:col-span-2 md:col-span-2 grid grid-cols-2 gap-4 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-400">Customer Service</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <li>
                  <Link to="/shipping" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-yellow-400">Contact Info</h4>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm">
                  {settings.contactAddressLine1 || 'India'}
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm">{settings.contactPhone1 || '+91 XXXXXXXXXX'}</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm break-all">{settings.contactEmail1 || 'info@trendybazar.com'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              {settings.footerCopyrightText || '© 2025 Trendy Bazar. All rights reserved.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
