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
          DEFAULT: '#5B5FF2',
          50: '#F7F8FF',
          100: '#EDEFFF',
          200: '#D4D7FF',
          300: '#B5B7FF',
          400: '#8B8FFF',
          500: '#5B5FF2',
          600: '#4347E0',
          700: '#3337B8',
        },
        // Apple-inspired palette
        apple: {
          white: '#ffffff',
          gray: {
            50: '#fafbfc',
            100: '#f5f7fa',
            200: '#eaeef3',
            300: '#d6dce5',
            400: '#9da8b6',
            500: '#6b7785',
            600: '#4a5568',
            700: '#2d3748',
            800: '#1b1b1f',
            900: '#0a0a0c',
          },
          lavender: {
            50: '#F7F8FF',
            100: '#EDEFFF',
            200: '#D4D7FF',
            300: '#B5B7FF',
            400: '#8B8FFF',
            500: '#5B5FF2',
          },
          mint: {
            50: '#f0fdf9',
            100: '#ccfbef',
            200: '#99f6e0',
            300: '#5fe9ce',
            400: '#2dd4b4',
            500: '#8cf2c8',
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#ffdf7f',
            300: '#fcd34d',
            400: '#fbbf24',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'SF Pro Display', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline': ['48px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title': ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subtitle': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'strong': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.12)',
        'apple': '0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 2px 8px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 24px rgba(91, 95, 242, 0.5)',
        'glow-mint': '0 0 20px rgba(140, 242, 200, 0.3)',
        'glow-lavender': '0 0 20px rgba(181, 183, 255, 0.4)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(91, 95, 242, 0.4)' },
          '50%': { boxShadow: '0 0 32px rgba(91, 95, 242, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-apple': 'linear-gradient(120deg, #e3e7ff 0%, #f6f9ff 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        'hero-gradient': 'linear-gradient(135deg, #F7F8FF 0%, #EDEFFF 50%, #D4D7FF 100%)',
        'section-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FF 100%)',
      },
    },
  },
  plugins: [],
}
