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
        atm: {
          bg: 'var(--color-bg)',
          'bg-subtle': 'var(--color-bg-subtle)',
          panel: 'var(--color-panel)',
          'panel-highlight': 'var(--color-panel-highlight)',
          cyan: 'var(--color-cyan)',
          emerald: 'var(--color-emerald)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
          critical: 'var(--color-critical)',
          warning: 'var(--color-warning)',
          success: 'var(--color-success)',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
