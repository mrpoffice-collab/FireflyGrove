# Grove Owner Pricing Pattern

## Overview
All Firefly Grove products follow a freemium model where **Grove Owners get complimentary access** to all paid features, while non-grove owners pay standard pricing.

## Who is a Grove Owner?
A user becomes a Grove Owner when they create their **first branch** (memory collection) in Firefly Grove. This is checked by:

```typescript
const userBranchCount = await prisma.branch.count({
  where: { ownerId: userId, status: 'ACTIVE' }
})

const isGroveOwner = userBranchCount > 0
```

## Implementation Pattern

### 1. Frontend - Check Grove Owner Status

Add grove owner checking to your component:

```typescript
const [isGroveOwner, setIsGroveOwner] = useState<boolean | null>(null)

useEffect(() => {
  const checkGroveOwner = async () => {
    try {
      const res = await fetch('/api/user/grove-status')
      const data = await res.json()
      setIsGroveOwner(data.isGroveOwner)
    } catch (error) {
      console.error('Failed to check grove status:', error)
      setIsGroveOwner(false)
    }
  }

  checkGroveOwner()
}, [])
```

### 2. Frontend - Conditional UI

Show pricing and benefits based on status:

```typescript
{isGroveOwner ? (
  // Grove Owner: Complimentary
  <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-4">
    <p className="text-text-soft text-sm flex items-center gap-2">
      <span className="text-firefly-glow">✦</span>
      <span><strong>Grove Owner Benefit:</strong> This is complimentary</span>
    </p>
  </div>
) : (
  // Non-Grove Owner: Show Price + Benefit Tip
  <div>
    <p className="text-2xl text-firefly-glow">${PRICE.toFixed(2)}</p>
    <p className="text-text-muted text-sm">
      💡 <strong>Tip:</strong> Grove owners get this free! Create your first memory to unlock.
    </p>
  </div>
)}
```

### 3. Backend - Checkout Logic

In your checkout API endpoint:

```typescript
// Check if user is a grove owner
const userBranchCount = await prisma.branch.count({
  where: { ownerId: userId, status: 'ACTIVE' }
})

const isGroveOwner = userBranchCount > 0

if (!isGroveOwner && price > 0) {
  // Create Stripe checkout session for non-grove owners
  const checkoutSession = await stripe.checkout.sessions.create({
    // ... stripe config
  })

  return NextResponse.json({
    checkoutUrl: checkoutSession.url,
  })
}

// Grove owners get free access - deliver product immediately
// ... deliver product logic
return NextResponse.json({
  success: true,
  message: 'Product delivered'
})
```

## Implemented Products

### ✅ Greeting Cards
- **Location**: `app/api/cards/checkout/route.ts`
- **Price**: $0.99 digital, $4.99 physical (non-grove owners)
- **Grove Owners**: Complimentary, delivered immediately

### ✅ Soundwave Art
- **Location**: `app/api/soundart/checkout/route.ts`
- **Price**: $2.99 (non-grove owners)
- **Grove Owners**: Complimentary download

### 🔜 Memorial Tributes
- **Status**: Needs checkout implementation
- **Pattern**: Same grove-owner logic when checkout is added

## Benefits of This Model

1. **Beta Testers**: All current users with branches get everything free
2. **Marketing Funnels**: Products drive people to create groves
3. **Standalone Products**: Each product works independently
4. **Clear Value Prop**: "Create memories, unlock free products"
5. **Founding Members**: Beta testers become founding grove members with lifetime benefits

## API Endpoints

### Check Grove Owner Status
```
GET /api/user/grove-status
Returns: { isGroveOwner: boolean, branchCount: number }
```

### Product Checkouts
```
POST /api/cards/checkout          # Greeting cards
POST /api/soundart/checkout       # Soundwave art
POST /api/memorial/checkout       # Memorial tributes (future)
```

## Future Products

When adding new paid features:

1. **Add grove owner check** in frontend component
2. **Show pricing conditionally** with benefit messaging
3. **Check grove status in checkout** API
4. **Route to Stripe** for non-grove owners
5. **Deliver immediately** for grove owners

## Pricing Strategy

- Keep prices accessible ($0.99 - $4.99 range)
- Grove owners = 100% free (retention strategy)
- Non-grove owners = Small friction to drive conversion
- Beta testers = Founding members (lifetime benefits)
