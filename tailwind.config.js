/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          darkest: '#090d16',
          dark: '#0f172a',
          surface: '#17223b',
          border: '#243456',
          card: '#131e35',
          highlight: '#1e293b'
        },
        med: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          blue: '#3b82f6',
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#10b981',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
