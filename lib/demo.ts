// Demo mode utilities

export const isDemoMode = () => {
  return process.env.DEMO_MODE === 'true'
}

export const DEMO_USERS = {
  ALICE: {
    email: 'alice@demo.local',
    password: 'demo123',
    name: 'Alice Johnson',
  },
  BOB: {
    email: 'bob@demo.local',
    password: 'demo123',
    name: 'Bob Williams',
  },
}

// Bypass external services in demo mode
export const shouldBypassStripe = () => isDemoMode()
export const shouldBypassEmail = () => isDemoMode()
export const shouldBypassStorage = () => isDemoMode()
