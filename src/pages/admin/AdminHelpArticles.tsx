import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  display_order: number;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

const AdminHelpArticles: React.FC = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'general',
    subcategory: '',
  });
  const { showToast } = useToast();

  const categories = ['general', 'shipping', 'returns', 'payments', 'products', 'accounts'];

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory, filterPublished]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      showToast('Failed to load help articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (filterPublished === 'published') {
      filtered = filtered.filter(a => a.is_published);
    } else if (filterPublished === 'draft') {
      filtered = filtered.filter(a => !a.is_published);
    }

    setFilteredArticles(filtered);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenModal = (article?: HelpArticle) => {
    if (article) {
      setEditingId(article.id);
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
        subcategory: article.subcategory || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        category: 'general',
        subcategory: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('help_articles')
          .update({
            title: formData.title,
            slug,
            content: formData.content,
            category: formData.category,
            subcategory: formData.subcategory || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('Article updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('help_articles')
          .insert([{
            title: formData.title,
            slug,
            content: formData.content,
            category: formData.category,
            subcategory: formData.subcategory || null,
            display_order: articles.length,
          }]);

        if (error) throw error;
        showToast('Article created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      showToast('Failed to save article', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('help_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Article deleted successfully', 'success');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      showToast('Failed to delete article', 'error');
    }
  };

  const togglePublished = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('help_articles')
        .update({ is_published: !currentState })
        .eq('id', id);

      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error updating article status:', error);
      showToast('Failed to update article status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-admin-text-dark">Help Articles</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-admin-primary text-white px-4 py-2 rounded-lg hover:bg-admin-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Article</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-admin-text-light" />
          <input
            type="text"
            placeholder="Search articles..."
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

        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as any)}
          className="px-4 py-2 bg-admin-card border border-admin-border rounded-lg text-admin-text focus:outline-none focus:border-admin-primary"
        >
          <option value="all">All Articles</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <div className="text-admin-text-light text-right py-2">
          {filteredArticles.length} articles
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-admin-card rounded-lg">
          <p className="text-admin-text-light">No articles found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-admin-card border border-admin-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-admin-text-dark mb-2">{article.title}</h3>
                    <p className="text-admin-text-light text-sm mb-2 line-clamp-2">{article.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-2 py-1 bg-admin-primary/10 text-admin-primary text-xs rounded">
                        {article.category}
                      </span>
                      {article.subcategory && (
                        <span className="inline-block px-2 py-1 bg-admin-primary/5 text-admin-text-light text-xs rounded">
                          {article.subcategory}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 ml-auto text-admin-text-light text-xs">
                        <BarChart3 className="h-4 w-4" />
                        {article.views_count} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePublished(article.id, article.is_published)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors"
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {article.is_published ? (
                        <Eye className="h-4 w-4 text-admin-text-light" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-admin-danger" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(article)}
                      className="p-2 rounded-lg hover:bg-admin-background transition-colors text-admin-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(article.id)}
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
              className="bg-admin-card border border-admin-border rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-admin-text-dark mb-4">
                {editingId ? 'Edit Article' : 'Add New Article'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="Enter article title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                    placeholder="auto-generated from title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary"
                      placeholder="Optional subcategory"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 bg-admin-background border border-admin-border rounded-lg text-admin-text placeholder-admin-text-light focus:outline-none focus:border-admin-primary resize-none"
                    placeholder="Enter article content"
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

export default AdminHelpArticles;
