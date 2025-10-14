/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-pink': '#D9266F',
        'brand-pink-light': '#F24C92',
        'brand-pink-bubble': '#F8BBD9',
        'brand-purple': {
          light: '#4C0D2A',
          dark: '#1E0511',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(145deg, #4C0D2A 0%, #1E0511 100%)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
