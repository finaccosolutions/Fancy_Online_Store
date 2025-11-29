// src/pages/Home.tsx
import React, { useEffect } from 'react'; // Remove useEffect if not used elsewhere
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, Shield, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import FeaturedProducts from '../components/FeaturedProducts';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase'; // Import Supabase config
import { useSiteSettings } from '../hooks/useSiteSettings'; // NEW: Import useSiteSettings

const Home: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading website content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[550px] lg:h-[800px] flex items-end justify-center overflow-hidden bg-black">
        {/* Hero Image Background */}
        {settings.hero_image_url && (
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={settings.hero_image_url}
              alt="Hero Banner"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Overlay - Gradient at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>

        {/* Content - Positioned at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 w-full"
        >
          <div className="max-w-7xl mx-auto text-center">
            {/* Optional Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base font-medium text-white/80 mb-6 tracking-wide uppercase"
            >
              Premium Fragrances Collection
            </motion.p>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 max-w-4xl mx-auto leading-tight"
            >
              Discover Your Signature Scent
            </motion.h1>



            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 bg-white text-[#815536] font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 space-x-2 shadow-lg hover:shadow-2xl"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#815536] transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-[#815536] to-[#c9baa8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay in the Scent
            </h2>
            <p className="text-xl text-[#c9baa8] mb-8">
              Subscribe to get updates on new arrivals, exclusive offers, and fragrance tips.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg sm:rounded-r-none border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-[#815536] font-semibold rounded-lg sm:rounded-l-none hover:bg-gray-100 transition-colors duration-200"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
