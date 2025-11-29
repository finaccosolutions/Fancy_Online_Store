// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Type, Info, Phone, Home, LayoutDashboard, Mail, Server, DollarSign, ShieldCheck, Building2, FileText,
  Plus, Trash2, Eye, EyeOff, GripVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useToast } from '../../context/ToastContext';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { camelToSnake, mapDbToForm } from '../../utils/settingsMapper';
import { INDIAN_STATES } from '../../data/indianStates';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SiteSettingsForm {
  siteName: string;
  logoUrl: string;
  heroImageUrl: string;
  bannerImageUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paymentMethodsEnabled: string[];
  adminEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  siteLogoUrl: string;
  siteFaviconUrl: string;
  currencySymbol: string;
  currencyCode: string;
  shippingEnabled: boolean;
  freeShippingThreshold: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercentage: number;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  // NEW: About Page Content
  aboutHeroTitle: string;
  aboutHeroSubtitle: string;
  aboutStoryParagraph1: string;
  aboutStoryParagraph2: string;
  aboutYearsExperience: string;
  aboutHappyCustomers: string;
  aboutPremiumFragrances: string;
  aboutValueQualityTitle: string;
  aboutValueQualityDescription: string;
  aboutValueCustomerTitle: string;
  aboutValueCustomerDescription: string;
  aboutValueGlobalTitle: string;
  aboutValueGlobalDescription: string;
  aboutValuePassionTitle: string;
  aboutValuePassionDescription: string;
  aboutWhyChoose1: string;
  aboutWhyChoose2: string;
  aboutWhyChoose3: string;
  aboutWhyChoose4: string;
  aboutWhyChoose5: string;
  aboutWhyChoose6: string;
  aboutCtaTitle: string;
  aboutCtaSubtitle: string;
  // NEW: Contact Page Content
  contactHeroSubtitle: string;
  contactAddressLine1: string;
  contactAddressLine2: string;
  contactCity: string;
  contactCountry: string;
  contactPhone1: string;
  contactPhone2: string;
  contactEmail1: string;
  contactEmail2: string;
  contactEmail3: string;
  contactHoursMonFri: string;
  contactHoursSat: string;
  contactHoursSun: string;
  contactHoursHolidays: string;
  contactFormTitle: string;
  contactFormSubtitle: string;
  contactFaqTitle: string;
  contactFaqSubtitle: string;
  contactFaq1Question: string;
  contactFaq1Answer: string;
  contactFaq2Question: string;
  contactFaq2Answer: string;
  contactFaq3Question: string;
  contactFaq3Answer: string;
  contactFaq4Question: string;
  contactFaq4Answer: string;
  contactFaq5Question: string;
  contactFaq5Answer: string;
  // NEW: Footer Content
  footerCompanyDescription: string;
  footerSocialFacebook: string;
  footerSocialInstagram: string;
  footerSocialTwitter: string;
  footerCopyrightText: string;
  // Supplier/Business Details for GST and Invoicing
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPincode: string;
  businessPhone: string;
  businessEmail: string;
  gstNumber: string;
  invoiceTerms: string;
  invoiceFooter: string;
  deliveryCharge: number;
  // Font Settings
  fontFamily: string;
  fontSize: string;
  headingFontFamily: string;
  // Theme Colors
  primaryBgColor: string;
  primaryTextColor: string;
  secondaryBgColor: string;
  accentColor: string;
  buttonPrimaryColor: string;
  buttonHoverColor: string;
  borderColor: string;
  footerBgColor: string;
  headerBgColor: string;
}

const AdminSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // State for active tab
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { isAdmin } = useAuth();
  const { settings, loading: settingsLoading, error: settingsError, updateSetting, fetchSettings } = useSiteSettings();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SiteSettingsForm>();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!settingsLoading && !settingsError) {
      // Map database snake_case to form camelCase using the mapper
      const formData = mapDbToForm(settings);
      // Set form default values from mapped settings with fallbacks
      reset({
        siteName: formData.siteName || 'Velora Tradings',
        logoUrl: formData.logoUrl || '',
        primaryColor: formData.primaryColor || '#815536',
        secondaryColor: formData.secondaryColor || '#c9baa8',
        heroTitle: formData.heroTitle || 'Discover Your Signature Scent',
        heroSubtitle: formData.heroSubtitle || 'Experience luxury fragrances that define your personality.',
        heroImageUrl: formData.heroImageUrl || '',
        bannerImageUrl: formData.bannerImageUrl || '',
        faviconUrl: formData.faviconUrl || '',
        razorpayKeyId: formData.razorpayKeyId || '',
        razorpayKeySecret: formData.razorpayKeySecret || '',
        paymentMethodsEnabled: formData.paymentMethodsEnabled || ['cod'],
        adminEmail: formData.adminEmail || 'shafeeqkpt@gmail.com',
        smtpHost: formData.smtpHost || '',
        smtpPort: formData.smtpPort || 587,
        smtpSecure: formData.smtpSecure !== undefined ? formData.smtpSecure : true,
        smtpUser: formData.smtpUser || '',
        smtpPassword: formData.smtpPassword || '',
        smtpFromEmail: formData.smtpFromEmail || '',
        smtpFromName: formData.smtpFromName || '',
        siteLogoUrl: formData.siteLogoUrl || '',
        siteFaviconUrl: formData.siteFaviconUrl || '',
        currencySymbol: formData.currencySymbol || '₹',
        currencyCode: formData.currencyCode || 'INR',
        shippingEnabled: formData.shippingEnabled !== undefined ? formData.shippingEnabled : true,
        freeShippingThreshold: formData.freeShippingThreshold || 0,
        bulkDiscountThreshold: formData.bulkDiscountThreshold || 0,
        bulkDiscountPercentage: formData.bulkDiscountPercentage || 0,
        contactPhone: formData.contactPhone || '',
        contactAddress: formData.contactAddress || '',
        socialFacebook: formData.socialFacebook || '',
        socialTwitter: formData.socialTwitter || '',
        socialInstagram: formData.socialInstagram || '',
        socialLinkedin: formData.socialLinkedin || '',
        metaTitle: formData.metaTitle || '',
        metaDescription: formData.metaDescription || '',
        metaKeywords: formData.metaKeywords || '',
        googleAnalyticsId: formData.googleAnalyticsId || '',
        maintenanceMode: formData.maintenanceMode !== undefined ? formData.maintenanceMode : false,
        maintenanceMessage: formData.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
        aboutHeroTitle: formData.aboutHeroTitle || 'About Velora Tradings',
        aboutHeroSubtitle: formData.aboutHeroSubtitle || 'Crafting memories through exquisite fragrances since 2020.',
        aboutStoryParagraph1: formData.aboutStoryParagraph1 || 'Founded with a passion for luxury and elegance...',
        aboutStoryParagraph2: formData.aboutStoryParagraph2 || 'Today, we curate an exclusive collection...',
        aboutYearsExperience: formData.aboutYearsExperience || '5+',
        aboutHappyCustomers: formData.aboutHappyCustomers || '10K+',
        aboutPremiumFragrances: formData.aboutPremiumFragrances || '100+',
        aboutValueQualityTitle: formData.aboutValueQualityTitle || 'Quality Excellence',
        aboutValueQualityDescription: formData.aboutValueQualityDescription || 'We source only the finest fragrances...',
        aboutValueCustomerTitle: formData.aboutValueCustomerTitle || 'Customer First',
        aboutValueCustomerDescription: formData.aboutValueCustomerDescription || 'Your satisfaction is our priority...',
        aboutValueGlobalTitle: formData.aboutValueGlobalTitle || 'Global Reach',
        aboutValueGlobalDescription: formData.aboutValueGlobalDescription || 'Bringing international luxury fragrances...',
        aboutValuePassionTitle: formData.aboutValuePassionTitle || 'Passion Driven',
        aboutValuePassionDescription: formData.aboutValuePassionDescription || 'Our love for fragrances drives us...',
        aboutWhyChoose1: formData.aboutWhyChoose1 || 'Authentic products from verified suppliers',
        aboutWhyChoose2: formData.aboutWhyChoose2 || '100% genuine fragrances with quality guarantee',
        aboutWhyChoose3: formData.aboutWhyChoose3 || 'Expert curation and personalized recommendations',
        aboutWhyChoose4: formData.aboutWhyChoose4 || 'Secure packaging and fast delivery',
        aboutWhyChoose5: formData.aboutWhyChoose5 || 'Competitive pricing on luxury fragrances',
        aboutWhyChoose6: formData.aboutWhyChoose6 || '24/7 customer support and after-sales service',
        aboutCtaTitle: formData.aboutCtaTitle || 'Ready to Find Your Signature Scent?',
        aboutCtaSubtitle: formData.aboutCtaSubtitle || 'Explore our curated collection of premium fragrances...',
        contactHeroSubtitle: formData.contactHeroSubtitle || 'Have questions about our fragrances?...',
        contactAddressLine1: formData.contactAddressLine1 || 'Perinthalmanna',
        contactAddressLine2: formData.contactAddressLine2 || 'Kerala',
        contactCity: formData.contactCity || 'Perinthalmanna',
        contactCountry: formData.contactCountry || 'India',
        contactPhone1: formData.contactPhone1 || '+91 73560 62349',
        contactPhone2: formData.contactPhone2 || '+91 98765 43211',
        contactEmail1: formData.contactEmail1 || 'info@veloratradings.com',
        contactEmail2: formData.contactEmail2 || 'support@veloratradings.com',
        contactEmail3: formData.contactEmail3 || 'orders@veloratradings.com',
        contactHoursMonFri: formData.contactHoursMonFri || 'Monday - Friday: 10AM - 8PM',
        contactHoursSat: formData.contactHoursSat || 'Saturday: 10AM - 8PM',
        contactHoursSun: formData.contactHoursSun || 'Sunday: 11AM - 6PM',
        contactHoursHolidays: formData.contactHoursHolidays || 'Holidays: 12PM - 5PM',
        contactFormTitle: formData.contactFormTitle || 'Send Us a Message',
        contactFormSubtitle: formData.contactFormSubtitle || 'Fill out the form below...',
        contactFaqTitle: formData.contactFaqTitle || 'Frequently Asked Questions',
        contactFaqSubtitle: formData.contactFaqSubtitle || 'Quick answers to common questions...',
        contactFaq1Question: formData.contactFaq1Question || 'Are all your fragrances authentic?',
        contactFaq1Answer: formData.contactFaq1Answer || 'Yes, we guarantee 100% authentic products...',
        contactFaq2Question: formData.contactFaq2Question || 'Do you offer fragrance samples?',
        contactFaq2Answer: formData.contactFaq2Answer || 'Yes, we offer sample sizes for most of our fragrances...',
        contactFaq3Question: formData.contactFaq3Question || 'What is your return policy?',
        contactFaq3Answer: formData.contactFaq3Answer || 'We offer a 30-day return policy...',
        contactFaq4Question: formData.contactFaq4Question || 'How long does shipping take?',
        contactFaq4Answer: formData.contactFaq4Answer || 'Standard shipping takes 3-5 business days...',
        contactFaq5Question: formData.contactFaq5Question || 'Do you provide fragrance recommendations?',
        contactFaq5Answer: formData.contactFaq5Answer || 'Absolutely! Our fragrance experts are happy to provide...',
        footerCompanyDescription: formData.footerCompanyDescription || 'Discover the essence of luxury with Velora Tradings...',
        footerSocialFacebook: formData.footerSocialFacebook || '#',
        footerSocialInstagram: formData.footerSocialInstagram || '#',
        footerSocialTwitter: formData.footerSocialTwitter || '#',
        footerCopyrightText: formData.footerCopyrightText || '© 2025 Velora Tradings. All rights reserved.',
        businessName: formData.businessName || 'Velora Tradings',
        businessAddress: formData.businessAddress || '',
        businessCity: formData.businessCity || '',
        businessState: formData.businessState || '',
        businessPincode: formData.businessPincode || '',
        businessPhone: formData.businessPhone || '',
        businessEmail: formData.businessEmail || '',
        gstNumber: formData.gstNumber || '',
        invoiceTerms: formData.invoiceTerms || 'All sales are final. Returns accepted within 7 days.',
        invoiceFooter: formData.invoiceFooter || 'This is a computer generated invoice.',
        deliveryCharge: formData.deliveryCharge || 0,
        fontFamily: formData.fontFamily || 'system-ui',
        fontSize: formData.fontSize || '16px',
        headingFontFamily: formData.headingFontFamily || 'system-ui',
        primaryBgColor: formData.primaryBgColor || '#0A8DB0',
        primaryTextColor: formData.primaryTextColor || '#ffffff',
        secondaryBgColor: formData.secondaryBgColor || '#f3f4f6',
        accentColor: formData.accentColor || '#D4AF37',
        buttonPrimaryColor: formData.buttonPrimaryColor || '#0A8DB0',
        buttonHoverColor: formData.buttonHoverColor || '#0891b2',
        borderColor: formData.borderColor || '#e5e7eb',
        footerBgColor: formData.footerBgColor || '#1e293b',
        headerBgColor: formData.headerBgColor || '#ffffff',
      });
    }
  }, [settingsLoading, settingsError, settings, reset]);

  const onSubmit = async (data: SiteSettingsForm) => {
    setIsLoading(true);

    try {
      console.log('Starting to save settings...', Object.keys(data).length, 'fields');

      // Convert camelCase form data to snake_case for database
      const updates = Object.keys(data).map(key => {
        const dbKey = camelToSnake(key);
        return updateSetting(dbKey, (data as any)[key]);
      });

      const results = await Promise.all(updates);
      const hasError = results.some(result => result.error);
      const errorResults = results.filter(result => result.error);

      if (hasError) {
        console.error('Failed settings:', errorResults.map((r, i) => ({ key: Object.keys(data)[i], error: r.error })));
        showToast(`Failed to save ${errorResults.length} settings. Please try again.`, 'error');
        setSaveSuccess(false);
      } else {
        console.log('All settings saved successfully!', results.length, 'settings updated');
        showToast(`All settings saved successfully! (${results.length} fields updated)`, 'success');
        setSaveSuccess(true);
        // Refresh settings from database after successful save
        await fetchSettings();

        // Reset save success state after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('Error saving site settings:', error);
      showToast(error.message || 'Failed to save settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading site settings...</p>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-admin-card rounded-xl shadow-lg">
          <p className="text-red-500 text-lg">{settingsError}</p>
          <p className="text-admin-text-light mt-2">Please ensure you have admin privileges and the site_settings table is set up correctly.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, color: 'text-admin-primary' },
    { id: 'appearance', label: 'Appearance', icon: Type, color: 'text-purple-500' },
    { id: 'business', label: 'Business/GST', icon: Building2, color: 'text-indigo-500' },
    { id: 'email', label: 'Email & SMTP', icon: Mail, color: 'text-red-500' },
    { id: 'payment', label: 'Payment & Shipping', icon: DollarSign, color: 'text-green-500' },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck, color: 'text-orange-500' },
    { id: 'home', label: 'Home Page', icon: Home, color: 'text-admin-success' },
    { id: 'hero', label: 'Hero Images', icon: FileText, color: 'text-blue-500' },
    { id: 'about', label: 'About Page', icon: Info, color: 'text-admin-warning' },
    { id: 'contact', label: 'Contact Page', icon: Phone, color: 'text-admin-secondary' },
    { id: 'footer', label: 'Footer', icon: LayoutDashboard, color: 'text-admin-info' },
  ];

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-4 md:p-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-admin-primary to-admin-primary-dark shadow-xl rounded-2xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Site Settings</h1>
            <p className="text-white/80 text-sm mt-1">Configure your store settings and preferences</p>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-admin-card rounded-2xl shadow-xl overflow-hidden"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-admin-sidebar px-4 py-3 border-b border-admin-border">
            <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
                  ${activeTab === tab.id
                    ? 'bg-admin-primary text-white shadow-lg scale-105'
                    : 'bg-admin-card text-admin-text-light hover:bg-admin-border hover:text-admin-text'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6" // Added space-y for spacing between sections
              >
                {/* General Settings Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'general')?.color}`}>
                    <Settings className="h-6 w-6" />
                    <span>General Settings</span>
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Site Name</label>
                      <input
                        {...register('siteName')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Logo URL (Full Logo with Text)</label>
                      <input
                        {...register('logoUrl')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Upload your logo to an image hosting service and paste the direct link here. Logo should include both icon and business name. Recommended: PNG with transparent background, max height 80px.</p>
                      {/* Logo Preview */}
                      {settings.logo_url && (
                        <div className="mt-3 p-4 bg-admin-background rounded-lg border border-admin-border">
                          <p className="text-xs font-semibold text-admin-text mb-2">Preview:</p>
                          <div className="bg-white p-4 rounded">
                            <img src={settings.logo_url} alt="Logo Preview" className="h-10 w-auto max-w-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hero Section Background Image URL</label>
                      <input
                        {...register('heroImageUrl')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="https://example.com/hero-bg.jpg"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Upload your hero background image to an image hosting service and paste the direct link here. Recommended: High-resolution image, 1920x1080px or larger.</p>
                      {/* Hero Image Preview */}
                      {settings.hero_image_url && (
                        <div className="mt-3 p-4 bg-admin-background rounded-lg border border-admin-border">
                          <p className="text-xs font-semibold text-admin-text mb-2">Preview:</p>
                          <div className="bg-white p-2 rounded">
                            <img src={settings.hero_image_url} alt="Hero Background Preview" className="w-full h-48 object-cover rounded" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Banner Image URL</label>
                      <input
                        {...register('bannerImageUrl')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="https://example.com/banner.jpg"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Upload your banner image to an image hosting service and paste the direct link here. Recommended: Wide format image for promotional banners.</p>
                      {/* Banner Image Preview */}
                      {settings.banner_image_url && (
                        <div className="mt-3 p-4 bg-admin-background rounded-lg border border-admin-border">
                          <p className="text-xs font-semibold text-admin-text mb-2">Preview:</p>
                          <div className="bg-white p-2 rounded">
                            <img src={settings.banner_image_url} alt="Banner Preview" className="w-full h-32 object-cover rounded" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Favicon URL</label>
                      <input
                        {...register('faviconUrl')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                        placeholder="https://example.com/favicon.png"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Upload your favicon to an image hosting service and paste the direct link here. This appears in browser tabs. Recommended: Square PNG, 32x32px or larger.</p>
                      {/* Favicon Preview */}
                      {settings.favicon_url && (
                        <div className="mt-3 p-4 bg-admin-background rounded-lg border border-admin-border">
                          <p className="text-xs font-semibold text-admin-text mb-2">Preview:</p>
                          <div className="bg-white p-4 rounded flex items-center justify-center">
                            <img src={settings.favicon_url} alt="Favicon Preview" className="h-8 w-8 object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Theme Colors Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'general')?.color}`}>
                    <Palette className="h-6 w-6" />
                    <span>Theme Colors</span>
                  </h2>
                  <p className="text-sm text-admin-text-light mb-6">
                    Customize your site's color scheme. These colors will be applied globally across your entire site.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Primary Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('primaryBgColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('primaryBgColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#0A8DB0"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Main background color</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Primary Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('primaryTextColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('primaryTextColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Primary text color</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Secondary Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('secondaryBgColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('secondaryBgColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#f3f4f6"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Secondary background</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('accentColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('accentColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#D4AF37"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Highlight/accent color</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Button Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('buttonPrimaryColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('buttonPrimaryColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#0A8DB0"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Primary button color</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Button Hover Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('buttonHoverColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('buttonHoverColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#0891b2"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Button hover state</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Border Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('borderColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('borderColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#e5e7eb"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Default border color</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Header Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('headerBgColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('headerBgColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Header background</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Footer Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          {...register('footerBgColor')}
                          className="w-14 h-12 border border-admin-border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('footerBgColor')}
                          className="flex-1 p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent text-sm font-mono"
                          placeholder="#1e293b"
                        />
                      </div>
                      <p className="text-xs text-admin-text-light mt-1">Footer background</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Color Scheme Preview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--primary-bg-color, #0A8DB0)' }}></div>
                        <p className="text-xs text-admin-text text-center">Primary Bg</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--accent-color, #D4AF37)' }}></div>
                        <p className="text-xs text-admin-text text-center">Accent</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--button-primary-color, #0A8DB0)' }}></div>
                        <p className="text-xs text-admin-text text-center">Button</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--secondary-bg-color, #f3f4f6)' }}></div>
                        <p className="text-xs text-admin-text text-center">Secondary Bg</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--header-bg-color, #ffffff)' }}></div>
                        <p className="text-xs text-admin-text text-center">Header</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-lg border-2 border-admin-border" style={{ backgroundColor: 'var(--footer-bg-color, #1e293b)' }}></div>
                        <p className="text-xs text-admin-text text-center">Footer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Font Settings Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'appearance')?.color}`}>
                    <Type className="h-6 w-6" />
                    <span>Typography Settings</span>
                  </h2>
                  <p className="text-sm text-admin-text-light mb-6">
                    Customize the fonts and text sizes used across your site. Changes will apply globally.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Body Font Family</label>
                      <select
                        {...register('fontFamily')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      >
                        <option value="system-ui">System UI (Default)</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Open Sans', sans-serif">Open Sans</option>
                        <option value="'Lato', sans-serif">Lato</option>
                        <option value="'Poppins', sans-serif">Poppins</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                        <option value="'Arial', sans-serif">Arial</option>
                        <option value="'Helvetica', sans-serif">Helvetica</option>
                        <option value="'Georgia', serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                      </select>
                      <p className="text-xs text-admin-text-light mt-1">Used for body text and paragraphs</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Heading Font Family</label>
                      <select
                        {...register('headingFontFamily')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      >
                        <option value="system-ui">System UI (Default)</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Open Sans', sans-serif">Open Sans</option>
                        <option value="'Lato', sans-serif">Lato</option>
                        <option value="'Poppins', sans-serif">Poppins</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                        <option value="'Arial', sans-serif">Arial</option>
                        <option value="'Helvetica', sans-serif">Helvetica</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Merriweather', serif">Merriweather</option>
                      </select>
                      <p className="text-xs text-admin-text-light mt-1">Used for headings and titles</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Base Font Size</label>
                      <select
                        {...register('fontSize')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      >
                        <option value="14px">Small (14px)</option>
                        <option value="16px">Medium (16px - Default)</option>
                        <option value="18px">Large (18px)</option>
                        <option value="20px">Extra Large (20px)</option>
                      </select>
                      <p className="text-xs text-admin-text-light mt-1">Base size for body text</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Font Preview</h3>
                    <div className="space-y-3">
                      <p className="text-admin-text" style={{ fontFamily: 'var(--body-font, system-ui)', fontSize: 'var(--base-font-size, 16px)' }}>
                        This is a sample paragraph using the body font. The quick brown fox jumps over the lazy dog.
                      </p>
                      <h3 className="text-2xl font-bold text-admin-text" style={{ fontFamily: 'var(--heading-font, system-ui)' }}>
                        This is a Sample Heading
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Important Notes</h3>
                    <ul className="list-disc list-inside text-admin-text text-sm space-y-1 ml-2">
                      <li>Font changes apply globally across the entire website</li>
                      <li>Google Fonts are automatically loaded for supported fonts</li>
                      <li>Some fonts may take a moment to load on first visit</li>
                      <li>Test your selections on different devices for best results</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Business Details Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'business')?.color}`}>
                    <Building2 className="h-6 w-6" />
                    <span>Business/Supplier Details</span>
                  </h2>
                  <p className="text-sm text-admin-text-light mb-6">
                    These details will appear on invoices and are used for GST calculations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Name *</label>
                      <input
                        {...register('businessName')}
                        type="text"
                        placeholder="Your Business Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">This will appear on invoices</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Address *</label>
                      <input
                        {...register('businessAddress')}
                        type="text"
                        placeholder="Street Address, Building Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">City *</label>
                      <input
                        {...register('businessCity')}
                        type="text"
                        placeholder="City"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">State *</label>
                      <select
                        {...register('businessState')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-admin-text-light mt-1">Used to determine intrastate/interstate GST</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">PIN Code *</label>
                      <input
                        {...register('businessPincode')}
                        type="text"
                        placeholder="6-digit PIN"
                        maxLength={6}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number *</label>
                      <input
                        {...register('businessPhone')}
                        type="text"
                        placeholder="+91 12345 67890"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Business Email *</label>
                      <input
                        {...register('businessEmail')}
                        type="email"
                        placeholder="business@example.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">GST Number (GSTIN) *</label>
                      <input
                        {...register('gstNumber')}
                        type="text"
                        placeholder="e.g., 27AAPFU0939F1ZV"
                        maxLength={15}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent uppercase"
                      />
                      <p className="text-xs text-admin-text-light mt-1">15-character GST Identification Number</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Settings Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'business')?.color}`}>
                    <FileText className="h-6 w-6" />
                    <span>Invoice Settings</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Invoice Terms & Conditions</label>
                      <textarea
                        {...register('invoiceTerms')}
                        rows={4}
                        placeholder="Enter terms and conditions that will appear on invoices..."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">e.g., return policy, warranty information, payment terms</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Invoice Footer Text</label>
                      <input
                        {...register('invoiceFooter')}
                        type="text"
                        placeholder="This is a computer generated invoice."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Text that appears at the bottom of invoices</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-admin-text mb-2">Important Note</h3>
                  <p className="text-admin-text text-sm">
                    All fields marked with * are required for proper GST invoicing. Your business state is used to determine whether GST should be split into CGST+SGST (intrastate) or IGST (interstate).
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'email')?.color}`}>
                    <Mail className="h-6 w-6" />
                    <span>Admin Email</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Admin Email Address</label>
                    <input
                      {...register('adminEmail')}
                      type="email"
                      placeholder="admin@example.com"
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                    <p className="text-sm text-admin-text-light mt-2">
                      This email will receive all order notifications from customers.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'email')?.color}`}>
                    <Server className="h-6 w-6" />
                    <span>SMTP Configuration</span>
                  </h2>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-admin-text text-sm">
                      <strong>Configure your SMTP settings below.</strong> These settings will be used to send order confirmation emails to customers and admins.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Host *</label>
                      <input
                        {...register('smtpHost')}
                        type="text"
                        placeholder="smtp.example.com or smtp2go.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP server hostname</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Port *</label>
                      <input
                        {...register('smtpPort', { valueAsNumber: true })}
                        type="number"
                        placeholder="587"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Usually 587 (TLS) or 465 (SSL)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Username *</label>
                      <input
                        {...register('smtpUser')}
                        type="text"
                        placeholder="your-username"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP username</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">SMTP Password / API Key *</label>
                      <input
                        {...register('smtpPassword')}
                        type="password"
                        placeholder="your-password-or-api-key"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your SMTP password or API key</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">From Email Address *</label>
                      <input
                        {...register('smtpFromEmail')}
                        type="email"
                        placeholder="noreply@yourdomain.com"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Email address to send from</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">From Name</label>
                      <input
                        {...register('smtpFromName')}
                        type="text"
                        placeholder="Your Store Name"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Display name for outgoing emails</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('smtpSecure')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Use TLS/SSL (Recommended)</span>
                      </label>
                      <p className="text-xs text-admin-text-light mt-1 ml-7">Enable secure connection to SMTP server</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Recommended SMTP Provider: SMTP2GO</h3>
                    <p className="text-admin-text text-sm mb-2">
                      For reliable email delivery, we recommend using SMTP2GO. It's easy to set up and offers a free tier.
                    </p>
                    <ul className="list-disc list-inside text-admin-text text-sm space-y-1 ml-2">
                      <li>Sign up at smtp2go.com</li>
                      <li>Get your API key from the dashboard</li>
                      <li>Use your API key as the SMTP Password above</li>
                      <li>SMTP Host: api.smtp2go.com (optional, for standard SMTP)</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}


            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'payment')?.color}`}>
                    <DollarSign className="h-6 w-6" />
                    <span>Currency Settings</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Currency Symbol</label>
                      <input
                        {...register('currencySymbol')}
                        type="text"
                        placeholder="₹"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Currency Code</label>
                      <input
                        {...register('currencyCode')}
                        type="text"
                        placeholder="INR"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'payment')?.color}`}>
                    <DollarSign className="h-6 w-6" />
                    <span>Razorpay Payment Gateway</span>
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-admin-text text-sm mb-2">
                      <strong>Configure Razorpay to accept online payments.</strong> Sign up at razorpay.com and get your API keys from the dashboard.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Razorpay Key ID (Public Key)</label>
                      <input
                        {...register('razorpayKeyId')}
                        type="text"
                        placeholder="rzp_test_xxxxxxxxxxxxx"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your Razorpay public key (safe to expose)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Razorpay Key Secret (Private Key)</label>
                      <input
                        {...register('razorpayKeySecret')}
                        type="password"
                        placeholder="Enter your secret key"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Your Razorpay secret key (kept secure in database)</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-admin-text mb-2">Getting Started with Razorpay</h3>
                    <ul className="list-disc list-inside text-admin-text text-sm space-y-1 ml-2">
                      <li>Sign up at <strong>razorpay.com</strong></li>
                      <li>Complete your KYC verification</li>
                      <li>Go to Settings → API Keys in your Razorpay dashboard</li>
                      <li>Generate or copy your Key ID and Key Secret</li>
                      <li>Paste both keys above and save settings</li>
                      <li>Enable Razorpay in payment methods below</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-admin-text">Payment Methods</h2>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-admin-card rounded-lg border border-admin-border cursor-pointer hover:bg-admin-background">
                      <input
                        type="checkbox"
                        value="cod"
                        defaultChecked
                        disabled
                        className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-admin-text-dark">Cash on Delivery (COD)</span>
                        <p className="text-xs text-admin-text-light">Always enabled - customers can pay upon delivery</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-admin-card rounded-lg border border-admin-border cursor-pointer hover:bg-admin-background">
                      <input
                        type="checkbox"
                        value="razorpay"
                        {...register('paymentMethodsEnabled')}
                        className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-admin-text-dark">Razorpay (UPI, Cards, Net Banking, Wallets)</span>
                        <p className="text-xs text-admin-text-light">Enable after configuring Razorpay keys above</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-admin-text">Shipping & Discounts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Free Shipping Threshold (₹)</label>
                      <input
                        {...register('freeShippingThreshold', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Minimum order value for free shipping (0 = no free shipping)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Delivery Charge (₹)</label>
                      <input
                        {...register('deliveryCharge', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Flat delivery charge for all orders (0 = free delivery)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Bulk Discount Threshold (₹)</label>
                      <input
                        {...register('bulkDiscountThreshold', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Minimum order value for bulk discount (0 = no bulk discount)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Bulk Discount Percentage (%)</label>
                      <input
                        {...register('bulkDiscountPercentage', { valueAsNumber: true })}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                      <p className="text-xs text-admin-text-light mt-1">Discount percentage to apply when order value exceeds threshold</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('shippingEnabled')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Enable Shipping</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {activeTab === 'maintenance' && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'maintenance')?.color}`}>
                    <ShieldCheck className="h-6 w-6" />
                    <span>Maintenance Mode</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('maintenanceMode')}
                          type="checkbox"
                          className="w-5 h-5 text-admin-primary focus:ring-2 focus:ring-admin-primary border-admin-border rounded"
                        />
                        <span className="text-sm font-medium text-admin-text-dark">Enable Maintenance Mode</span>
                      </label>
                      <p className="text-xs text-admin-text-light mt-1 ml-7">When enabled, visitors will see a maintenance page</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Maintenance Message</label>
                      <textarea
                        {...register('maintenanceMessage')}
                        rows={3}
                        placeholder="We are currently performing maintenance. Please check back soon."
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Home Page Hero Section Content */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'home')?.color}`}>
                    <Home className="h-6 w-6" />
                    <span>Home Page Hero Section Content</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hero Title</label>
                      <input
                        {...register('heroTitle')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hero Subtitle</label>
                      <textarea
                        {...register('heroSubtitle')}
                        rows={3}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'hero' && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Hero Images Management */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 text-blue-500`}>
                    <FileText className="h-6 w-6" />
                    <span>Hero Carousel Images</span>
                  </h2>
                  <p className="text-sm text-admin-text-light mb-6">Manage the images displayed in the hero section carousel on the home page. Images will scroll left and right.</p>
                  <HeroImagesManager />
                </div>
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* About Hero Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'about')?.color}`}>
                    <Info className="h-6 w-6" />
                    <span>About Hero Section</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">About Hero Title</label>
                    <input
                      {...register('aboutHeroTitle')}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">About Hero Subtitle</label>
                    <textarea
                      {...register('aboutHeroSubtitle')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Our Story Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Our Story</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Story Paragraph 1</label>
                    <textarea
                      {...register('aboutStoryParagraph1')}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Story Paragraph 2</label>
                    <textarea
                      {...register('aboutStoryParagraph2')}
                      rows={4}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Years Experience</label>
                      <input
                        {...register('aboutYearsExperience')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Happy Customers</label>
                      <input
                        {...register('aboutHappyCustomers')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Premium Fragrances</label>
                      <input
                        {...register('aboutPremiumFragrances')}
                        className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Our Values Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Our Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Quality Value Title</label>
                      <input {...register('aboutValueQualityTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Quality Value Description</label>
                      <textarea {...register('aboutValueQualityDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Customer Value Title</label>
                      <input {...register('aboutValueCustomerTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Customer Value Description</label>
                      <textarea {...register('aboutValueCustomerDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Global Value Title</label>
                      <input {...register('aboutValueGlobalTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Global Value Description</label>
                      <textarea {...register('aboutValueGlobalDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Passion Value Title</label>
                      <input {...register('aboutValuePassionTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">Passion Value Description</label>
                      <textarea {...register('aboutValuePassionDescription')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Why Choose Us</h3>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={`aboutWhyChoose${i}`}>
                        <label className="block text-sm font-medium text-admin-text-dark mb-2">{`Why Choose Us Point ${i}`}</label>
                        <input {...register(`aboutWhyChoose${i}` as keyof SiteSettingsForm)} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Call to Action</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">CTA Title</label>
                    <input {...register('aboutCtaTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">CTA Subtitle</label>
                    <textarea {...register('aboutCtaSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Contact Hero Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'contact')?.color}`}>
                    <Phone className="h-6 w-6" />
                    <span>Contact Hero Section</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Contact Hero Subtitle</label>
                    <textarea
                      {...register('contactHeroSubtitle')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Address Line 1</label>
                      <input {...register('contactAddressLine1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Address Line 2</label>
                      <input {...register('contactAddressLine2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">City</label>
                      <input {...register('contactCity')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Country</label>
                      <input {...register('contactCountry')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number 1</label>
                      <input {...register('contactPhone1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Phone Number 2</label>
                      <input {...register('contactPhone2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 1</label>
                      <input {...register('contactEmail1')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 2</label>
                      <input {...register('contactEmail2')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Email Address 3</label>
                      <input {...register('contactEmail3')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Business Hours Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Business Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Mon-Fri</label>
                      <input {...register('contactHoursMonFri')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Saturday</label>
                      <input {...register('contactHoursSat')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Sunday</label>
                      <input {...register('contactHoursSun')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Hours Holidays</label>
                      <input {...register('contactHoursHolidays')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Contact Form Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Contact Form Section</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Form Title</label>
                    <input {...register('contactFormTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Form Subtitle</label>
                    <textarea {...register('contactFormSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">FAQ Section</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">FAQ Title</label>
                    <input {...register('contactFaqTitle')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">FAQ Subtitle</label>
                    <textarea {...register('contactFaqSubtitle')} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`contactFaq${i}`} className="mt-4">
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">{`FAQ ${i} Question`}</label>
                      <input {...register(`contactFaq${i}Question` as keyof SiteSettingsForm)} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                      <label className="block text-sm font-medium text-admin-text-dark mt-2 mb-2">{`FAQ ${i} Answer`}</label>
                      <textarea {...register(`contactFaq${i}Answer` as keyof SiteSettingsForm)} rows={2} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'footer' && (
              <motion.div
                key="footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Company Description Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center space-x-2 ${tabs.find(t => t.id === 'footer')?.color}`}>
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Company Description</span>
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Company Description</label>
                    <textarea
                      {...register('footerCompanyDescription')}
                      rows={3}
                      className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Social Media Links Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Facebook URL</label>
                      <input {...register('footerSocialFacebook')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Instagram URL</label>
                      <input {...register('footerSocialInstagram')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-admin-text-dark mb-2">Twitter URL</label>
                      <input {...register('footerSocialTwitter')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Copyright Text Section */}
                <div className="bg-gradient-to-br from-admin-sidebar to-admin-background border border-admin-border p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-admin-text mb-4">Copyright Text</h3>
                  <div>
                    <label className="block text-sm font-medium text-admin-text-dark mb-2">Copyright Text</label>
                    <input {...register('footerCopyrightText')} className="w-full p-3 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="sticky bottom-0 bg-admin-card border-t border-admin-border px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-admin-text-light">
                {saveSuccess ? (
                  <span className="text-admin-success font-medium">✓ All changes saved successfully!</span>
                ) : isDirty ? (
                  <span className="text-admin-warning">You have unsaved changes</span>
                ) : (
                  'Save your changes to update the site configuration'
                )}
              </p>
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-3 ${saveSuccess ? 'bg-admin-success' : 'bg-gradient-to-r from-admin-primary to-admin-primary-dark'} text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
              <Settings className="h-5 w-5" />
              <span>{isLoading ? 'Saving Changes...' : saveSuccess ? 'Saved!' : 'Save All Settings'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface HeroImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const HeroImagesManager: React.FC = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchHeroImages();
  }, []);

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
      showToast('Failed to load hero images', 'error');
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary mx-auto mb-2"></div>
        <p className="text-admin-text-light text-sm">Loading hero images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="flex-1 px-4 py-2 border border-admin-border rounded-lg bg-admin-card text-admin-text focus:ring-2 focus:ring-admin-primary focus:border-transparent"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddImage}
          disabled={isSaving}
          className="px-6 py-2 bg-admin-primary text-white font-semibold rounded-lg hover:bg-admin-primary-dark transition-colors disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      {heroImages.length === 0 ? (
        <div className="bg-admin-card rounded-lg p-8 text-center border border-admin-border">
          <p className="text-admin-text-light mb-2">No hero carousel images yet.</p>
          <p className="text-sm text-admin-text-light">Add images to create a carousel on the home page hero section.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {heroImages.map((image, idx) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-admin-card rounded-lg p-4 flex items-center gap-4 border border-admin-border"
            >
              <div className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-admin-text-light" />
              </div>

              <img
                src={image.image_url}
                alt={`Hero ${idx + 1}`}
                className="w-24 h-16 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2270%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%2270%22/%3E%3C/svg%3E';
                }}
              />

              <div className="flex-1">
                <p className="font-semibold text-admin-text">Hero Image {idx + 1}</p>
                <p className="text-xs text-admin-text-light truncate">{image.image_url}</p>
              </div>

              <div className="flex items-center gap-2">
                {idx > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReorder(idx, idx - 1)}
                    className="p-2 text-admin-text-light hover:bg-admin-border rounded"
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
                    className="p-2 text-admin-text-light hover:bg-admin-border rounded"
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
                      ? 'text-admin-success hover:bg-admin-card'
                      : 'text-admin-text-light hover:bg-admin-border'
                  }`}
                  title={image.is_active ? 'Hide' : 'Show'}
                >
                  {image.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteImage(image.id)}
                  className="p-2 text-admin-danger hover:bg-admin-card rounded transition-colors"
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
  );
};

export default AdminSettings;
