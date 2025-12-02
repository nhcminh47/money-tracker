import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        notion: {
          bg: {
            light: '#FFFFFF',
            dark: '#191919',
          },
          text: {
            primary: '#2F2F2F',
            secondary: '#6B6B6B',
          },
          border: '#E5E5E5',
          accent: '#0F6FFF',
          hover: '#F7F7F7',
          danger: '#E03E3E',
          success: '#2EAADC',
          neutral: '#F0F0F0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
