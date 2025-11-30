import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Copy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_usage?: number;
  current_usage: number;
  min_purchase_amount: number;
  max_purchase_amount?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  applicable_to: string;
  created_at: string;
}

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as const,
    discount_value: 0,
    max_usage: 0,
    min_purchase_amount: 0,
    max_purchase_amount: 0,
    valid_from: '',
    valid_until: '',
    applicable_to: 'all',
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchTerm, filterActive]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = () => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(c => c.is_active);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(c => !c.is_active);
    }

    setFilteredCoupons(filtered);
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_usage: coupon.max_usage || 0,
        min_purchase_amount: coupon.min_purchase_amount,
        max_purchase_amount: coupon.max_purchase_amount || 0,
        valid_from: coupon.valid_from?.split('T')[0] || '',
        valid_until: coupon.valid_until?.split('T')[0] || '',
        applicable_to: coupon.applicable_to,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        max_usage: 0,
        min_purchase_amount: 0,
        max_purchase_amount: 0,
        valid_from: '',
        valid_until: '',
        applicable_to: 'all',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    if (formData.discount_value <= 0) {
      showToast('Discount value must be greater than 0', 'error');
      return;
    }

    try {
      const data = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        max_usage: formData.max_usage || null,
        min_purchase_amount: formData.min_purchase_amount,
        max_purchase_amount: formData.max_purchase_amount || null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        applicable_to: formData.applicable_to,
      };

      if (editingId) {
        const { error } = await supabase
          .from('coupons')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Coupon updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([data]);

        if (error) throw error;
        showToast('Coupon created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      showToast('Failed to save coupon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Coupon deleted successfully', 'success');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('Failed to delete coupon', 'error');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      showToast('Failed to update coupon status', 'error');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Coupon code copied!', 'success');
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isUsageLimitExceeded = (coupon: Coupon) => {
    if (!coupon.max_usage) return false;
    return coupon.current_usage >= coupon.max_usage;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-admin-text-dark">Coupon Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Coupon</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
          />
        </div>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Coupons</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="text-admin-text-light text-right py-2">
          {filteredCoupons.length} coupons
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12 bg-admin-card rounded-lg">
          <p className="text-admin-text-light">No coupons found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-admin-text-dark">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-admin-text-dark">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-admin-text-dark">Usage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-admin-text-dark">Valid</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-admin-text-dark">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-admin-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCoupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-admin-border hover:bg-admin-background transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-admin-text-dark">{coupon.code}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyCouponCode(coupon.code)}
                          className="p-1 hover:bg-admin-card rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4 text-admin-text-light" />
                        </motion.button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-admin-text">
                      {coupon.discount_value}
                      {coupon.discount_type === 'percentage' ? '%' : ' ₹'}
                    </td>
                    <td className="px-4 py-3 text-admin-text-light text-sm">
                      {coupon.current_usage}
                      {coupon.max_usage ? ` / ${coupon.max_usage}` : ' / ∞'}
                    </td>
                    <td className="px-4 py-3 text-admin-text-light text-sm">
                      {coupon.valid_until ? (
                        <div>
                          {format(new Date(coupon.valid_until), 'MMM dd')}
                          {isExpired(coupon) && (
                            <span className="ml-2 inline-block px-2 py-1 bg-admin-danger/10 text-admin-danger text-xs rounded">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        'No expiry'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!coupon.is_active && (
                          <span className="inline-block px-2 py-1 bg-admin-danger/10 text-admin-danger text-xs rounded">
                            Inactive
                          </span>
                        )}
                        {isUsageLimitExceeded(coupon) && (
                          <span className="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs rounded">
                            Usage Full
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleActive(coupon.id, coupon.is_active)}
                          className="p-2 rounded-lg hover:bg-admin-background transition-colors"
                        >
                          {coupon.is_active ? (
                            <Eye className="h-4 w-4 text-admin-text-light" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-admin-danger" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-admin-card border border-admin-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-admin-text-dark mb-4">
                {editingId ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="e.g., SAVE20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="e.g., 20% off on all products"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Max Usage (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formData.max_usage}
                      onChange={(e) => setFormData({ ...formData, max_usage: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Min Purchase Amount
                    </label>
                    <input
                      type="number"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData({ ...formData, min_purchase_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-admin-border text-admin-text rounded-lg hover:bg-admin-background transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;
