import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF6B9C', // 玫瑰粉
          DEFAULT: '#9C27B0', // 深紫
          dark: '#1E88E5', // 海蓝
        },
        accent: '#00E5FF', // 霓虹青
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        text: {
          light: '#2D3748',
          dark: '#E2E8F0',
        }
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 5px theme(colors.accent), 0 0 20px theme(colors.accent)',
          },
          '50%': {
            'box-shadow': '0 0 20px theme(colors.accent), 0 0 40px theme(colors.accent)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    forms,
  ],
} 