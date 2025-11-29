// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, Save, X, ShoppingBag, Heart, Package, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface ProfileForm {
  full_name: string;
  phone: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({ ordersCount: 0, wishlistCount: 0, addressesCount: 0 });
  const { userProfile, updateProfile, isAdmin, user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      full_name: userProfile?.full_name || '',
      phone: userProfile?.phone || ''
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      const [ordersRes, wishlistRes, addressesRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setStats({
        ordersCount: ordersRes.count || 0,
        wishlistCount: wishlistRes.count || 0,
        addressesCount: addressesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setMessage(null);

    const { error } = await updateProfile(data);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    }

    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      full_name: userProfile?.full_name || '',
      phone: userProfile?.phone || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
    setMessage(null);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#815536] to-[#c9baa8] px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="bg-white p-4 rounded-full">
                <User className="h-12 w-12 text-[#815536]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{userProfile.full_name}</h1>
                <p className="text-[#c9baa8] text-lg">{userProfile.email}</p>
                {isAdmin && ( // USE isAdmin here
                  <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mt-2">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/orders">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-[#815536]/10 to-[#c9baa8]/10 p-6 rounded-xl border border-[#815536]/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-[#815536]">{stats.ordersCount}</p>
                    </div>
                    <ShoppingBag className="h-10 w-10 text-[#815536]/50" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 rounded-xl border border-red-500/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                      <p className="text-3xl font-bold text-red-500">{stats.wishlistCount}</p>
                    </div>
                    <Heart className="h-10 w-10 text-red-500/50" />
                  </div>
                </motion.div>
              </Link>

              <Link to="/addresses">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-xl border border-blue-500/20 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Saved Addresses</p>
                      <p className="text-3xl font-bold text-blue-500">{stats.addressesCount}</p>
                    </div>
                    <MapPin className="h-10 w-10 text-blue-500/50" />
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#815536] text-white rounded-lg hover:bg-[#6d4429] transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('full_name', { required: 'Full name is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    value={userProfile.email}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-[#815536] text-white rounded-lg hover:bg-[#6d4429] transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 text-[#815536]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-lg text-gray-900">{userProfile.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-6 w-6 text-[#815536]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email Address</p>
                      <p className="text-lg text-gray-900">{userProfile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-6 w-6 text-[#815536]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone Number</p>
                      <p className="text-lg text-gray-900">{userProfile.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-[#815536]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Type</p>
                      <p className="text-lg text-gray-900">
                        {isAdmin ? 'Administrator' : 'Customer'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#815536]" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-lg text-gray-900">
                        {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/orders">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Package className="h-5 w-5 text-[#815536]" />
                    <span className="text-gray-700 font-medium">View My Orders</span>
                  </motion.div>
                </Link>
                <Link to="/wishlist">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="h-5 w-5 text-[#815536]" />
                    <span className="text-gray-700 font-medium">Manage Wishlist</span>
                  </motion.div>
                </Link>
                <Link to="/addresses">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-[#815536]" />
                    <span className="text-gray-700 font-medium">Manage Addresses</span>
                  </motion.div>
                </Link>
                <Link to="/products">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingBag className="h-5 w-5 text-[#815536]" />
                    <span className="text-gray-700 font-medium">Continue Shopping</span>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;