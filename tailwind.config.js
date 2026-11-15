/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reddit: '#FF4500',
        arc: {
          bg: '#0F1117',
          surface: '#1A1D27',
          border: '#2E3447',
          black: '#12141C',
          blue: '#3B82F6',
          red: '#EF4444',
          green: '#10B981',
          yellow: '#F59E0B',
          grey: '#6B7280',
          magenta: '#EC4899',
          orange: '#FF5722',
          cyan: '#06B6D4',
        },
      },
      keyframes: {
        revealPop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' },
        },
      },
      animation: {
        'reveal-pop': 'revealPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
};
