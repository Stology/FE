import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stology: {
          50: '#f1f4ff',
          100: '#e3e8ff',
          500: '#5b5cf6',
          600: '#4848df',
          700: '#3737bc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
