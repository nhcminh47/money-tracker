import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        coral: {
          50: '#FFF5F0',
          100: '#FFE8DD',
          200: '#F8D4C0',
          300: '#F4C4A8',
          400: '#E8B5A0',
          500: '#D9A088',
          600: '#C98970',
          700: '#B57358',
          800: '#9A5C42',
          900: '#7D4A35',
        },
        cream: {
          50: '#FEFDFB',
          100: '#FBF9F5',
          200: '#F5EDE4',
          300: '#EFE2D4',
          400: '#E8D5C2',
          500: '#DCC7B0',
        },
        chart: {
          yellow: '#FFB84D',
          green: '#6DD4A8',
          blue: '#5B9DD9',
          red: '#FF6B6B',
          purple: '#B88DC9',
          orange: '#FFA07A',
        },
        // Legacy notion colors for compatibility
        notion: {
          bg: {
            light: '#FFFFFF',
            dark: '#191919',
          },
          text: {
            primary: '#2D2D2D',
            secondary: '#6B6B6B',
          },
          border: '#E5E5E5',
          accent: '#E8B5A0',
          hover: '#F7F7F7',
          danger: '#FF6B6B',
          success: '#6DD4A8',
          neutral: '#F0F0F0',
        },
      },
      borderRadius: {
        card: '24px',
        button: '12px',
        input: '12px',
        badge: '999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 32px rgba(0, 0, 0, 0.12)',
        button: '0 4px 12px rgba(0, 0, 0, 0.08)',
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

export default config
