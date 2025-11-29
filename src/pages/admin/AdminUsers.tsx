import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Phone, Calendar, Package, ShoppingCart, MapPin, Eye, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  orders?: { count: number }[];
  addresses?: { count: number }[];
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          orders(count),
          addresses(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.phone && user.phone.toLowerCase().includes(search))
    );
    setFilteredUsers(filtered);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);

      if (ordersError || addressesError) throw ordersError || addressesError;

      setUserDetails({
        orders: ordersData || [],
        addresses: addressesData || []
      });
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      showToast('Failed to load user details', 'error');
    }
  };

  const handleViewUser = async (userId: string) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUserDetails(null);
    } else {
      setSelectedUser(userId);
      await fetchUserDetails(userId);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.is_admin).length,
    withOrders: users.filter(u => u.orders && u.orders.length > 0 && u.orders[0].count > 0).length,
    newThisMonth: users.filter(u => {
      const createdDate = new Date(u.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-background p-8">
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-admin-text">Users Management</h1>
        <p className="text-admin-text-light mt-2">View and manage registered users</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: stats.total, color: 'bg-admin-primary', icon: Users },
          { label: 'Admins', value: stats.admins, color: 'bg-admin-secondary', icon: Shield },
          { label: 'With Orders', value: stats.withOrders, color: 'bg-admin-success', icon: ShoppingCart },
          { label: 'New This Month', value: stats.newThisMonth, color: 'bg-admin-info', icon: Calendar }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-admin-text-light">{stat.label}</p>
                <p className="text-2xl font-bold text-admin-text mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-admin-card rounded-xl shadow-lg p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-background text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-sidebar border-b border-admin-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredUsers.map((user, index) => (
                <React.Fragment key={user.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-admin-sidebar transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-admin-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-admin-text">{user.full_name}</div>
                          <div className="text-sm text-admin-text-light">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-admin-secondary/20 text-admin-secondary">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-admin-text-light/20 text-admin-text-light">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-text">
                      {user.orders && user.orders.length > 0 ? user.orders[0].count : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-text-light">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="text-admin-primary hover:text-admin-primary/80 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{selectedUser === user.id ? 'Hide' : 'View'}</span>
                      </button>
                    </td>
                  </motion.tr>
                  {selectedUser === user.id && userDetails && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-admin-sidebar">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                          <div>
                            <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2">
                              <Package className="h-5 w-5" />
                              <span>Recent Orders</span>
                            </h4>
                            {userDetails.orders.length === 0 ? (
                              <p className="text-admin-text-light text-sm">No orders yet</p>
                            ) : (
                              <div className="space-y-2">
                                {userDetails.orders.map((order: any) => (
                                  <div key={order.id} className="p-3 bg-admin-card rounded-lg flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium text-admin-text">#{order.id.slice(-8).toUpperCase()}</p>
                                      <p className="text-xs text-admin-text-light">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-admin-text">₹{Number(order.total_amount).toLocaleString()}</p>
                                      <p className="text-xs text-admin-text-light">{order.status}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2">
                              <MapPin className="h-5 w-5" />
                              <span>Saved Addresses</span>
                            </h4>
                            {userDetails.addresses.length === 0 ? (
                              <p className="text-admin-text-light text-sm">No addresses saved</p>
                            ) : (
                              <div className="space-y-2">
                                {userDetails.addresses.map((address: any) => (
                                  <div key={address.id} className="p-3 bg-admin-card rounded-lg">
                                    <p className="text-sm font-medium text-admin-text">{address.title}</p>
                                    <p className="text-xs text-admin-text-light mt-1">
                                      {address.address_line_1}, {address.city}, {address.state} - {address.postal_code}
                                    </p>
                                    <p className="text-xs text-admin-text-light">Phone: {address.phone}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
