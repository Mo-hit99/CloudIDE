/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for dark/light themes
        'editor-bg': {
          light: '#EEEEEE',
          dark: '#1e1e2e'
        },
        'editor-sidebar': {
          light: '#EEEEEE',
          dark: 'rgba(30, 30, 46, 0.7)'
        }
      }
    },
  },
  plugins: [],
}