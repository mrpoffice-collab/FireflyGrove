/**
 * Setup verification test
 * This test ensures Jest and React Testing Library are configured correctly
 */

describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true)
  })

  it('should have access to testing-library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })

  it('should mock Next.js router', () => {
    const { useRouter } = require('next/navigation')
    const router = useRouter()
    expect(router.push).toBeDefined()
    expect(typeof router.push).toBe('function')
  })

  it('should mock NextAuth session', () => {
    const { useSession } = require('next-auth/react')
    const session = useSession()
    expect(session.status).toBe('unauthenticated')
  })
})
