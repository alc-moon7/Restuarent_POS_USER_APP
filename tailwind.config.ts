import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pos: {
          primary: '#006C5B',
          primaryDark: '#064E45',
          accent: '#F59E0B',
          background: '#F7F4EC',
          surface: '#FFFFFF',
          slate: '#172126',
          muted: '#637171',
          line: '#E8E1D4',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
          info: '#2563EB',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 33, 38, 0.08)',
        lift: '0 12px 30px rgba(0, 108, 91, 0.14)',
      },
      borderRadius: {
        card: '22px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
