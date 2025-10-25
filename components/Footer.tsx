import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-dark mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-text-muted text-sm mb-3">
            © 2025 Firefly Grove · Where memories take root and stories keep growing
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="/faq.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              FAQ
            </a>
            <span className="text-text-muted">·</span>
            <Link
              href="/open-grove"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              Open Grove
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/feedback"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
