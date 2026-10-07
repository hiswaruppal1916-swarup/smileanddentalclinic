/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        primary: {
          DEFAULT: '#0D9488',
          dark: '#0F766E',
          light: '#F0FDFA',
        },
        navy: {
          DEFAULT: '#0F172A',
          deep: '#0B132B',
          muted: '#334155',
        },
        accent: {
          blue: '#0284C7',
          orange: '#F97316',
          emerald: '#10B981',
          coral: '#EF4444',
        },
        canvas: '#F8FAFC',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'clinical': '0 2px 12px -2px rgba(13, 148, 136, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
        'clinical-hover': '0 8px 24px -4px rgba(13, 148, 136, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'floating': '0 12px 36px -6px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
}
