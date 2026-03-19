import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5D27A',
          dark: '#A87F1F',
          muted: '#8B7335',
        },
        dark: {
          DEFAULT: '#080808',
          surface: '#141414',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #D4AF3740' },
          '50%': { boxShadow: '0 0 20px #D4AF3780, 0 0 40px #D4AF3730' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        fadeIn: 'fadeIn 0.5s ease forwards',
        glow: 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
