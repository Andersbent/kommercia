const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6f5aff',
          light: '#8a7dff',
        },
        background: {
          DEFAULT: '#0d1333',
          surface: '#121a40',
          card: '#1a2145',
        },
        accent: {
          blue: '#575ff6',
          pink: '#c084fc',
        },
        status: {
          new: '#9CA3AF',
          contacted: '#3B82F6',
          interested: '#FBBF24',
          negotiation: '#F97316',
          won: '#10B981',
          lost: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
