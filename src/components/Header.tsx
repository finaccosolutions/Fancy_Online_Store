// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, LogOut, Settings, MapPin } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '../hooks/useSiteSettings';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { cartItems, getCartItemsCount } = useCart();
  const { wishlistItems, getWishlistItemsCount } = useWishlist();
  const { user, userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemsCount = getCartItemsCount();
  const wishlistItemsCount = getWishlistItemsCount();

  useEffect(() => {
    console.log('Header - Cart items changed:', cartItems.length, 'Total count:', cartItemsCount);
  }, [cartItems, cartItemsCount]);

  useEffect(() => {
    console.log('Header - Wishlist items changed:', wishlistItems.length);
  }, [wishlistItems]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    } else {
      navigate('/');
      setIsProfileOpen(false);
    }
  };

  const handleSearchClick = () => {
    alert('Search functionality coming soon!');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items with active state detection
  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="bg-blue-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
              {settings.logo_url ? (
                <motion.img
                  src={settings.logo_url}
                  alt={settings.site_name || 'Trendy Bazar'}
                  className="h-10 w-auto max-w-[180px] object-contain"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-brand-blue to-brand-yellow p-2 rounded-lg group-hover:shadow-lg transition-all duration-200 flex-shrink-0"
                  >
                    <span className="text-white font-bold text-xl">TB</span>
                  </motion.div>
                  <div className="group-hover:scale-105 transition-transform duration-200">
                    <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-gray-100 transition-colors duration-200">{settings.site_name || 'Trendy Bazar'}</h1>
                    <p className="text-xs text-yellow-400 -mt-1">FASHION & STYLE</p>
                  </div>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-white bg-white/20'
                      : 'text-gray-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActivePath(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-yellow/10 rounded-lg border border-brand-blue/20"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-brand-yellow/5 rounded-lg opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2">
              {/* Wishlist Button - Desktop Only */}
              <Link to="/wishlist" className="relative group hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-3 text-gray-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  <AnimatePresence>
                    {wishlistItemsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg"
                      >
                        {wishlistItemsCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>

              {/* Cart Button - Desktop Only */}
              <Link to="/cart" className="relative group hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-3 text-gray-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <AnimatePresence>
                    {cartItemsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 bg-brand-blue text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg"
                      >
                        {cartItemsCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-yellow/10 rounded-lg opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative profile-dropdown">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative p-3 text-gray-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                  title={user ? `${userProfile?.full_name || 'User'} Account` : 'Account'}
                >
                  <User className="h-5 w-5" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-yellow/10 rounded-lg opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Dropdown indicator */}
                  <motion.div
                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -bottom-1 -right-1 w-3 h-3"
                  >
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-400"></div>
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      {user ? (
                        <>
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-brand-blue/5 to-brand-yellow/5">
                            {authLoading && !userProfile ? (
                              <p className="text-sm font-semibold text-gray-900">Loading profile...</p>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-900 truncate">{userProfile?.full_name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{userProfile?.email || user?.email}</p>
                                {isAdmin && (
                                  <span className="inline-block mt-1 px-2 py-1 bg-brand-blue text-white text-xs rounded-full">
                                    Administrator
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            {authLoading && !userProfile ? (
                              <div className="px-4 py-2 text-sm text-gray-700">Loading menu...</div>
                            ) : (
                              <>
                                {/* Mobile-only Cart and Wishlist */}
                                <div className="md:hidden">
                                  <Link
                                    to="/cart"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                    onClick={() => setIsProfileOpen(false)}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-3" />
                                    My Cart
                                    {cartItemsCount > 0 && (
                                      <span className="ml-auto bg-brand-blue text-white text-xs px-2 py-1 rounded-full">
                                        {cartItemsCount}
                                      </span>
                                    )}
                                  </Link>
                                  <Link
                                    to="/wishlist"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                    onClick={() => setIsProfileOpen(false)}
                                  >
                                    <Heart className="h-4 w-4 mr-3" />
                                    My Wishlist
                                    {wishlistItemsCount > 0 && (
                                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {wishlistItemsCount}
                                      </span>
                                    )}
                                  </Link>
                                  <div className="border-t border-gray-100 my-2"></div>
                                </div>

                                <Link
                                  to="/profile"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <User className="h-4 w-4 mr-3" />
                                  My Profile
                                </Link>
                                <Link
                                  to="/orders"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-3" />
                                  My Orders
                                </Link>

                                {/* Desktop Wishlist link */}
                                <Link
                                  to="/wishlist"
                                  className="hidden md:flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <Heart className="h-4 w-4 mr-3" />
                                  My Wishlist
                                  {wishlistItemsCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                      {wishlistItemsCount}
                                    </span>
                                  )}
                                </Link>

                                <Link
                                  to="/addresses"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                  onClick={() => setIsProfileOpen(false)}
                                >
                                  <MapPin className="h-4 w-4 mr-3" />
                                  My Addresses
                                </Link>
                                {isAdmin && (
                                  <Link
                                    to="/admin/dashboard"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                    onClick={() => setIsProfileOpen(false)}
                                  >
                                    <Settings className="h-4 w-4 mr-3" />
                                    Admin Panel
                                  </Link>
                                )}
                              </>
                            )}
                          </div>

                          <div className="border-t border-gray-100 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Logout
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-1">
                          <Link
                            to="/login"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Register
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <nav className="py-4">
                <div className="flex flex-col space-y-2 px-4">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActivePath(item.path)
                            ? 'text-brand-blue bg-brand-blue/10 border-l-4 border-brand-blue'
                            : 'text-gray-700 hover:text-brand-blue hover:bg-brand-blue/5'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Indicator */}
        <AnimatePresence>
          {location.pathname !== '/' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-brand-blue/5 to-brand-yellow/5 border-b border-brand-blue/10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Link to="/" className="text-gray-500 hover:text-brand-blue transition-colors">
                    Home
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-brand-blue font-medium capitalize">
                    {location.pathname === '/products' && 'Products'}
                    {location.pathname === '/about' && 'About Us'}
                    {location.pathname === '/contact' && 'Contact'}
                    {location.pathname === '/cart' && 'Shopping Cart'}
                    {location.pathname === '/wishlist' && 'Wishlist'}
                    {location.pathname === '/profile' && 'My Profile'}
                    {location.pathname === '/orders' && 'My Orders'}
                    {location.pathname.startsWith('/product/') && 'Product Details'}
                    {location.pathname === '/checkout' && 'Checkout'}
                    {location.pathname === '/login' && 'Login'}
                    {location.pathname === '/register' && 'Register'}
                    {location.pathname === '/adminlogin' && 'Admin Login'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </>
  );
};

export default Header;
