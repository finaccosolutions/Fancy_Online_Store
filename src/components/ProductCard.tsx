// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext'; // NEW: Import useToast
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate

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
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        {product.original_price && (
          <div className="absolute top-4 left-4 bg-[#815536] text-white px-2 py-1 rounded-lg text-sm font-semibold z-10 pointer-events-none">
            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
          </div>
        )}
        <button
          onClick={(e) => handleWishlistToggle(e, product.id, product.name)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-20"
          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-5 w-5 ${
              isInWishlist(product.id)
                ? 'text-red-500 fill-red-500'
                : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      <Link to={`/product/${product.id}`}>

        <div className="p-6">
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews_count})</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#815536] transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-[#815536]">₹{product.price}</span>
              {product.original_price && (
                <span className="text-lg text-gray-400 line-through ml-2">₹{product.original_price}</span>
              )}
            </div>
            <span className="text-sm text-[#c9baa8] bg-[#c9baa8]/20 px-3 py-1 rounded-full">
              {product.category_name} {/* Display category_name */}
            </span>
          </div>

          <div className="flex space-x-2"> {/* NEW: Flex container for buttons */}
            <Link
              to={`/product/${product.id}`}
              className="block w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 text-center"
            >
              View Details
            </Link>
            {/* NEW: Buy Now Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              className="flex-shrink-0 px-4 py-3 border-2 border-[#815536] text-[#815536] font-semibold rounded-lg hover:bg-[#815536] hover:text-white transition-all duration-200"
            >
              Buy Now
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

