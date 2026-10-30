/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B2B2C',
        surface: '#F3F6F5',
        brand: { 50: '#E8F5F3', 100: '#CDEBE6', 500: '#14958F', 600: '#0E7C7B', 700: '#0B6464', 900: '#0A3A3B' },
        amber: { 400: '#EFB04F', 500: '#E8A33D' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
