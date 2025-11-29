// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Local submission state

  // Destructure user, userProfile, and loading (aliased as authLoading) from useAuth
  const { signIn, user, userProfile, loading: authLoading, isAdmin } = useAuth(); // ADD isAdmin
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsSubmitting(true); // Set submitting to true
    
    try {
      const { data: authData, error } = await signIn(data.email, data.password);
      
      if (error) {
        setError(error.message);
      }
      // Do NOT navigate here. The useEffect below will handle navigation once profile is loaded.
    } finally {
      setIsSubmitting(false); // Set submitting to false in finally block
    }
  };

  // New useEffect to handle navigation after successful login and profile load
  useEffect(() => {
    console.log('Login useEffect: authLoading:', authLoading, 'user:', user, 'userProfile:', userProfile, 'isAdmin:', isAdmin); // ADD isAdmin to log
    // Check if authentication is not loading, a user is present, AND userProfile is loaded
    if (!authLoading && user && userProfile) {
      if (isAdmin) { // NEW: Check if the logged-in user is an admin
        setError('Admin users must log in via the admin panel.'); // Display error message
        navigate('/adminlogin'); // UPDATED PATH
      } else {
        console.log('Login useEffect: Navigation condition met. Navigating to /'); // New log
        navigate('/');
      }
    }
  }, [authLoading, user, userProfile, isAdmin, navigate]); // ADD isAdmin to dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#815536] to-[#c9baa8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-[#815536] to-[#c9baa8] p-3 rounded-lg">
                <span className="text-white font-bold text-2xl">TB</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#815536]">Trendy</h1>
                <p className="text-sm text-[#c9baa8] -mt-1">Bazar</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#815536] focus:ring-[#815536] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-[#815536] hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting} // Use local isSubmitting state
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#815536] to-[#c9baa8] hover:from-[#6d4429] hover:to-[#b8a494] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#815536] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'} {/* Use local isSubmitting state */}
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#815536] hover:underline font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
