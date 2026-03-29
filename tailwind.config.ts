import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3e8ff',
          500: '#7B2EFF',
          600: '#6c28e0',
          700: '#5d21c2',
        },
        secondary: {
          500: '#FF6B6B',
          600: '#e85a5a',
        },
        accent: {
          500: '#FFD700',
          600: '#e6c200',
        },
        background: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;