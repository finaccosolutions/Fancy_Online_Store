// src/components/admin/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, Settings, BarChart, LogOut, User, X, ChevronLeft, ChevronRight, Eye, ShoppingCart, Users, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { userProfile, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize isSidebarOpen based on screen width
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Assuming md breakpoint is 768px
  // Controls desktop sidebar expansion
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth >= 768);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      // If not loading and not an admin, redirect to home
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  // Add resize listener to update isSidebarOpen for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsSidebarOpen(isDesktop); // On desktop, sidebar is always "open" (visible)
      setIsSidebarExpanded(isDesktop); // On desktop, sidebar is expanded by default
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (authLoading || !isAdmin) {
    // Show a loading spinner or a simple message while checking auth status
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen h-screen bg-admin-background text-admin-text"> {/* Added h-screen to fix layout height */}
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-admin-card text-admin-text-light shadow-lg"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <LayoutDashboard className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false} // Control animations manually
        animate={{
          x: isSidebarOpen ? 0 : -250, // Mobile slide in/out
          // Adjusted width for sidebar: w-56 (224px) when expanded, w-16 (64px) when collapsed
          width: window.innerWidth >= 768 ? (isSidebarExpanded ? 224 : 64) : (isSidebarOpen ? 224 : 0)
        }}
        transition={{ duration: 0.3 }}
        className={`bg-admin-sidebar shadow-xl h-screen flex-shrink-0 overflow-y-auto overflow-x-hidden
                    ${window.innerWidth >= 768 ? 'relative' : 'fixed inset-y-0 left-0 z-40'}
                  `}
      >
        <div className={`flex flex-col h-full px-4 py-6`}> {/* Fixed padding for the inner container */}
          {/* Logo and Toggle Button */}
          <div className="flex items-center justify-between mb-10">
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}> {/* Remove space-x-3 when collapsed */}
              <div className="bg-admin-primary p-2 rounded-lg">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              {isSidebarExpanded && ( // Conditionally render text
                <div>
                  <h1 className="text-2xl font-bold text-admin-primary-dark">Admin</h1>
                  <p className="text-sm text-admin-text-light -mt-1">Velora Tradings</p>
                </div>
              )}
            </div>
            {window.innerWidth >= 768 && ( // Only show toggle button on desktop
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-1 rounded-full hover:bg-admin-card text-admin-text-light"
              >
                {isSidebarExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  // Only close sidebar on small screens
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center py-3 rounded-lg transition-all duration-200
                  ${location.pathname.startsWith(item.href)
                    ? 'bg-admin-primary text-white shadow-md'
                    : 'text-admin-text-light hover:bg-admin-card hover:text-admin-primary-dark'
                  }
                  ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center'}
                  `}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                <item.icon className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-6 w-6'} flex-shrink-0`} />
                {isSidebarExpanded && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User and Logout */}
          <div className="mt-auto pt-6 border-t border-admin-border">
            <div className={`flex items-center mb-4 ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center'}`}>
              <div className="bg-admin-card p-2 rounded-full flex-shrink-0">
                <User className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-6 w-6'} text-admin-primary-dark`} />
              </div>
              {isSidebarExpanded && (
                <div className="overflow-hidden">
                  <p className="font-semibold text-admin-text-dark truncate">{userProfile?.full_name || 'Admin User'}</p>
                  <p className="text-sm text-admin-text-light truncate">{userProfile?.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full py-3 rounded-lg text-admin-danger hover:bg-admin-danger/20 transition-colors duration-200
                ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center'}
                `}
              title={!isSidebarExpanded ? 'Logout' : undefined}
            >
              <LogOut className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-6 w-6'} flex-shrink-0`} />
              {isSidebarExpanded && <span className="font-medium">Logout</span>}
            </button>
            <Link
              to="/"
              className={`flex items-center w-full py-3 rounded-lg text-admin-text-light hover:bg-admin-card hover:text-admin-primary-dark transition-colors duration-200 mt-2
                ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center'}
                `}
              title={!isSidebarExpanded ? 'View Site' : undefined}
            >
              <Eye className={`${isSidebarExpanded ? 'h-5 w-5' : 'h-6 w-6'} flex-shrink-0`} />
              {isSidebarExpanded && <span className="font-medium">View Site</span>}
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-2 md:p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
