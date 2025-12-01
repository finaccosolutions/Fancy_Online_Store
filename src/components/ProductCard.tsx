// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: any;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlistByProductId, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async (productId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const result = await addToCart(productId, 1);
    if (!result.error) {
      window.dispatchEvent(new CustomEvent('productAddedToCart', {
        detail: { name: product.name, price: product.price, image_url: product.image_url }
      }));
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
      await removeFromWishlistByProductId(productId);
      showToast(`${productName} removed from wishlist!`, 'success');
    } else {
      await addToWishlist(productId);
      window.dispatchEvent(new CustomEvent('productAddedToWishlist', {
        detail: { name: productName, image_url: product.image_url }
      }));
      showToast(`${productName} added to wishlist!`, 'success');
    }
  };

  // NEW: Handle Buy Now
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowProductId: product.id } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBuyNow(e);
              }}
              className="flex items-center justify-center space-x-1 px-3 py-2 sm:py-3 border-2 border-[#0A8DB0] text-[#0A8DB0] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#0A8DB0] hover:text-white transition-all duration-200"
            >
              <span>Buy Now</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

