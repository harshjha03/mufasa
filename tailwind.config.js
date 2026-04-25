/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#F7F4EF', 2: '#EDE9E1', 3: '#E0DBD0' },
        ink: { DEFAULT: '#1A1A2E', 2: '#2D3561' },
        teal: { DEFAULT: '#0A9396', light: '#94D2BD', pale: '#E9F5F5' },
        blue: { DEFAULT: '#005F73', light: '#0077B6' },
        sage: { DEFAULT: '#52796F', light: '#84A98C', pale: '#EEF4EF' },
        gold: { DEFAULT: '#CA9849', pale: '#FDF3E3' },
        danger: '#AE2012',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: { card: '16px', sm: '10px' },
      boxShadow: {
        card: '0 2px 20px rgba(26,26,46,0.08)',
        lg: '0 8px 40px rgba(26,26,46,0.12)',
      }
    }
  },
  plugins: []
}
