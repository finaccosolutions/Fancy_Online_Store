// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface AdminLoginForm {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, isAdmin, user, userProfile, loading: authLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginForm>();

  const onSubmit = async (formData: AdminLoginForm) => {
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await signIn(formData.email, formData.password);

    if (authError) {
      setError(authError.message);
    }
    // Do NOT navigate here. The useEffect below will handle navigation once profile is loaded.
    setIsLoading(false);
  };

  // -------------------------------------------------------------------
  // THIS IS WHERE YOU SHOULD ADD THE NEW useEffect BLOCK
  // -------------------------------------------------------------------
  useEffect(() => {
    console.log('AdminLogin useEffect: authLoading:', authLoading, 'user:', user, 'userProfile:', userProfile, 'isAdmin:', isAdmin);
    // Only proceed if authentication status has been determined (authLoading is false)
    if (!authLoading) {
      if (user && userProfile) { // Check if a user is logged in and their profile is loaded
        if (isAdmin) {
          // If the user is an admin, navigate to the admin dashboard
          console.log('AdminLogin useEffect: User is admin, navigating to /admin/dashboard');
          navigate('/admin/dashboard');
        } else {
          // If the user is logged in but NOT an admin, show an error and redirect to the regular login
          console.log('AdminLogin useEffect: User is NOT admin, setting error and navigating to /login');
          setError('Access denied. Admin privileges required. Please use the regular login page.');
          navigate('/login');
        }
      }
      // If authLoading is false but no user (e.g., login failed),
      // the error would have been set by onSubmit, so no further navigation is needed here.
    }
  }, [authLoading, user, userProfile, isAdmin, navigate]); // Dependencies for the useEffect
  // -------------------------------------------------------------------


  return (
    <div className="min-h-screen bg-admin-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-admin-card rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-admin-primary p-3 rounded-lg">
                <Shield className="text-white h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-admin-text">Admin Panel</h1>
                <p className="text-sm text-admin-text-light -mt-1">Velora Tradings</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-admin-text mb-2">Admin Login</h2>
            <p className="text-admin-text-light">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-admin-text-dark mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-admin-text-light" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent bg-admin-sidebar text-admin-text"
                    placeholder="Enter admin email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text-dark mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-admin-text-light" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="block w-full pl-10 pr-10 py-3 border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent bg-admin-sidebar text-admin-text"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-admin-text-light" />
                    ) : (
                      <Eye className="h-5 w-5 text-admin-text-light" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-admin-primary hover:bg-admin-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-admin-text-light hover:text-admin-text-dark text-sm"
              >
                ← Back to Website
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
