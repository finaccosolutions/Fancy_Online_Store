// src/pages/admin/AdminCategories.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, ArrowLeft, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSupabaseCategories, Category } from '../../hooks/useSupabaseCategories';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal'; // NEW: Import ConfirmationModal

interface CategoryForm {
  name: string;
  image_url: string;
  description: string;
}

const AdminCategories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useSupabaseCategories();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const openModal = (category?: Category) => {
    setEditingCategory(category || null);
    if (category) {
      reset({
        name: category.name,
        image_url: category.image_url || '',
        description: category.description || ''
      });
    } else {
      reset({
        name: '',
        image_url: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data: CategoryForm) => {
    setIsLoading(true);
    let result;

    if (editingCategory) {
      result = await updateCategory(editingCategory.id, data.name, data.image_url, data.description);
    } else {
      result = await createCategory(data.name, data.image_url, data.description);
    }

    if (result.error) {
      showToast(result.error.message, 'error');
    } else {
      showToast(`Category ${editingCategory ? 'updated' : 'added'} successfully!`, 'success');
      closeModal();
    }
    setIsLoading(false);
  };

  // MODIFIED: handleDelete to open confirmation modal
  const handleDelete = (categoryId: string, categoryName: string) => {
    setCategoryToDeleteId(categoryId);
    setCategoryToDeleteName(categoryName);
    setIsConfirmModalOpen(true);
  };

  // NEW: confirmDelete function
  const confirmDelete = async () => {
    if (categoryToDeleteId) {
      setIsLoading(true);
      setIsConfirmModalOpen(false); // Close modal immediately
      const result = await deleteCategory(categoryToDeleteId);
      if (result.error) {
        showToast(result.error.message, 'error');
      } else {
        showToast('Category deleted successfully!', 'success');
      }
      setIsLoading(false);
      setCategoryToDeleteId(null); // Clear the ID after deletion attempt
      setCategoryToDeleteName(null);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setCategoryToDeleteId(null);
    setCategoryToDeleteName(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-admin-card rounded-xl shadow-lg">
          <p className="text-red-500 text-lg">{error}</p>
          <p className="text-admin-text-light mt-2">Please ensure you have admin privileges and the categories table is set up correctly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      {/* Header */}
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-admin-text">Category Management</h1>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-5 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Category</span>
          </button>
        </div>
      </header>

      {/* Categories List */}
      <div className="bg-admin-card rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-admin-text mb-6">All Categories</h2>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-admin-text-light">
            <Tag className="h-12 w-12 mx-auto mb-4" />
            <p>No categories found. Add your first category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-admin-sidebar rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-lg font-semibold text-admin-text">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-admin-text-light mt-1 line-clamp-2">{category.description}</p>
                  )}
                  <p className="text-xs text-admin-text-light mt-2">ID: {category.id.substring(0, 8)}...</p>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => openModal(category)}
                      className="flex-1 p-2 bg-admin-primary/20 text-admin-primary rounded hover:bg-admin-primary/30 transition-colors text-sm font-medium"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="flex-1 p-2 bg-admin-danger/20 text-admin-danger rounded hover:bg-admin-danger/30 transition-colors text-sm font-medium"
                      title="Delete Category"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-admin-card rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-admin-text">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-admin-sidebar rounded-full transition-colors text-admin-text-light"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Category Name *
                  </label>
                  <input
                    {...register('name', { required: 'Category name is required' })}
                    className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    placeholder="e.g., Luxury, Fresh"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Category Image URL
                  </label>
                  <input
                    {...register('image_url')}
                    className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-dark mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    placeholder="Category description"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 border border-admin-border text-admin-text-light rounded-lg hover:bg-admin-sidebar transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Confirmation Modal for Category Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the category "${categoryToDeleteName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminCategories;
