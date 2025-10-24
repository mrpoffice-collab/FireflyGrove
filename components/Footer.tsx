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
            <Link
              href="/about"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              About
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/guide"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              User Guide
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/privacy"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              Privacy Policy
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/terms"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              Terms of Use
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/contact"
              className="text-text-muted hover:text-firefly-glow transition-soft"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
