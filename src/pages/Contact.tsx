// src/pages/Contact.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useToast } from '../context/ToastContext'; // NEW: Import useToast

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { showToast } = useToast(); // NEW: Use useToast hook

  const onSubmit = (data: ContactForm) => {
    console.log('Contact form submitted:', data);
    // REMOVED: Local toast creation
    showToast('Message sent successfully! We\'ll get back to you soon.', 'success'); // NEW: Use global showToast
    reset();
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#815536] via-[#a67c52] to-[#c9baa8] overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-[#c9baa8] max-w-3xl mx-auto leading-relaxed">
              {settings.contactHeroSubtitle || 'Have questions about our fragrances? Need personalized recommendations? We\'re here to help you find your perfect scent.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reach out to us through any of these channels. We're always happy to help!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: MapPin,
                title: 'Visit Our Store',
                details: [
                  settings.contactAddressLine1 || 'Manjeri',
                  settings.contactAddressLine2 || 'Kerala',
                  settings.contactCity || 'Manjeri',
                  settings.contactCountry || 'India'
                ]
              },
              {
                icon: Phone,
                title: 'Call Us',
                details: [
                  settings.contactPhone1 || '+91 85 90000 761',
                  settings.contactPhone2 || '+91 97 45524 438',
                ]
              },
              {
                icon: Mail,
                title: 'Email Us',
                details: [
                  settings.contactEmail1 || 'info@trendybazar.com',
                  settings.contactEmail2 || 'support@trendybazar.com',
                  settings.contactEmail3 || 'orders@trendybazar.com',
                  'We reply within 24 hours'
                ]
              },
              {
                icon: Clock,
                title: 'Business Hours',
                details: [
                  settings.contactHoursMonFri || 'Monday - Friday: 10AM - 8PM',
                  settings.contactHoursSat || 'Saturday: 10AM - 8PM',
                  settings.contactHoursSun || 'Sunday: 11AM - 6PM',
                  settings.contactHoursHolidays || 'Holidays: 12PM - 5PM'
                ]
              }
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#815536] to-[#c9baa8] rounded-full mb-4">
                  <contact.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{contact.title}</h3>
                <div className="space-y-1">
                  {contact.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{settings.contactFormTitle || 'Send Us a Message'}</h2>
            <p className="text-xl text-gray-600">
              {settings.contactFormSubtitle || 'Fill out the form below and we\'ll get back to you as soon as possible.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="order-support">Order Support</option>
                    <option value="recommendation">Fragrance Recommendation</option>
                    <option value="complaint">Complaint</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{settings.contactFaqTitle || 'Frequently Asked Questions'}</h2>
            <p className="text-xl text-gray-600">
              {settings.contactFaqSubtitle || 'Quick answers to common questions about our products and services.'}
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: settings.contactFaq1Question || 'Are all your fragrances authentic?',
                answer: settings.contactFaq1Answer || 'Yes, we guarantee 100% authentic products. All our fragrances are sourced directly from authorized distributors and verified suppliers.'
              },
              {
                question: settings.contactFaq2Question || 'Do you offer fragrance samples?',
                answer: settings.contactFaq2Answer || 'Yes, we offer sample sizes for most of our fragrances. This allows you to try before committing to a full-size bottle.'
              },
              {
                question: settings.contactFaq3Question || 'What is your return policy?',
                answer: settings.contactFaq3Answer || 'We offer a 30-day return policy for unopened products. If you\'re not satisfied with your purchase, you can return it for a full refund.'
              },
              {
                question: settings.contactFaq4Question || 'How long does shipping take?',
                answer: settings.contactFaq4Answer || 'Standard shipping takes 3-5 business days within India. Express shipping is available for 1-2 day delivery in major cities.'
              },
              {
                question: settings.contactFaq5Question || 'Do you provide fragrance recommendations?',
                answer: settings.contactFaq5Answer || 'Absolutely! Our fragrance experts are happy to provide personalized recommendations based on your preferences and occasions.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageCircle className="h-5 w-5 text-[#815536] mr-2" />
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
