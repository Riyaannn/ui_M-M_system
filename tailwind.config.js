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
        // M&M Brand Design System Tokens
        mm: {
          bg: '#0D0B12',
          'bg-secondary': '#12101A',
          'bg-sidebar': '#100D17',
          card: '#191521',
          elevated: '#211A2D',
          border: '#30263E',
          'border-subtle': '#251E31',
          violet: {
            DEFAULT: '#8B5CF6',
            bright: '#A78BFA',
            soft: '#C4B5FD',
            dark: '#6D28D9',
            deep: '#4C1D95',
          },
          text: {
            DEFAULT: '#F5F3FA',
            secondary: '#AAA2B8',
            muted: '#777084',
          },
          success: '#4ADEA8',
          warning: '#FBBF74',
          error: '#FB7185',
        },
        // Legacy alias fallback for backward compatibility
        nmam: {
          navy: {
            50: '#191521',
            100: '#211A2D',
            200: '#30263E',
            300: '#4C1D95',
            400: '#6D28D9',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#211A2D',
            900: '#12101A',
            950: '#0D0B12',
          },
          teal: {
            50: '#191521',
            100: '#211A2D',
            200: '#30263E',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#4C1D95',
            900: '#100D17',
          },
          accent: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'glow-violet-sm': '0 0 20px -3px rgba(139, 92, 246, 0.2)',
        'surface-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px #30263E',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px #30263E',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-violet-action': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
        'gradient-surface': 'linear-gradient(180deg, #191521 0%, #12101A 100%)',
      }
    },
  },
  plugins: [],
}
