import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, DollarSign, MapPin, Eye, XCircle, Truck, CheckCircle, Clock, Phone, Mail, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Link } from 'react-router-dom';
import { downloadInvoice, InvoiceData } from '../utils/invoiceGenerator';
import CancelOrderModal from '../components/CancelOrderModal';

interface OrderTracking {
  id: string;
  status: string;
  location: string | null;
  description: string;
  created_at: string;
}

interface Order {
  id: string;
  invoice_number: string;
  total_amount: number;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  shipping_charges: number;
  discount_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
  billing_address?: any;
  billing_same_as_delivery?: boolean;
  tracking_number: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    gst_percentage: number;
    gst_amount: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      image_url: string;
    };
  }[];
  order_tracking?: OrderTracking[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingExpanded, setTrackingExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { user, loading: authLoading, userProfile } = useAuth();
  const { showToast } = useToast();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setOrders([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          invoice_number,
          total_amount,
          subtotal,
          cgst_amount,
          sgst_amount,
          igst_amount,
          shipping_charges,
          discount_amount,
          status,
          payment_method,
          payment_status,
          shipping_address,
          billing_address,
          billing_same_as_delivery,
          tracking_number,
          estimated_delivery,
          cancellation_reason,
          created_at,
          order_items (
            id,
            quantity,
            price,
            gst_percentage,
            gst_amount,
            subtotal,
            product:products (
              id,
              name,
              image_url
            )
          ),
          order_tracking (
            id,
            status,
            location,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching orders (caught exception):', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleCancelOrder = async (reasonType: string, reasonText: string) => {
    if (!orderToCancel || !user) {
      console.error('Cannot cancel order: missing order or user');
      showToast('Unable to cancel order. Please try again.', 'error');
      return;
    }

    console.log('Cancelling order:', {
      orderId: orderToCancel.id,
      userId: user.id,
      reasonType,
      reasonText
    });

    try {
      const { data: updateData, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: reasonText,
          cancellation_reason_type: reasonType
        })
        .eq('id', orderToCancel.id)
        .eq('user_id', user.id)
        .select();

      console.log('Order update result:', { updateData, orderError });

      if (orderError) {
        console.error('Error updating order:', orderError);
        showToast(`Failed to cancel order: ${orderError.message}`, 'error');
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.error('No order was updated - order not found or permission denied');
        showToast('Order not found or you do not have permission to cancel it', 'error');
        return;
      }

      const { data: reasonData, error: reasonError } = await supabase
        .from('order_cancellation_reasons')
        .insert({
          order_id: orderToCancel.id,
          reason_type: reasonType.toLowerCase().replace(/ /g, '_'),
          custom_reason: reasonType === 'Other' ? reasonText : null
        })
        .select();

      console.log('Cancellation reason insert result:', { reasonData, reasonError });

      if (reasonError) {
        console.error('Failed to insert cancellation reason:', reasonError);
      }

      showToast('Order cancelled successfully', 'success');
      setCancelModalOpen(false);
      setOrderToCancel(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('An unexpected error occurred while cancelling the order', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleDownloadInvoice = async (order: Order) => {
    const totalTax = (order.cgst_amount || 0) + (order.sgst_amount || 0) + (order.igst_amount || 0);

    // Fetch product details with HSN codes
    const productIds = order.order_items.map(item => item.product.id);
    const { data: products } = await supabase
      .from('products')
      .select('id, hsn_code')
      .in('id', productIds);

    const productHSNMap = new Map(products?.map(p => [p.id, p.hsn_code]) || []);

    // Get customer GSTIN from billing or shipping address
    const billingAddress = order.billing_address || order.shipping_address;
    const customerGSTIN = billingAddress?.gstin || billingAddress?.gstin || undefined;

    const invoiceData: InvoiceData = {
      invoiceNumber: order.invoice_number || `INV-${order.id.slice(-8).toUpperCase()}`,
      orderDate: order.created_at,
      customerName: userProfile?.full_name || 'Customer',
      customerAddress: billingAddress || order.shipping_address,
      customerGSTIN: customerGSTIN,
      items: order.order_items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        gst_percentage: item.gst_percentage || 18,
        gst_amount: item.gst_amount || 0,
        subtotal: item.subtotal || (item.price * item.quantity),
        hsn_code: productHSNMap.get(item.product.id)
      })),
      subtotal: order.subtotal || 0,
      cgst: order.cgst_amount,
      sgst: order.sgst_amount,
      igst: order.igst_amount,
      totalTax: totalTax,
      shippingCharges: order.shipping_charges || 0,
      discount: order.discount_amount || 0,
      total: order.total_amount,
      businessDetails: settings,
    };

    downloadInvoice(invoiceData);
    showToast('Generating invoice...', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'confirmed':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
            >
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>

          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  statusFilter === filter.value
                    ? 'bg-[#815536] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#815536] hover:text-[#815536]'
                }`}
              >
                {filter.label} ({statusCounts[filter.value as keyof typeof statusCounts]})
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#815536] p-3 rounded-lg">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Tracking Number: {order.tracking_number}
                      </span>
                    </div>
                    {order.estimated_delivery && (
                      <p className="text-sm text-blue-700 mt-1 ml-6">
                        Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-[#815536]" />
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#815536]" />
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-[#815536]" />
                    <div>
                      <p className="text-xs text-gray-600">Payment Status</p>
                      <p className="font-semibold text-gray-900">
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Tracking Timeline */}
                {order.order_tracking && order.order_tracking.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setTrackingExpanded(trackingExpanded === order.id ? null : order.id)}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-[#815536]" />
                        <span className="font-medium text-gray-900">Track Order</span>
                      </div>
                      {trackingExpanded === order.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {trackingExpanded === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pl-4 border-l-2 border-[#815536]"
                        >
                          {[...order.order_tracking].reverse().map((tracking, idx) => (
                            <div key={tracking.id} className="mb-4 pl-4 relative">
                              <div className="absolute -left-6 top-1 w-4 h-4 bg-[#815536] rounded-full border-4 border-white"></div>
                              <div className="text-sm">
                                <p className="font-semibold text-gray-900">{tracking.description}</p>
                                {tracking.location && (
                                  <p className="text-gray-600 mt-1">Location: {tracking.location}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(tracking.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{selectedOrder === order.id ? 'Hide' : 'View'} Details</span>
                  </button>

                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center space-x-2 px-4 py-2 border border-[#815536] text-[#815536] rounded-lg hover:bg-[#815536]/10 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Invoice</span>
                    </button>
                  )}

                  {canCancelOrder(order) && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  <a
                    href="mailto:orders@veloratradings.com"
                    className="flex items-center space-x-2 px-4 py-2 border border-[#815536] text-[#815536] rounded-lg hover:bg-[#815536]/10 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Contact Support</span>
                  </a>

                  <a
                    href="tel:+919876543210"
                    className="flex items-center space-x-2 px-4 py-2 border border-[#815536] text-[#815536] rounded-lg hover:bg-[#815536]/10 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Us</span>
                  </a>
                </div>

                <AnimatePresence>
                  {selectedOrder === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t pt-4 mt-4"
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">per item</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-gray-700">
                          <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                          <p>{order.shipping_address.address}</p>
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                          <p>Phone: {order.shipping_address.phone}</p>
                        </div>
                      </div>

                      {order.cancellation_reason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">Cancellation Reason</h4>
                          <p className="text-red-700">{order.cancellation_reason}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleCancelOrder}
        orderNumber={orderToCancel?.id.slice(-8).toUpperCase() || ''}
      />
    </div>
  );
};

export default Orders;
