/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFCC00',
          light: '#FFE066',
          dark: '#E6B800'
        },
        secondary: {
          DEFAULT: '#4D7EFF',
          light: '#85A8FF',
          dark: '#2B5BE6'
        },
        accent: '#FF5E5B',
        danger: '#FF3A36',
        success: '#4CAF50',
        warning: '#FFB61E',
        info: '#00B8D9',
        surface: {
          50: '#f8fafc',   // Lightest
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',  // Added
          500: '#64748b',  // Added
          600: '#475569',  // Added
          700: '#334155',  // Added
          800: '#1e293b',  // Added
          900: '#0f172a'   // Darkest
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui'],
        game: ['"Press Start 2P"', 'cursive']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'glow': '0 0 10px rgba(255, 204, 0, 0.7)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      animation: {
        'blink': 'blink 0.7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'chomp': 'chomp 0.3s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        chomp: {
          '0%': { clipPath: 'polygon(0 0, 50% 50%, 0 100%)' },
          '50%': { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
          '100%': { clipPath: 'polygon(0 0, 50% 50%, 0 100%)' },
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}