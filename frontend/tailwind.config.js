/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF1F5',
          100: '#DCE2EA',
          200: '#B3BFCE',
          300: '#8494AC',
          400: '#546480',
          500: '#334361',
          600: '#1E2E4A',
          700: '#141F35',   // primary navy — sidebars, navbar
          800: '#0D1526',   // deep panels
          900: '#080D18',   // near-black backdrop
        },
        rescue: {
          50: '#FFF3ED',
          100: '#FFE2D2',
          200: '#FFC1A3',
          300: '#FF9A6C',
          400: '#FF7A3D',
          500: '#FF5B1F',   // primary orange — CTAs, SOS
          600: '#F04500',   // hover / pressed
          700: '#C63700',
          800: '#992A00',
          900: '#6E1F00',
        },
        ash: {
          50: '#F7F8FA',
          100: '#EEF0F3',
          200: '#E1E5EA',
          300: '#C7CDD6',
          400: '#9AA3B2',
          500: '#6B7484',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: { 50: '#ECFDF3', 500: '#17A34A', 600: '#128A3E' },
        warning: { 50: '#FFFAEB', 500: '#F0930C', 600: '#C97706' },
        danger:  { 50: '#FEF2F2', 500: '#E23636', 600: '#C41E1E' },
        info:    { 50: '#EFF6FF', 500: '#2563EB', 600: '#1D4ED8' },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,21,38,0.06), 0 8px 24px -8px rgba(13,21,38,0.10)',
        panel: '0 12px 40px -12px rgba(13,21,38,0.35)',
        glow: '0 0 0 4px rgba(255,91,31,0.14)',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '22px',
      },
      backgroundImage: {
        'asphalt': 'radial-gradient(120% 120% at 10% 0%, #1E2E4A 0%, #141F35 45%, #0A121F 100%)',
        'beacon': 'radial-gradient(60% 60% at 50% 50%, rgba(255,91,31,0.55) 0%, rgba(255,91,31,0) 70%)',
      },
      keyframes: {
        pulseBeacon: {
          '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 0.15, transform: 'scale(1.6)' },
        },
        dashMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 0' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        beacon: 'pulseBeacon 1.8s ease-in-out infinite',
        road: 'dashMove 1.2s linear infinite',
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
