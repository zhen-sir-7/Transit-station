import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'arc-bg': '#0B0C10',
        'arc-surface': '#1F2833',
        'arc-surface-elevated': '#2A3545',
        'arc-surface-active': '#354555',
        'arc-text': '#C5C6C7',
        'arc-text-secondary': '#8A9199',
        'arc-text-heading': '#E0E1E2',
        'arc-accent': '#66FCF1',
        'arc-accent-secondary': '#45A29E',
        'arc-border': '#1F2833',
        'arc-success': '#4CAF50',
        'arc-danger': '#F44336',
        'arc-warning': '#FF9800',
        'arc-user-msg': '#2A3F54',
        'arc-user-accent': '#4A90D9',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
