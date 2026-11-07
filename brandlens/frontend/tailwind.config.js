/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8FF',
        surface: '#FFFFFF',
        'surface-subtle': '#F8F7FD',
        border: '#E8E5F3',
        'border-subtle': '#F0EDFA',
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
          DEFAULT: '#6366F1',
        },
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        slate: {
          850: '#151F32',
          900: '#0F172A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          border: '#A7F3D0',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          border: '#FDE68A',
          dark: '#B45309',
        },
        critical: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          border: '#FECACA',
          dark: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 14px -2px rgba(99, 102, 241, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(99, 102, 241, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(99, 102, 241, 0.08)',
        'glow-sm': '0 0 15px -2px rgba(99, 102, 241, 0.25)',
        'glow-md': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
        'glow-critical': '0 0 18px -2px rgba(239, 68, 68, 0.3)',
        'glow-success': '0 0 18px -2px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
