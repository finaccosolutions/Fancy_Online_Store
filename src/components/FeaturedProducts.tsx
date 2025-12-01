import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, Shield, HeadphonesIcon } from 'lucide-react';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useSupabaseCart } from '../hooks/useSupabaseCart';
import { useSupabaseWishlist } from '../hooks/useSupabaseWishlist';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts: React.FC = () => {
  const { products, loading } = useSupabaseProducts();
  const { addToCart } = useSupabaseCart();
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useSupabaseWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const allProducts = products;

  const handleAddToCart = async (productId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const result = await addToCart(productId, 1);
    if (!result.error) {
      showToast('Product added to cart!', 'success');
    } else {
      showToast(result.error.error_description || result.error.message, 'error');
    }
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

  const handleBuyNow = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowProductId: productId } });
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Featured Fragrances</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium perfumes, each crafted to perfection
            and designed to make you unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#0A8DB0]/20"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-gray-100">
                  <motion.img
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-72 object-cover"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                  ></motion.div>

                  <button
                    onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-20"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-200 ${
                        isInWishlist(product.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {product.original_price && (
                    <div className="absolute top-4 left-4 bg-[#0A8DB0] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.reviews_count})</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0A8DB0] transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl font-bold text-[#0A8DB0]">₹{product.price.toLocaleString()}</span>
                      {product.original_price && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                    <span className="bg-[#D4AF37]/20 text-[#0A8DB0] px-2 py-1 rounded-full text-xs font-medium">
                      {product.category_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product.id, e);
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-2 sm:py-3 bg-gradient-to-r from-[#0A8DB0] to-[#D4AF37] text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-[#086b8f] hover:to-[#c9941e] transition-all duration-200"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleBuyNow(e, product.id)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 sm:py-3 border-2 border-[#0A8DB0] text-[#0A8DB0] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#0A8DB0] hover:text-white transition-all duration-200"
                    >
                      <span>Buy Now</span>
                    </motion.button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Features Section Below Products */}
      <div className="mt-20 pt-20 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹2000' },
            { icon: Shield, title: 'Authentic Products', desc: '100% genuine fragrances' },
            { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here to help' },
            { icon: Star, title: 'Premium Quality', desc: 'Luxury at its finest' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="text-center p-4 sm:p-8 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#815536]/30"
            >
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-[#815536] to-[#c9baa8] rounded-full mb-3 sm:mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
              </motion.div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
