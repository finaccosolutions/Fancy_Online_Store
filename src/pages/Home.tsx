import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useToast } from '../context/ToastContext';

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

interface HeroImage {
  id: string;
  image_url: string;
}

const Home: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useSupabaseWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes, heroRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('sales_count', { ascending: false })
            .limit(10),
          supabase
            .from('hero_carousel_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (productsRes.data) setTopProducts(productsRes.data);
        if (heroRes.data && heroRes.data.length > 0) {
          setHeroImages(heroRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleNextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % (heroImages.length || 1));
  };

  const handlePrevHero = () => {
    setCurrentHeroIndex((prev) =>
      prev === 0 ? (heroImages.length || 1) - 1 : prev - 1
    );
  };

  const handleWishlistToggle = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyInWishlist = isInWishlist(productId);

    if (isCurrentlyInWishlist) {
      const result = await removeFromWishlistByProductId(productId);
      if (!result.error) {
        showToast(`${productName} removed from wishlist!`, 'success');
      } else {
        if (result.error.message === 'Please login to add items to wishlist' || result.error.message === 'Please login') {
          showToast('Please login to manage your wishlist', 'error');
        } else {
          showToast(result.error.error_description || result.error.message, 'error');
        }
      }
    } else {
      const result = await addToWishlist(productId);
      if (!result.error) {
        showToast(`${productName} added to wishlist!`, 'success');
      } else {
        if (result.error.message === 'Please login to add items to wishlist' || result.error.message === 'Please login') {
          showToast('Please login to add items to wishlist', 'error');
        } else {
          showToast(result.error.error_description || result.error.message, 'error');
        }
      }
    }
  };

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

  const currentHeroImage = heroImages.length > 0 ? heroImages[currentHeroIndex]?.image_url : settings.hero_image_url;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[550px] lg:h-[800px] flex items-end justify-center overflow-hidden group">
        {heroImages.length > 0 ? (
          <>
            {/* Hero Carousel with Scrollable Images */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <motion.div
                className="flex h-full"
                animate={{ x: `-${currentHeroIndex * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {heroImages.map((image, idx) => (
                  <div key={image.id} className="min-w-full h-full flex-shrink-0">
                    <motion.img
                      src={image.image_url}
                      alt={`Hero Banner ${idx + 1}`}
                      className="w-full h-full object-cover opacity-85"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/40 to-blue-900/80"></div>

            {/* Left Arrow */}
            {heroImages.length > 1 && (
              <motion.button
                onClick={handlePrevHero}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/30 hover:bg-white/50 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Previous hero image"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </motion.button>
            )}

            {/* Right Arrow */}
            {heroImages.length > 1 && (
              <motion.button
                onClick={handleNextHero}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/30 hover:bg-white/50 rounded-full backdrop-blur-sm transition-all duration-300"
                aria-label="Next hero image"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </motion.button>
            )}

            {/* Carousel Indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentHeroIndex ? 'bg-yellow-500 w-8' : 'bg-white/50 w-2'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Go to hero image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Fallback to solid background when no images */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-950"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/40 to-blue-900/80"></div>
          </>
        )}

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

                  {/* Overlay - Always Visible Category Name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/95 to-transparent/10 flex items-end justify-start p-6">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="text-sm text-white/80 line-clamp-2"
                        >
                          {category.description}
                        </motion.p>
                      )}
                    </div>
                  </div>

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
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-48 sm:h-56">
                  <motion.img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />

                  {/* Wishlist Button - Top Right Corner */}
                  <motion.button
                    onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
                        isInWishlist(product.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Product Details Below Image */}
                <div className="flex-1 bg-white rounded-b-xl p-3 sm:p-4 flex flex-col gap-2">
                  <h3
                    className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-blue-900 cursor-pointer transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm sm:text-base font-bold text-yellow-600">
                      ₹{product.price.toFixed(0)}
                    </p>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                        <span className="text-xs font-bold text-yellow-700">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-yellow-700">★</span>
                      </div>
                    )}
                  </div>
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
