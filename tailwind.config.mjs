/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        rule: 'var(--rule)',
        'line-frontend': 'var(--line-frontend)',
        'line-backend': 'var(--line-backend)',
        'line-ai': 'var(--line-ai)',
        'line-hardware': 'var(--line-hardware)',
      },
      fontFamily: {
        archivo: ['Archivo Variable', 'Archivo', 'Impact', 'Haettenschweiler', 'sans-serif'],
        manrope: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        site: '1320px',
      },
      spacing: {
        'sp-1': '4px',
        'sp-2': '8px',
        'sp-3': '12px',
        'sp-4': '16px',
        'sp-6': '24px',
        'sp-8': '32px',
        'sp-12': '48px',
        'sp-18': '72px',
        'sp-28': '112px',
        'sp-40': '160px',
      },
    },
  },
  plugins: [],
};

