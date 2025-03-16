/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        secondary: '#5f6368',
        success: '#34a853',
        warning: '#fbbc04',
        error: '#ea4335',
      },
    },
  },
  plugins: [],
} 