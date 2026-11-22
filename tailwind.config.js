import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        textbox: '0 2px 6px -1px rgba(15, 23, 42, 0.07), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'textbox-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.1), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        'textbox-focus': '0 4px 14px -2px rgba(99, 102, 241, 0.16), 0 2px 6px -2px rgba(99, 102, 241, 0.08)',
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: [forms]
};
