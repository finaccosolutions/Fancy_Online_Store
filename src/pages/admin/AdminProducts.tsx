// src/pages/admin/AdminProducts.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, Filter, ArrowLeft, Save, X,
  Package, DollarSign, Tag, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSupabaseProducts } from '../../hooks/useSupabaseProducts';
import { useSupabaseCategories } from '../../hooks/useSupabaseCategories';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal'; // NEW: Import ConfirmationModal

interface ProductForm {
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  in_stock: boolean;
  features: string;
  ingredients: string;
  stock_quantity: number;
  rating: number;
  reviews_count: number;
  gst_percentage: number;
  hsn_code: string;
  price_inclusive_of_tax: boolean;
  default_delivery_days: number;
}

const AdminProducts: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // NEW: State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [productToDeleteName, setProductToDeleteName] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const { products, categories: productFilterCategories, createProduct, updateProduct, deleteProduct, fetchProducts } = useSupabaseProducts();
  const { categories: allCategories, loading: categoriesLoading } = useSupabaseCategories();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || product.category_name === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      const categoryId = allCategories.find(cat => cat.name === product.category_name)?.id || '';
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        category: categoryId,
        in_stock: product.in_stock,
        features: product.features?.join(', ') || '',
        ingredients: product.ingredients ? product.ingredients.join(', ') : '',
        stock_quantity: product.stock_quantity || 0,
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        gst_percentage: product.gst_percentage || 18,
        hsn_code: product.hsn_code || '',
        price_inclusive_of_tax: product.price_inclusive_of_tax || false,
        default_delivery_days: product.default_delivery_days || 7,
      });
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        description: '',
        price: 0,
        original_price: null,
        image_url: '',
        category: '',
        in_stock: true,
        features: '',
        ingredients: '',
        stock_quantity: 0,
        rating: 0,
        reviews_count: 0,
        gst_percentage: 18,
        hsn_code: '',
        price_inclusive_of_tax: false,
        default_delivery_days: 7,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data: ProductForm) => {
    const currentProductId = editingProduct?.id;
    const isUpdate = !!currentProductId;

    setIsLoading(true);

    const selectedCategory = allCategories.find(cat => cat.id === data.category);
    const categoryName = selectedCategory?.name || '';

    const productData = {
      ...data,
      category: categoryName,
      category_id: data.category,
      features: data.features.split(',').map(f => f.trim()).filter(f => f),
      ingredients: data.ingredients ? data.ingredients.split(',').map(i => i.trim()).filter(i => i) : null,
      original_price: data.original_price || null,
      stock_quantity: data.stock_quantity,
      rating: data.rating,
      reviews_count: data.reviews_count,
      gst_percentage: data.gst_percentage || 18,
      hsn_code: data.hsn_code || '',
      price_inclusive_of_tax: data.price_inclusive_of_tax || false,
      default_delivery_days: data.default_delivery_days || 7,
    };

    try {
      let result;
      if (isUpdate && currentProductId) {
        console.log('Updating product:', currentProductId, productData);
        result = await updateProduct(currentProductId, productData);
      } else {
        console.log('Creating product:', productData);
        result = await createProduct(productData);
      }

      if (result.error) {
        throw result.error;
      }

      showToast(`Product ${isUpdate ? 'updated' : 'added'} successfully!`, 'success');
      closeModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast(error.message || 'Failed to save product.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // MODIFIED: handleDelete to open confirmation modal
  const handleDelete = (productId: string, productName: string) => {
    setProductToDeleteId(productId);
    setProductToDeleteName(productName);
    setIsConfirmModalOpen(true);
  };

  // NEW: confirmDelete function
  const confirmDelete = async () => {
    if (productToDeleteId) {
      setIsLoading(true);
      setIsConfirmModalOpen(false); // Close modal immediately
      const result = await deleteProduct(productToDeleteId);
      if (result.error) {
        showToast(result.error.message || 'Failed to delete product.', 'error');
      } else {
        showToast('Product deleted successfully!', 'success');
      }
      setIsLoading(false);
      setProductToDeleteId(null);
      setProductToDeleteName(null);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProductToDeleteId(null);
    setProductToDeleteName(null);
  };

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      {/* Header */}
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-admin-text">Product Management</h1>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-5 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-light h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
        >
          {productFilterCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-admin-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => openModal(product)}
                  className="p-2 bg-admin-sidebar rounded-full shadow-md hover:bg-admin-border transition-colors text-admin-text-light"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)} // MODIFIED: Pass product name
                  className="p-2 bg-admin-danger/20 text-admin-danger rounded-full hover:bg-admin-danger/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {!product.in_stock && (
                <div className="absolute top-2 left-2 bg-admin-danger text-white px-2 py-1 rounded text-xs font-semibold">
                  Out of Stock
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-admin-text mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-admin-text-light text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-bold text-admin-primary">₹{product.price}</span>
                  {product.original_price && (
                    <span className="text-sm text-admin-text-light line-through ml-2">₹{product.original_price}</span>
                  )}
                </div>
                <span className="text-xs bg-admin-secondary/20 text-admin-secondary px-2 py-1 rounded-full">
                  {product.category_name}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-admin-text-light">
                <span>Rating: {product.rating}/5</span>
                <span>{product.reviews_count} reviews</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-admin-text-light">
          <Package className="h-12 w-12 mx-auto mb-4" />
          <p>No products found</p>
        </div>
      )}

      {/* Product Modal */}
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
              className="bg-admin-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" // MODIFIED: max-w-3xl for wider modal
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-admin-text">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-admin-sidebar rounded-full transition-colors text-admin-text-light"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Product Name *
                      </label>
                      <input
                        {...register('name', { required: 'Product name is required' })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Category *
                      </label>
                      {categoriesLoading ? (
                        <p className="text-admin-text-light">Loading categories...</p>
                      ) : (
                        <select
                          {...register('category', { required: 'Category is required' })}
                          className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        >
                          <option value="">Select a category</option>
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Enter product description"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('price', {
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        MRP (₹) {/* MODIFIED: Label changed to MRP */}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('original_price', {
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0.00 (optional)"
                      />
                      {errors.original_price && (
                        <p className="text-red-500 text-sm mt-1">{errors.original_price.message}</p>
                      )}
                      {/* NEW: Display discount percentage */}
                      {editingProduct && editingProduct.original_price && editingProduct.price && editingProduct.original_price > editingProduct.price && (
                        <p className="text-sm text-admin-text-light mt-1">
                          Discount: {Math.round(((editingProduct.original_price - editingProduct.price) / editingProduct.original_price) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Image URL *
                    </label>
                    <input
                      {...register('image_url', { required: 'Image URL is required' })}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image_url && (
                      <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
                      )}
                  </div>

                  {/* NEW: Stock Quantity, Rating, Reviews Count */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...register('stock_quantity', {
                          required: 'Stock quantity is required',
                          min: { value: 0, message: 'Quantity cannot be negative' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0"
                      />
                      {errors.stock_quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.stock_quantity.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Rating (0-5) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('rating', {
                          required: 'Rating is required',
                          min: { value: 0, message: 'Rating must be between 0 and 5' },
                          max: { value: 5, message: 'Rating must be between 0 and 5' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0.0"
                      />
                      {errors.rating && (
                        <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Reviews Count *
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...register('reviews_count', {
                          required: 'Reviews count is required',
                          min: { value: 0, message: 'Reviews count cannot be negative' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="0"
                      />
                      {errors.reviews_count && (
                        <p className="text-red-500 text-sm mt-1">{errors.reviews_count.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        GST Percentage (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('gst_percentage', {
                          required: 'GST percentage is required',
                          min: { value: 0, message: 'GST cannot be negative' },
                          max: { value: 100, message: 'GST cannot exceed 100%' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="18"
                      />
                      {errors.gst_percentage && (
                        <p className="text-red-500 text-sm mt-1">{errors.gst_percentage.message}</p>
                      )}
                      <p className="text-xs text-admin-text-light mt-1">Common rates: 0%, 5%, 12%, 18%, 28%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        HSN/SAC Code
                      </label>
                      <input
                        {...register('hsn_code')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="3303 (for perfumes)"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Harmonized System of Nomenclature code</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Features (comma-separated)
                    </label>
                    <input
                      {...register('features')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Long-lasting, Premium bottle, Gift box included"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">
                      Ingredients (comma-separated)
                    </label>
                    <input
                      {...register('ingredients')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      placeholder="Bergamot, Rose, Sandalwood"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('in_stock')}
                        className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-admin-border rounded"
                      />
                      <label className="ml-2 block text-sm text-admin-text">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('price_inclusive_of_tax')}
                        className="h-4 w-4 text-admin-primary focus:ring-admin-primary border-admin-border rounded"
                      />
                      <label className="ml-2 block text-sm text-admin-text">
                        Price Inclusive of Tax
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">
                        Default Delivery Days
                      </label>
                      <input
                        type="number"
                        step="1"
                        {...register('default_delivery_days', {
                          required: 'Delivery days required',
                          min: { value: 1, message: 'Must be at least 1 day' }
                        })}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-sidebar text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="7"
                      />
                      {errors.default_delivery_days && (
                        <p className="text-red-500 text-sm mt-1">{errors.default_delivery_days.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-admin-border text-admin-text-light rounded-lg hover:bg-admin-sidebar transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Confirmation Modal for Product Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the product "${productToDeleteName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminProducts;
