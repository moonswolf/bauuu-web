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
          50: '#FFF1ED',
          100: '#FFDDD3',
          200: '#FFC0AD',
          300: '#FF9A7D',
          400: '#FF7752',
          500: '#E8533C',
          600: '#CC3D28',
          700: '#A82E1C',
          800: '#862416',
          900: '#5C1810',
        },
        secondary: {
          500: '#4CAF7D',
          600: '#3D9468',
        },
        accent: {
          500: '#FFD700',
          600: '#e6c200',
        },
        background: '#FFFAF8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
