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
      },
    },
  },
  plugins: [],
}

export default config
