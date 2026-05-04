/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── MUFASA PALETTE ──
        // Extracted from the lion logo

        // Backgrounds
        'cream':    '#FDF6EC',   // warm parchment — main bg
        'cream-2':  '#F5ECD8',   // slightly darker parchment
        'cream-3':  '#E8D9C0',   // border/divider

        // Primary — Lion Gold
        'gold':       '#C9A96E',  // mane gold — primary action
        'gold-light': '#E8CC96',  // lighter gold
        'gold-pale':  '#F7EDD6',  // gold tint bg
        'gold-dark':  '#A07840',  // dark gold for text

        // Accent — Chest Teal
        'teal':       '#7BA896',  // chest teal — secondary action
        'teal-light': '#9DC4B6',  // lighter teal
        'teal-pale':  '#E8F4F0',  // teal tint bg
        'teal-dark':  '#4E8070',  // dark teal

        // Dark — Background
        'ink':      '#2A1F14',   // deep walnut — main text
        'ink-2':    '#3D2E1C',   // slightly lighter
        'ink-3':    '#5C4A32',   // muted text

        // Utility
        'sage':       '#7BA896',
        'sage-pale':  '#E8F4F0',
        'blue':       '#5B8FA8',
        'blue-light': '#7AAFC0',
        'danger':     '#C0392B',
        'success':    '#7BA896',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(42,31,20,0.08)',
        'lg':   '0 8px 32px rgba(42,31,20,0.16)',
      },
    },
  },
  plugins: [],
}
