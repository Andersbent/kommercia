import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0a2540', // primary dark blue
          light: '#173c62'
        },
        status: {
          new: '#9CA3AF', // gray
          contacted: '#3B82F6', // blue
          interested: '#FBBF24', // yellow
          negotiation: '#F97316', // orange
          won: '#10B981', // green
          lost: '#FF4444' // red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
