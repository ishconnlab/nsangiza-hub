/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        hub: {
          primary: '#2F6B4F',
          'primary-dark': '#214B38',
          'primary-light': '#EAF4EE',
          secondary: '#6FA57F',
          accent: '#DCEFE3',
          background: '#F8FAF8',
          surface: '#FFFFFF',
          text: '#17211B',
          muted: '#66736B',
          danger: '#B42318',
          'danger-dark': '#7A271A',
          warning: '#B54708',
          info: '#2563A8',
        },
      },
      spacing: {
        '4.5': '1.125rem',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(47, 107, 79, 0.08)',
      },
    },
  },
  plugins: [forms],
}
