import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../hooks/useAddresses';
import { useToast } from '../context/ToastContext';
import AddressForm from '../components/AddressForm';
import ConfirmationModal from '../components/ConfirmationModal';

const Addresses: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const { showToast } = useToast();

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddressToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (addressToDelete) {
      const { error } = await deleteAddress(addressToDelete);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Address deleted successfully!', 'success');
      }
    }
    setDeleteModalOpen(false);
    setAddressToDelete(null);
  };

  const handleSetDefault = async (id: string) => {
    const { error } = await setDefaultAddress(id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Default address updated!', 'success');
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingAddress) {
      const { error } = await updateAddress(editingAddress.id, data);
      if (error) {
        showToast(error.message, 'error');
        return false;
      } else {
        showToast('Address updated successfully!', 'success');
      }
    } else {
      const { error } = await addAddress(data);
      if (error) {
        showToast(error.message, 'error');
        return false;
      } else {
        showToast('Address added successfully!', 'success');
      }
    }
    setIsFormOpen(false);
    setEditingAddress(null);
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
              <p className="text-gray-600">Manage your delivery addresses</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Address</span>
            </motion.button>
          </div>
        </motion.div>

        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <MapPin className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Addresses Yet</h2>
            <p className="text-gray-600 mb-8">Add your delivery address to get started</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Address
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  address.is_default ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600/10 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{address.title}</h3>
                        {address.is_default && (
                          <span className="inline-flex items-center space-x-1 text-xs text-blue-600 font-medium">
                            <Check className="h-3 w-3" />
                            <span>Default Address</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-700 mb-4">
                    <p className="font-medium">{address.full_name}</p>
                    <p className="text-sm">{address.address_line_1}</p>
                    {address.address_line_2 && <p className="text-sm">{address.address_line_2}</p>}
                    <p className="text-sm">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-sm">{address.country}</p>
                    <p className="text-sm font-medium">Phone: {address.phone}</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600/10 transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
              </div>
              <div className="p-6">
                <AddressForm
                  address={editingAddress}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingAddress(null);
                  }}
                  isSubmitting={false}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
      />
    </div>
  );
};

export default Addresses;
