import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Category {
  id: string;
  name: string;
  image_url: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  rating: number;
  sales_count: number;
  category: string;
}

const Home: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('sales_count', { ascending: false })
            .limit(10)
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (productsRes.data) setTopProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  if (settingsLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trendy styles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[550px] lg:h-[800px] flex items-end justify-center overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950">
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
              className="w-full h-full object-cover opacity-80"
            />
          </motion.div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/40 to-blue-900/80"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 w-full"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base font-medium text-white/90 mb-6 tracking-wide uppercase"
            >
              Welcome to Trendy Bazar
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 max-w-4xl mx-auto leading-tight"
            >
              Discover Your Style
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Premium fashion and accessories curated just for you
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 bg-yellow-500 text-blue-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 space-x-2 shadow-lg hover:shadow-2xl"
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
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#0A8DB0] transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Category Groups Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections across different styles and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="group cursor-pointer"
              >
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {category.image_url ? (
                    <motion.img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      whileHover={{ scale: 1.1 }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{category.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/90 to-transparent flex items-end justify-start p-6"
                  >
                    <div className="text-white transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Decorative Element */}
                  <motion.div
                    className="absolute top-4 right-4 bg-yellow-500 text-blue-900 w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.2 }}
                  >
                    →
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling Products Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Top Selling Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most loved items by our customers
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {topProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-64 sm:h-72">
                  <motion.img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ scale: 1.1 }}
                  />

                  {/* Product Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/95 to-transparent flex flex-col items-end justify-between p-3 sm:p-4"
                  >
                    <div className="self-start">
                      {product.rating > 0 && (
                        <div className="bg-yellow-500 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                          {product.rating.toFixed(1)} ★
                        </div>
                      )}
                    </div>
                    <div className="w-full text-white">
                      <h3 className="text-sm sm:text-base font-bold mb-1 line-clamp-2 group-hover:line-clamp-none">
                        {product.name}
                      </h3>
                      <p className="text-lg sm:text-xl font-bold text-yellow-500">
                        ₹{product.price.toFixed(0)}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-950 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              View All Products
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-900 to-blue-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stay Updated with Trendy Bazar
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Subscribe to get exclusive deals, new arrivals, and fashion tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg sm:rounded-r-none border-0 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-yellow-500 text-blue-900 font-semibold rounded-lg sm:rounded-l-none hover:bg-yellow-400 transition-colors duration-200"
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
