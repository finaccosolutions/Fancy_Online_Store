import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
  });
  const { showToast } = useToast();

  const categories = ['general', 'shipping', 'returns', 'payments', 'products', 'accounts'];

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchTerm, selectedCategory]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      showToast('Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    setFilteredFaqs(filtered);
  };

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingId(faq.id);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      });
    } else {
      setEditingId(null);
      setFormData({
        question: '',
        answer: '',
        category: 'general',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('FAQ updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([{
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            display_order: faqs.length,
          }]);

        if (error) throw error;
        showToast('FAQ created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showToast('Failed to save FAQ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('FAQ deleted successfully', 'success');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showToast('Failed to delete FAQ', 'error');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      showToast('Failed to update FAQ status', 'error');
    }
  };

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    const newOrder = direction === 'up' ? faq.display_order - 1 : faq.display_order + 1;
    if (newOrder < 0 || newOrder >= faqs.length) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      showToast('Failed to update FAQ order', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-admin-text-dark">FAQ Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add FAQ</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>

        <div className="text-admin-text-light text-right py-2">
          {filteredFaqs.length} FAQs
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-admin-card rounded-lg">
          <p className="text-admin-text-light">No FAQs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-admin-card border border-admin-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-admin-text-dark mb-2">{faq.question}</h3>
                    <p className="text-admin-text-light text-sm mb-2 line-clamp-2">{faq.answer}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-admin-primary/10 text-admin-primary text-xs rounded">
                        {faq.category}
                      </span>
                      {!faq.is_active && (
                        <span className="inline-block px-2 py-1 bg-admin-danger/10 text-admin-danger text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleActive(faq.id, faq.is_active)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors"
                      title={faq.is_active ? 'Hide' : 'Show'}
                    >
                      {faq.is_active ? (
                        <Eye className="h-4 w-4 text-admin-text-light" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-admin-danger" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(faq)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>

                    <div className="flex items-center gap-1 ml-2 border-l border-admin-border pl-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => moveOrder(faq.id, 'up')}
                        className="p-1 rounded hover:bg-admin-background transition-colors"
                      >
                        <ChevronUp className="h-4 w-4 text-admin-text-light" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => moveOrder(faq.id, 'down')}
                        className="p-1 rounded hover:bg-admin-background transition-colors"
                      >
                        <ChevronDown className="h-4 w-4 text-admin-text-light" />
                      </motion.button>
                    </div>
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
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="Enter FAQ question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Answer
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary resize-none"
                    placeholder="Enter FAQ answer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
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

export default AdminFAQ;
