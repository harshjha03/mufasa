/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── MUFASA DARK PALETTE — Immersive Bronze ──

        // Backgrounds
        'obsidian':    '#120D08',   // main bg — ultra warm black
        'obsidian-2':  '#1C1410',   // cards
        'obsidian-3':  '#221A12',   // elevated / input bg

        // Primary — Ember Gold
        'ember':       '#D4A84B',   // main gold — primary action
        'ember-light': '#E8C46A',   // lighter gold
        'ember-dark':  '#A07830',   // darker gold
        'ember-pale':  '#2A2010',   // gold tint bg

        // Protein — Copper
        'copper':      '#D4905A',   // protein accent
        'copper-pale': '#281A0E',   // copper tint bg

        // Carbs — Azure
        'azure':       '#5B8FA8',   // carbs accent
        'azure-pale':  '#0C1B24',   // azure tint bg

        // Fat / Warmup — Sage
        'sage':        '#7BAE8A',   // fat / sage accent
        'sage-pale':   '#0E1A12',   // sage tint bg

        // Text
        'parchment':   '#F0E4C8',   // primary text
        'parchment-2': '#C8B898',   // muted text

        // ── Legacy token aliases (keep old class names working) ──
        'cream':       '#221A12',   // was warm parchment → now dark elevated
        'cream-2':     '#1C1410',   // was slightly darker → now dark card
        'cream-3':     '#2E2418',   // was border/divider → now dark border

        'gold':        '#D4A84B',
        'gold-light':  '#E8C46A',
        'gold-pale':   '#2A2010',
        'gold-dark':   '#D4A84B',

        'teal':        '#7BAE8A',
        'teal-light':  '#9BC9AA',
        'teal-pale':   '#0E1A12',
        'teal-dark':   '#5E9470',

        'ink':         '#F0E4C8',   // was dark text → now light text on dark bg
        'ink-2':       '#1C1410',   // was lighter brown → now dark card
        'ink-3':       '#C8B898',   // was muted text → now muted parchment

        'blue':        '#5B8FA8',
        'blue-light':  '#7AAFC0',

        'danger':      '#E05252',
        'success':     '#7BAE8A',
      },
      fontFamily: {
        sans:   ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif:  ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        cinzel: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(0,0,0,0.45)',
        'lg':   '0 8px 40px rgba(0,0,0,0.6)',
        'glow': '0 0 24px rgba(212,168,75,0.15)',
      },
    },
  },
  plugins: [],
}
