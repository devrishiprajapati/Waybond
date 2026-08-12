/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004AAD',
          light: '#3B82F6',
          dark: '#00327A',
        },
        secondary: {
          DEFAULT: '#004AAD',
          light: '#3B82F6',
          dark: '#00327A',
        },
        //  secondary: {
        //   DEFAULT: '#6495ED',
        //   light: '#60a5fa',
        //   dark: '#1d4ed8',
        // },
        accent: {
          DEFAULT: '#FFD700',
          light: '#ffeb33',
          dark: '#ccac00',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        bungee: ['Bungee', 'cursive'],
        body: ['Manrope', 'sans-serif'],
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
        bold: '700',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
