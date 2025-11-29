import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Filter, Eye, Edit, Truck, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, User, MapPin, Phone, Mail, Calendar, DollarSign, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  user_id: string | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  tracking_number: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  created_at: string;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image_url: string;
    };
  }[];
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    tracking_number: '',
    estimated_delivery: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    paymentMethod: 'all',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    } else {
      fetchOrders();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders, advancedFilters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            full_name,
            email,
            phone
          ),
          order_items (
            id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const customerName = order.users?.full_name || order.guest_name || '';
        const customerEmail = order.users?.email || order.guest_email || '';
        return order.id.toLowerCase().includes(search) ||
          customerName.toLowerCase().includes(search) ||
          customerEmail.toLowerCase().includes(search);
      });
    }

    if (advancedFilters.paymentMethod !== 'all') {
      filtered = filtered.filter(order => order.payment_method === advancedFilters.paymentMethod);
    }

    if (advancedFilters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.payment_status === advancedFilters.paymentStatus);
    }

    if (advancedFilters.startDate) {
      filtered = filtered.filter(order => new Date(order.created_at) >= new Date(advancedFilters.startDate));
    }

    if (advancedFilters.endDate) {
      const endDate = new Date(advancedFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.created_at) <= endDate);
    }

    if (advancedFilters.minAmount) {
      filtered = filtered.filter(order => Number(order.total_amount) >= Number(advancedFilters.minAmount));
    }

    if (advancedFilters.maxAmount) {
      filtered = filtered.filter(order => Number(order.total_amount) <= Number(advancedFilters.maxAmount));
    }

    setFilteredOrders(filtered);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order.id);
    setEditForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery ? order.estimated_delivery.split('T')[0] : ''
    });
  };

  const handleUpdateOrder = async (orderId: string) => {
    try {
      const updateData: any = {
        status: editForm.status,
        tracking_number: editForm.tracking_number || null,
        estimated_delivery: editForm.estimated_delivery ? new Date(editForm.estimated_delivery).toISOString() : null
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      showToast('Order updated successfully', 'success');
      setEditingOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    }
  };

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      showToast('No orders to export', 'error');
      return;
    }

    const headers = [
      'Order ID', 'Customer', 'Email', 'Phone', 'Product Name', 'Quantity',
      'Price Per Item', 'Item Total', 'Order Total', 'Status', 'Payment Method',
      'Payment Status', 'Tracking Number', 'Date', 'Address'
    ];

    const rows: string[][] = [];

    filteredOrders.forEach(order => {
      const baseInfo = [
        order.id.slice(-8).toUpperCase(),
        order.users?.full_name || order.guest_name || 'Guest',
        order.users?.email || order.guest_email || 'N/A',
        order.users?.phone || order.guest_phone || 'N/A'
      ];

      const orderInfo = [
        `Rs ${Number(order.total_amount).toLocaleString()}`,
        order.status.charAt(0).toUpperCase() + order.status.slice(1),
        order.payment_method === 'cod' ? 'COD' : 'Online',
        order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1),
        order.tracking_number || 'N/A',
        new Date(order.created_at).toLocaleString('en-IN'),
        `${order.shipping_address.address_line_1}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`
      ];

      if (order.order_items.length === 0) {
        rows.push([...baseInfo, 'No items', '0', 'Rs 0', 'Rs 0', ...orderInfo]);
      } else {
        order.order_items.forEach((item, index) => {
          const itemTotal = Number(item.price) * item.quantity;
          rows.push([
            ...baseInfo,
            item.product.name,
            item.quantity.toString(),
            `Rs ${Number(item.price).toLocaleString()}`,
            `Rs ${itemTotal.toLocaleString()}`,
            ...orderInfo
          ]);
        });
      }
    });

    const BOM = '\uFEFF';
    let csvContent = BOM + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Orders exported successfully', 'success');
  };

  const resetFilters = () => {
    setAdvancedFilters({
      paymentMethod: 'all',
      paymentStatus: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-admin-success/20 text-admin-success border-admin-success/50';
      case 'shipped':
        return 'bg-admin-info/20 text-admin-info border-admin-info/50';
      case 'confirmed':
        return 'bg-admin-warning/20 text-admin-warning border-admin-warning/50';
      case 'cancelled':
        return 'bg-admin-danger/20 text-admin-danger border-admin-danger/50';
      default:
        return 'bg-admin-text-light/20 text-admin-text-light border-admin-text-light/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'confirmed':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  };

  const statusTabs = [
    { key: 'all', label: 'All Orders', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { key: 'shipped', label: 'Shipped', count: stats.shipped },
    { key: 'delivered', label: 'Delivered', count: stats.delivered },
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-background p-4 sm:p-8">
      <header className="bg-admin-card shadow-lg rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-admin-text">Orders Management</h1>
            <p className="text-admin-text-light mt-1 sm:mt-2 text-sm sm:text-base">Manage and track customer orders</p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Export Excel</span>
          </button>
        </div>
      </header>

      <div className="bg-admin-card rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex border-b border-admin-border min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  statusFilter === tab.key
                    ? 'border-b-2 border-admin-primary text-admin-primary bg-admin-primary/5'
                    : 'text-admin-text-light hover:text-admin-text hover:bg-admin-sidebar'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-admin-card rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-admin-text-light" />
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-background text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-admin-border rounded-lg bg-admin-background text-admin-text hover:bg-admin-sidebar transition-colors text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filters</span>
              {showFilterPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-admin-border pt-4 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Payment Method</label>
                  <select
                    value={advancedFilters.paymentMethod}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  >
                    <option value="all">All Methods</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Payment Status</label>
                  <select
                    value={advancedFilters.paymentStatus}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, paymentStatus: e.target.value })}
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Start Date</label>
                  <input
                    type="date"
                    value={advancedFilters.startDate}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, startDate: e.target.value })}
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">End Date</label>
                  <input
                    type="date"
                    value={advancedFilters.endDate}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, endDate: e.target.value })}
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Min Amount (₹)</label>
                  <input
                    type="number"
                    value={advancedFilters.minAmount}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minAmount: e.target.value })}
                    placeholder="0"
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Max Amount (₹)</label>
                  <input
                    type="number"
                    value={advancedFilters.maxAmount}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxAmount: e.target.value })}
                    placeholder="999999"
                    className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-admin-text-light hover:text-admin-text transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-admin-card rounded-xl shadow-lg p-12 text-center">
            <Package className="h-16 w-16 text-admin-text-light mx-auto mb-4" />
            <p className="text-xl text-admin-text-light">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-admin-card rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-admin-primary p-2 sm:p-3 rounded-lg flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-admin-text">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-xs sm:text-sm text-admin-text-light">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-admin-sidebar rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-admin-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-admin-text-light">Customer</p>
                      <p className="font-semibold text-admin-text text-xs sm:text-sm truncate">{order.users?.full_name || order.guest_name || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-admin-sidebar rounded-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-admin-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-admin-text-light">Amount</p>
                      <p className="font-semibold text-admin-text text-xs sm:text-sm">₹{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-admin-sidebar rounded-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-admin-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-admin-text-light">Payment</p>
                      <p className="font-semibold text-admin-text text-xs sm:text-sm">{order.payment_method === 'cod' ? 'COD' : 'Online'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-admin-sidebar rounded-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-admin-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-admin-text-light">Items</p>
                      <p className="font-semibold text-admin-text text-xs sm:text-sm">{order.order_items.length}</p>
                    </div>
                  </div>
                </div>

                {editingOrder === order.id ? (
                  <div className="border-t border-admin-border pt-4 mt-4">
                    <h4 className="font-semibold text-admin-text mb-4 text-sm sm:text-base">Update Order</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Tracking Number</label>
                        <input
                          type="text"
                          value={editForm.tracking_number}
                          onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                          placeholder="Enter tracking number"
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-admin-text mb-2">Estimated Delivery</label>
                        <input
                          type="date"
                          value={editForm.estimated_delivery}
                          onChange={(e) => setEditForm({ ...editForm, estimated_delivery: e.target.value })}
                          className="w-full p-2 border border-admin-border rounded-lg bg-admin-background text-admin-text text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateOrder(order.id)}
                        className="px-4 py-2 bg-admin-success text-white rounded-lg hover:bg-admin-success/80 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-sidebar transition-colors text-admin-text text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-sidebar transition-colors text-admin-text text-sm"
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{selectedOrder === order.id ? 'Hide' : 'View'} Details</span>
                      {selectedOrder === order.id ? <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/80 transition-colors text-sm"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Update</span>
                    </button>
                  </div>
                )}

                {selectedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-admin-border pt-4 mt-4"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2 text-sm sm:text-base">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Customer Information</span>
                        </h4>
                        <div className="bg-admin-sidebar p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                          <p className="text-admin-text"><strong>Name:</strong> {order.users?.full_name || order.guest_name || 'Guest'}</p>
                          <p className="text-admin-text break-all"><strong>Email:</strong> {order.users?.email || order.guest_email || 'N/A'}</p>
                          <p className="text-admin-text"><strong>Phone:</strong> {order.users?.phone || order.guest_phone || 'N/A'}</p>
                          {!order.users && <p className="text-sm text-admin-warning mt-2">(Guest Order)</p>}
                        </div>

                        <h4 className="font-semibold text-admin-text mb-3 mt-4 flex items-center space-x-2 text-sm sm:text-base">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Shipping Address</span>
                        </h4>
                        <div className="bg-admin-sidebar p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                          <p className="text-admin-text">{order.shipping_address.full_name}</p>
                          <p className="text-admin-text">{order.shipping_address.address_line_1}</p>
                          {order.shipping_address.address_line_2 && (
                            <p className="text-admin-text">{order.shipping_address.address_line_2}</p>
                          )}
                          <p className="text-admin-text">
                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                          </p>
                          <p className="text-admin-text">Phone: {order.shipping_address.phone}</p>
                        </div>

                        {order.status === 'cancelled' && order.cancellation_reason && (
                          <>
                            <h4 className="font-semibold text-admin-text mb-3 mt-4 flex items-center space-x-2 text-sm sm:text-base">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-admin-danger" />
                              <span>Cancellation Reason</span>
                            </h4>
                            <div className="bg-admin-danger/10 border border-admin-danger/30 p-3 sm:p-4 rounded-lg">
                              <p className="text-admin-text text-sm sm:text-base">{order.cancellation_reason}</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-admin-text mb-3 flex items-center space-x-2 text-sm sm:text-base">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Order Items</span>
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-admin-sidebar rounded-lg">
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-admin-text text-sm sm:text-base truncate">{item.product.name}</h5>
                                <p className="text-xs sm:text-sm text-admin-text-light">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-admin-text text-sm sm:text-base">₹{Number(item.price).toLocaleString()}</p>
                                <p className="text-xs sm:text-sm text-admin-text-light">per item</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
