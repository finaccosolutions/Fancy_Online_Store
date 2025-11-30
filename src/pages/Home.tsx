import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Heart, ChevronLeft, ChevronRight, ShoppingCart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';

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
  category_name?: string;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useSupabaseWishlist();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes, allProductsRes, heroRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('sales_count', { ascending: false })
            .limit(10),
          supabase
            .from('products')
            .select(`*, categories(name)`)
            .eq('in_stock', true),
          supabase
            .from('hero_carousel_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
        ]);

        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
          if (categoriesRes.data.length > 0) {
            setSelectedCategory(categoriesRes.data[0].id);
          }
        }
        if (productsRes.data) setTopProducts(productsRes.data);
        if (allProductsRes.data) {
          const mappedProducts = allProductsRes.data.map((p: any) => ({
            ...p,
            category_name: p.categories?.name || p.category || 'Uncategorized'
          }));
          setAllProducts(mappedProducts);
        }
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

  const handleAddToCart = async (e: React.MouseEvent, productId: string, productName: string, price: number, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await addToCart(productId, 1);
    if (!result.error) {
      window.dispatchEvent(new CustomEvent('productAddedToCart', {
        detail: { name: productName, price, image_url: imageUrl }
      }));
      showToast(`${productName} added to cart!`, 'success');
    } else {
      showToast(result.error.error_description || result.error.message, 'error');
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await addToCart(productId, 1);
    if (!result.error) {
      showToast('Product added to cart! Navigating...', 'success');
      setTimeout(() => {
        navigate('/cart');
      }, 300);
    } else {
      showToast(result.error.error_description || result.error.message, 'error');
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productsScrollRef.current) {
      const scrollAmount = 300;
      productsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getProductsByCategory = (categoryId: string) => {
    const selectedCat = categories.find(c => c.id === categoryId);
    if (!selectedCat) return [];
    return allProducts.filter(p => p.category_name === selectedCat.name).slice(0, 8);
  };

  const getProductCountByCategory = (categoryId: string) => {
    const selectedCat = categories.find(c => c.id === categoryId);
    if (!selectedCat) return 0;
    return allProducts.filter(p => p.category_name === selectedCat.name).length;
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
                  <div key={image.id} className="min-w-full h-full flex-shrink-0 flex items-center justify-center">
                    <motion.img
                      src={image.image_url}
                      alt={`Hero Banner ${idx + 1}`}
                      className="w-full h-full object-contain opacity-85"
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

      {/* Category Groups Section with Scrollable Categories */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Explore Our Collections
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through our featured categories and find exactly what you're looking for
            </p>
          </motion.div>

          {/* Horizontal Scrollable Categories */}
          {categories.length > 0 && (
            <div className="relative mb-12">
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>

              <div
                ref={categoriesScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-16"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => {
                  const productCount = getProductCountByCategory(category.id);
                  const isSelected = selectedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex-shrink-0 w-56 cursor-pointer group"
                    >
                      <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                        isSelected
                          ? 'shadow-2xl shadow-blue-600/40 ring-4 ring-blue-600 ring-offset-2'
                          : 'shadow-lg hover:shadow-2xl hover:-translate-y-1'
                      }`}>
                        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                          {category.image_url ? (
                            <>
                              <motion.img
                                src={category.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                whileHover={{ scale: 1.1 }}
                              />
                              <div className={`absolute inset-0 transition-all duration-500 ${
                                isSelected
                                  ? 'bg-gradient-to-t from-blue-600/90 via-blue-600/40 to-transparent'
                                  : 'bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent group-hover:from-blue-600/80 group-hover:via-blue-600/30'
                              }`} />
                            </>
                          ) : (
                            <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center ${
                              isSelected
                                ? 'bg-gradient-to-t from-blue-600/90 via-blue-600/40 to-transparent'
                                : 'bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent group-hover:from-blue-600/80 group-hover:via-blue-600/30'
                            }`} >
                              <span className={`text-4xl font-bold transition-all duration-300 ${
                                isSelected ? 'text-white' : 'text-gray-700 group-hover:text-white'
                              }`}>
                                {category.name.charAt(0)}
                              </span>
                            </div>
                          )} 
                        </div> 
                        <div className={`p-4 transition-all duration-500 ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-400 to-blue-100 text-white'
                            : 'bg-white text-gray-900 group-hover:bg-gradient-to-br group-hover:from-slate-50 group-hover:to-white'
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className={`text-lg font-bold transition-all duration-300 ${
                              isSelected ? 'text-white' : 'text-gray-900 group-hover:text-blue-600'
                            }`}>
                              {category.name}
                            </h3>
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                              isSelected
                                ? 'bg-white/30 text-white'
                                : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                              {productCount}
                            </div>
                          </div>
                          <p className={`text-xs transition-all duration-300 ${
                            isSelected ? 'text-white/90' : 'text-gray-600 group-hover:text-gray-700'
                          }`}>
                            {productCount === 1 ? 'Product' : 'Products'} available
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Products for Selected Category */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {categories.find(c => c.id === selectedCategory)?.name} Products
                </h3>
              </div>

              <div className="relative">
                {getProductsByCategory(selectedCategory).length > 3 && (
                  <>
                    <button
                      onClick={() => scrollProducts('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => scrollProducts('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div
                  ref={productsScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {getProductsByCategory(selectedCategory).map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-52 bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all duration-500 group hover:-translate-y-1"
                    >
                      <div className="relative h-32 overflow-hidden bg-gray-100">
                        <motion.img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-blue-600/60 transition-all duration-500" />

                        {/* Wishlist Button - always visible */}
                        <motion.button
                          onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors duration-200 ${
                              isInWishlist(product.id)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </motion.button>
                      </div>
                      <div className="p-3 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-white transition-all duration-500">
                        <h4
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem] cursor-pointer"
                        >
                          {product.name}
                        </h4>
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < Math.floor(product.rating)
                                        ? 'text-amber-600'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-600 font-semibold">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1.5 text-xs">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleAddToCart(e, product.id, product.name, product.price, product.image_url)}
                            className="flex-1 flex items-center justify-center p-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-all duration-200 gap-1"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            <span>Cart</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleBuyNow(e, product.id)}
                            className="flex-1 flex items-center justify-center p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded transition-all duration-200 gap-1"
                            aria-label="Buy now"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Buy</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {topProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group cursor-pointer flex flex-col h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Image Section - Top */}
                <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
                  <motion.img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />

                  {/* Wishlist Button - Top Right */}
                  <motion.button
                    onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isInWishlist(product.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Content Section - Bottom */}
                <div className="flex-1 p-3 flex flex-col gap-2">
                  {/* Product Name */}
                  <h3
                    className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-blue-900 transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.floor(product.rating)
                                ? 'text-amber-600'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAddToCart(e, product.id, product.name, product.price, product.image_url)}
                      className="flex-1 flex items-center justify-center p-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md gap-1"
                      aria-label="Add to cart"
                      title="Add to cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-xs">Cart</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleBuyNow(e, product.id)}
                      className="flex-1 flex items-center justify-center p-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md gap-1"
                      aria-label="Buy now"
                      title="Buy now"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="text-xs">Buy</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl group"
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
