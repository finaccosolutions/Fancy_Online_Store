import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Address } from '../hooks/useAddresses';
import { INDIAN_STATES } from '../data/indianStates';

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSubmit, onCancel, isSubmitting }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      is_default: false,
      is_gst_registered: false,
      gstin: '',
      address_type: 'delivery'
    }
  });

  const isGstRegistered = watch('is_gst_registered');

  useEffect(() => {
    if (address) {
      reset({
        title: address.title || '',
        full_name: address.full_name || '',
        phone: address.phone || '',
        address_line_1: address.address_line_1 || '',
        address_line_2: address.address_line_2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country: address.country || 'India',
        is_default: address.is_default || false,
        is_gst_registered: address.is_gst_registered || false,
        gstin: address.gstin || '',
        address_type: address.address_type || 'delivery'
      });
    }
  }, [address, reset]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title', { required: 'Address title is required' })}
              placeholder="e.g., Home, Office"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">{errors.full_name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                placeholder="10-digit mobile number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('address_line_1', { required: 'Address is required' })}
              placeholder="House No., Building Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
            />
            {errors.address_line_1 && (
              <p className="text-red-500 text-sm mt-1">{errors.address_line_1.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              {...register('address_line_2')}
              placeholder="Road Name, Area, Colony"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                {...register('state', { required: 'State is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                {...register('postal_code', {
                  required: 'PIN code is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'Please enter a valid 6-digit PIN code'
                  }
                })}
                placeholder="6-digit PIN"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
              />
              {errors.postal_code && (
                <p className="text-red-500 text-sm mt-1">{errors.postal_code.message as string}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_default')}
              className="w-4 h-4 text-[#815536] border-gray-300 rounded focus:ring-[#815536]"
            />
            <label className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                {...register('is_gst_registered')}
                className="w-4 h-4 text-[#815536] border-gray-300 rounded focus:ring-[#815536]"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                GST Registered Customer
              </label>
            </div>

            {isGstRegistered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN (GST Identification Number)
                </label>
                <input
                  {...register('gstin', {
                    pattern: {
                      value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: 'Please enter a valid 15-character GSTIN'
                    }
                  })}
                  placeholder="e.g., 27AAPFU0939F1ZV"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent uppercase"
                  maxLength={15}
                />
                {errors.gstin && (
                  <p className="text-red-500 text-sm mt-1">{errors.gstin.message as string}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">15-character GST Identification Number</p>
              </motion.div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="flex-1 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
            </motion.button>
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddressForm;
