/**
 * Centralized Plan Configuration
 *
 * All plan limits and pricing in one place
 * for easy experimentation and updates
 */

export interface Plan {
  id: string
  name: string
  description: string
  price: number // in cents
  interval: 'year' | 'month'
  treeLimit: number
  features: string[]
  stripePriceId?: string // Set from env vars
  popular?: boolean
}

export const PLANS: Record<string, Plan> = {
  trial: {
    id: 'trial',
    name: 'Trial Grove',
    description: 'Perfect for getting started',
    price: 0,
    interval: 'year',
    treeLimit: 1,
    features: [
      '1 Family Tree',
      'Unlimited Branches per Tree',
      'Unlimited Memories',
      'Photo & Audio uploads',
      'Legacy planning',
    ],
  },
  family: {
    id: 'family',
    name: 'Family Grove',
    description: 'Ideal for growing families',
    price: 999, // $9.99/year
    interval: 'year',
    treeLimit: 10,
    features: [
      '10 Family Trees',
      'Unlimited Branches per Tree',
      'Unlimited Memories',
      'Photo & Audio uploads',
      'Legacy planning',
      'Priority support',
    ],
    stripePriceId: process.env.STRIPE_PRICE_FAMILY,
    popular: true,
  },
  ancestry: {
    id: 'ancestry',
    name: 'Ancestry Grove',
    description: 'For extensive family histories',
    price: 1999, // $19.99/year
    interval: 'year',
    treeLimit: 25,
    features: [
      '25 Family Trees',
      'Unlimited Branches per Tree',
      'Unlimited Memories',
      'Photo & Audio uploads',
      'Advanced legacy planning',
      'Export tools',
      'Priority support',
    ],
    stripePriceId: process.env.STRIPE_PRICE_ANCESTRY,
  },
  community: {
    id: 'community',
    name: 'Community Grove',
    description: 'For organizations and large families',
    price: 9900, // $99/year
    interval: 'year',
    treeLimit: 100,
    features: [
      '100 Family Trees',
      'Unlimited Branches per Tree',
      'Unlimited Memories',
      'Photo & Audio uploads',
      'Community features',
      'Bulk export',
      'Dedicated support',
      'Custom branding (coming soon)',
    ],
    stripePriceId: process.env.STRIPE_PRICE_COMMUNITY,
  },
}

/**
 * Individual Tree Subscription
 * Keeps a single Tree active independent of Grove status
 */
export interface TreePlan {
  id: string
  name: string
  description: string
  price: number // in cents
  interval: 'year' | 'month'
  features: string[]
  stripePriceId?: string
}

export const TREE_PLAN: TreePlan = {
  id: 'individual_tree',
  name: 'Individual Tree',
  description: 'Keep one person\'s tree active independently',
  price: 499, // $4.99/year
  interval: 'year',
  features: [
    'Keep this Tree active',
    'Independent of Grove status',
    'Unlimited Branches',
    'Unlimited Memories',
    'Credit toward Grove upgrade',
  ],
  stripePriceId: process.env.STRIPE_PRICE_INDIVIDUAL_TREE,
}

export function getPlanById(planType: string): Plan {
  return PLANS[planType] || PLANS.trial
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return Object.values(PLANS).find((plan) => plan.stripePriceId === priceId)
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function getUpgradeMessage(currentPlan: string, newTreeLimit: number): string {
  const plan = getPlanById(currentPlan)
  return `Your Grove has room for more Trees. Capacity is now ${newTreeLimit}.`
}

export function getCapacityReachedMessage(currentPlan: string): string {
  const plan = getPlanById(currentPlan)
  return `You've planted all ${plan.treeLimit} Trees for this Grove. Upgrade to grow more.`
}
