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
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#A8B3C0',
            '--tw-prose-headings': '#E8EDF2',
            '--tw-prose-links': '#FFD966',
            '--tw-prose-bold': '#CBD5E0',
            '--tw-prose-counters': '#FFD966',
            '--tw-prose-bullets': '#FFD966',
            '--tw-prose-quotes': '#CBD5E0',
            '--tw-prose-quote-borders': '#FFD966',
            '--tw-prose-code': '#FFD966',
            '--tw-prose-pre-code': '#E8EDF2',
            '--tw-prose-pre-bg': '#0F1419',
            '--tw-prose-hr': '#1A1F2E',
            '--tw-prose-th-borders': '#1A1F2E',
            '--tw-prose-td-borders': '#1A1F2E',
            maxWidth: 'none',
            color: '#A8B3C0',
            lineHeight: '1.75',
            // Headings
            h1: {
              color: '#E8EDF2',
              fontWeight: '300',
              lineHeight: '1.2',
              marginTop: '2em',
              marginBottom: '0.75em',
            },
            h2: {
              color: '#E8EDF2',
              fontWeight: '400',
              lineHeight: '1.3',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h3: {
              color: '#E8EDF2',
              fontWeight: '500',
              lineHeight: '1.4',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            h4: {
              color: '#E8EDF2',
              fontWeight: '500',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
            // Paragraphs
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              lineHeight: '1.75',
            },
            // Links
            a: {
              color: '#FFD966',
              textDecoration: 'underline',
              textDecorationColor: '#FFD966',
              textUnderlineOffset: '2px',
              '&:hover': {
                color: '#FFED99',
              },
            },
            // Strong (bold)
            strong: {
              color: '#CBD5E0',
              fontWeight: '600',
            },
            // Lists
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            ol: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            'ul > li': {
              paddingLeft: '0.375em',
            },
            'ol > li': {
              paddingLeft: '0.375em',
            },
            // Blockquotes
            blockquote: {
              fontStyle: 'italic',
              color: '#CBD5E0',
              borderLeftColor: '#FFD966',
              borderLeftWidth: '4px',
              paddingLeft: '1em',
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            // Code
            code: {
              color: '#FFD966',
              backgroundColor: '#0F1419',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#0F1419',
              color: '#E8EDF2',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            // Horizontal rules
            hr: {
              borderColor: '#1A1F2E',
              marginTop: '2em',
              marginBottom: '2em',
            },
            // Images
            img: {
              borderRadius: '0.75rem',
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
