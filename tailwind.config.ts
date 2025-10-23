import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0a0e14',
        'bg-darker': '#050810',
        'firefly-glow': '#ffd966',
        'firefly-dim': '#cc9933',
        'text-soft': '#e0e6ed',
        'text-muted': '#8892a6',
        'border-subtle': '#1a1f2e',
        'legacy-amber': '#d4a574',
        'legacy-silver': '#c5c9d4',
        'legacy-text': '#b8b3c8',
        'legacy-glow': '#e8dcc0',
      },
    },
  },
  plugins: [],
}

export default config
