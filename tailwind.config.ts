import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stology: {
          'deep-navy': '#0A192F',
          'royal-blue': '#1E3A8A',
          'electric-blue': '#3B82F6',
          'light-blue': '#93C5FD',
          'off-white': '#F8FAFC',
          'border-light': '#E5E7EB',
          'text-dark': '#1F2937',
          'text-light': '#6B7280',
          'approve-bg': '#ECFDF5',
          approve: '#10B981',
          'reject-bg': '#FEF2F2',
          reject: '#EF4444',
          pending: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        kr: ['Noto Sans KR', 'Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['36px', { lineHeight: '54px', fontWeight: '700' }],
        'heading-1': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'heading-2': ['16px', { lineHeight: '24px', fontWeight: '700' }],
        'title-1': ['16px', { lineHeight: '19.2px', fontWeight: '700' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '500' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'sidebar-section': ['11px', { lineHeight: '13px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};

export default config;
