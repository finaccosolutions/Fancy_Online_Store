import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Star, CheckCircle, XCircle, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_image_url?: string;
  rating: number;
  testimonial_text: string;
  product_purchased?: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_image_url: '',
    rating: 5,
    testimonial_text: '',
    product_purchased: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm, filterApproved]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      showToast('Failed to load testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = testimonials;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.testimonial_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterApproved === 'approved') {
      filtered = filtered.filter(t => t.is_approved);
    } else if (filterApproved === 'pending') {
      filtered = filtered.filter(t => !t.is_approved);
    }

    setFilteredTestimonials(filtered);
  };

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      setFormData({
        customer_name: testimonial.customer_name,
        customer_email: testimonial.customer_email,
        customer_image_url: testimonial.customer_image_url || '',
        rating: testimonial.rating,
        testimonial_text: testimonial.testimonial_text,
        product_purchased: testimonial.product_purchased || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_image_url: '',
        rating: 5,
        testimonial_text: '',
        product_purchased: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.customer_name.trim() || !formData.testimonial_text.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_image_url: formData.customer_image_url,
            rating: formData.rating,
            testimonial_text: formData.testimonial_text,
            product_purchased: formData.product_purchased,
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('Testimonial updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([{
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_image_url: formData.customer_image_url,
            rating: formData.rating,
            testimonial_text: formData.testimonial_text,
            product_purchased: formData.product_purchased,
            display_order: testimonials.length,
          }]);

        if (error) throw error;
        showToast('Testimonial created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      showToast('Failed to save testimonial', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Testimonial deleted successfully', 'success');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      showToast('Failed to delete testimonial', 'error');
    }
  };

  const toggleApproved = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      showToast('Failed to update testimonial status', 'error');
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating featured status:', error);
      showToast('Failed to update featured status', 'error');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-admin-text-light'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-admin-text-dark">Testimonials</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Testimonial</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
          />
        </div>

        <select
          value={filterApproved}
          onChange={(e) => setFilterApproved(e.target.value as any)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Testimonials</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <div className="text-admin-text-light text-right py-2">
          {filteredTestimonials.length} testimonials
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 bg-admin-card rounded-lg">
          <p className="text-admin-text-light">No testimonials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredTestimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-admin-card border border-admin-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {testimonial.customer_image_url && (
                        <img
                          src={testimonial.customer_image_url}
                          alt={testimonial.customer_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-admin-text-dark">{testimonial.customer_name}</h3>
                        <p className="text-sm text-admin-text-light">{testimonial.customer_email}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="text-admin-text-light mb-2 line-clamp-2">{testimonial.testimonial_text}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {testimonial.product_purchased && (
                        <span className="inline-block px-2 py-1 bg-admin-primary/10 text-admin-primary text-xs rounded">
                          {testimonial.product_purchased}
                        </span>
                      )}
                      {!testimonial.is_approved && (
                        <span className="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs rounded">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleApproved(testimonial.id, testimonial.is_approved)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors"
                      title={testimonial.is_approved ? 'Disapprove' : 'Approve'}
                    >
                      {testimonial.is_approved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-admin-text-light" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors"
                      title={testimonial.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      {testimonial.is_featured ? (
                        <Zap className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-admin-text-light" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(testimonial)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
                {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="Enter customer email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Customer Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.customer_image_url}
                    onChange={(e) => setFormData({ ...formData, customer_image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Rating
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
                    >
                      {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Product Purchased
                    </label>
                    <input
                      type="text"
                      value={formData.product_purchased}
                      onChange={(e) => setFormData({ ...formData, product_purchased: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="Product name (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Testimonial Text
                  </label>
                  <textarea
                    value={formData.testimonial_text}
                    onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary resize-none"
                    placeholder="Enter the testimonial text"
                  />
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

export default AdminTestimonials;
