/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Existing colors
        'primary-brown': '#815536',
        'secondary-brown': '#c9baa8',
        'accent-brown': '#a67c52',
        'dark-brown': '#6d4429',
        'light-brown': '#b8a494',
        
        // NEW: Admin Panel Colors (Light Theme)
        admin: {
          primary: '#007BFF', // A standard blue for primary actions/highlights
          'primary-dark': '#0056B3', // Darker shade for hover/active states
          secondary: '#6F42C1', // A purple for secondary elements
          background: '#F8F9FA', // Very light gray background for the admin panel
          sidebar: '#FFFFFF', // White for sidebar
          card: '#FFFFFF', // White for cards/sections
          border: '#E0E0E0', // Light gray border color
          text: '#343A40', // Dark charcoal text for readability
          'text-dark': '#495057', // Slightly lighter charcoal text
          'text-light': '#6C757D', // Medium gray text for secondary info
          danger: '#DC3545', // Red for destructive actions
          success: '#28A745', // Green for success messages
          warning: '#FFC107', // Yellow for warnings
        },
      },
    },
  },
  plugins: [],
};
