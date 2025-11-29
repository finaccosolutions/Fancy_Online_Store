import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HeroImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const AdminHeroCarousel: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchHeroImages();
  }, [isAdmin, navigate]);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_carousel_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setHeroImages(data || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      showToast('Failed to load hero carousel images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      showToast('Please enter an image URL', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const maxOrder = heroImages.length > 0 ? Math.max(...heroImages.map(img => img.display_order)) : 0;

      const { error } = await supabase
        .from('hero_carousel_images')
        .insert({
          image_url: newImageUrl.trim(),
          display_order: maxOrder + 1,
          is_active: true,
        });

      if (error) throw error;

      showToast('Hero image added successfully', 'success');
      setNewImageUrl('');
      await fetchHeroImages();
    } catch (error) {
      console.error('Error adding image:', error);
      showToast('Failed to add hero image', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Hero image deleted successfully', 'success');
      await fetchHeroImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Failed to delete hero image', 'error');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_carousel_images')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      showToast(isActive ? 'Hero image hidden' : 'Hero image shown', 'success');
      await fetchHeroImages();
    } catch (error) {
      console.error('Error toggling image:', error);
      showToast('Failed to update hero image', 'error');
    }
  };

  const handleReorder = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= heroImages.length) return;

    try {
      const newOrder = [...heroImages];
      const [movedItem] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, movedItem);

      const updates = newOrder.map((img, idx) => ({
        id: img.id,
        display_order: idx,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('hero_carousel_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      showToast('Hero images reordered successfully', 'success');
      await fetchHeroImages();
    } catch (error) {
      console.error('Error reordering:', error);
      showToast('Failed to reorder hero images', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hero Carousel</h1>
          <p className="text-gray-600">Manage the hero section carousel images displayed on the home page</p>
        </div>

        {/* Add New Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Hero Image</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddImage}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Images List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading hero images...</p>
          </div>
        ) : heroImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No hero carousel images yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heroImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
              >
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>

                <img
                  src={image.image_url}
                  alt={`Hero ${idx + 1}`}
                  className="w-32 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Hero Image {idx + 1}</p>
                  <p className="text-xs text-gray-500 truncate">{image.image_url}</p>
                </div>

                <div className="flex items-center gap-2">
                  {idx > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReorder(idx, idx - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Move up"
                    >
                      ↑
                    </motion.button>
                  )}

                  {idx < heroImages.length - 1 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReorder(idx, idx + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Move down"
                    >
                      ↓
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleActive(image.id, image.is_active)}
                    className={`p-2 rounded transition-colors ${
                      image.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={image.is_active ? 'Hide' : 'Show'}
                  >
                    {image.is_active ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHeroCarousel;
