// src/pages/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe, Heart, Star, CheckCircle } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const About: React.FC = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading about page content...</p>
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
              {settings.aboutHeroTitle || 'About Trendy Bazar'}
            </h1>
            <p className="text-xl text-[#c9baa8] max-w-3xl mx-auto leading-relaxed">
              {settings.aboutHeroSubtitle || 'Crafting memories through exquisite fragrances since 2020. We believe that every scent tells a story, and every story deserves to be unforgettable.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {settings.aboutStoryParagraph1 || 'Founded with a passion for luxury and elegance, Trendy Bazar began as a dream to bring the world\'s finest fragrances to discerning customers. Our journey started with a simple belief: that fragrance is not just about smelling good, but about expressing your unique personality and creating lasting impressions.'}
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {settings.aboutStoryParagraph2 || 'Today, we curate an exclusive collection of premium perfumes from renowned houses and emerging artisans alike. Each fragrance in our collection is carefully selected for its quality, uniqueness, and ability to evoke emotions and memories.'}
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#815536]">{settings.aboutYearsExperience || '5+'}</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#815536]">{settings.aboutHappyCustomers || '10K+'}</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#815536]">{settings.aboutPremiumFragrances || '100+'}</div>
                  <div className="text-sm text-gray-600">Premium Fragrances</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Luxury perfume collection"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#c9baa8]/30 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Trendy Bazar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: settings.aboutValueQualityTitle || 'Quality Excellence',
                description: settings.aboutValueQualityDescription || 'We source only the finest fragrances from trusted suppliers and renowned perfume houses.'
              },
              {
                icon: Users,
                title: settings.aboutValueCustomerTitle || 'Customer First',
                description: settings.aboutValueCustomerDescription || 'Your satisfaction is our priority. We provide personalized service and expert guidance.'
              },
              {
                icon: Globe,
                title: settings.aboutValueGlobalTitle || 'Global Reach',
                description: settings.aboutValueGlobalDescription || 'Bringing international luxury fragrances to customers across India with reliable delivery.'
              },
              {
                icon: Heart,
                title: settings.aboutValuePassionTitle || 'Passion Driven',
                description: settings.aboutValuePassionDescription || 'Our love for fragrances drives us to continuously discover and share exceptional scents.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#815536] to-[#c9baa8] rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Premium fragrance bottles"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#815536]/20 rounded-full blur-3xl"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Why Choose Trendy Bazar?</h2>
              <div className="space-y-4">
                {[
                  settings.aboutWhyChoose1 || 'Authentic products from verified suppliers',
                  settings.aboutWhyChoose2 || '100% genuine fragrances with quality guarantee',
                  settings.aboutWhyChoose3 || 'Expert curation and personalized recommendations',
                  settings.aboutWhyChoose4 || 'Secure packaging and fast delivery',
                  settings.aboutWhyChoose5 || 'Competitive pricing on luxury fragrances',
                  settings.aboutWhyChoose6 || '24/7 customer support and after-sales service'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#815536] to-[#c9baa8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {settings.aboutCtaTitle || 'Ready to Find Your Signature Scent?'}
            </h2>
            <p className="text-xl text-[#c9baa8] mb-8">
              {settings.aboutCtaSubtitle || 'Explore our curated collection of premium fragrances and discover the perfect scent that defines you.'}
            </p>
            <motion.a
              href="/products"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-white text-[#815536] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Shop Our Collection
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
