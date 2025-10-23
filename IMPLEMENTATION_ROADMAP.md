# Grove Tiers & Tree Renewal - Implementation Roadmap

## ✅ Completed: Schema & Data Model

### Database Schema (Prisma)
- ✅ **Person model** - Global identity for people across Groves
- ✅ **GroveTreeMembership** - Junction table with `isOriginal`, `subscriptionOwnerId`, `status`
- ✅ **TreeSubscription** - Individual Tree subscription ($4.99/year)
- ✅ **Grove updates** - Added `userId`, `treeCount`, `renewalDate`, `frozen` status
- ✅ **Branch updates** - Changed from `treeId` to `personId`

### Plan Configuration
- ✅ **Individual Tree Plan** added to `lib/plans.ts` ($4.99/year)
- ✅ **Grove tiers** already configured:
  - Trial: 1 tree, $0
  - Family: 10 trees, $9.99/year
  - Ancestry: 25 trees, $19.99/year
  - Institutional: 100 trees, $99/year

### Migration Script
- ✅ Created `prisma/migrations/migrate-to-person-model.ts`
- Transforms existing Tree → Person structure
- Creates GroveTreeMembership records
- Updates all Branch references

---

## 🚧 Required Implementation (Before Production)

### 1. API Endpoints

#### Grove Management
- ❌ **POST /api/grove/person/add**
  - Add new person (creates Person + GroveTreeMembership with `isOriginal: true`)
  - Increments `grove.treeCount`
  - Enforces `treeLimit` capacity

- ❌ **POST /api/grove/person/link**
  - Link existing Person (creates GroveTreeMembership with `isOriginal: false`)
  - Does NOT increment `treeCount`
  - Search by email or person ID

#### Tree Subscription
- ❌ **POST /api/tree-subscription/create**
  - Initiate Individual Tree checkout ($4.99)
  - Creates Stripe checkout session
  - Links to specific `GroveTreeMembership`

- ❌ **POST /api/tree-subscription/cancel**
  - Cancel individual tree subscription
  - Sets status to `frozen` unless Grove is active

- ❌ **GET /api/tree-subscription/[membershipId]**
  - Get subscription status for a specific tree

#### Freeze/Reactivation Logic
- ❌ **POST /api/grove/freeze**
  - Called when Grove subscription lapses
  - Sets `grove.status = 'frozen'`
  - Freezes all dependent Trees (`isOriginal: true`, no individual subscription)
  - Leaves linked Trees and individually-subscribed Trees active

- ❌ **POST /api/grove/reactivate**
  - Reactivate Grove subscription
  - Unfreezes all dependent Trees

- ❌ **POST /api/tree/reactivate**
  - Reactivate individual Tree ($4.99 checkout)
  - Sets membership status to `active`

### 2. Stripe Webhook Handlers

#### `/api/webhooks/stripe` must handle:

**checkout.session.completed**
- ❌ Grove subscription → set `grove.status = 'active'`, update `renewalDate`
- ❌ Tree subscription → create `TreeSubscription`, set membership `status = 'active'`

**customer.subscription.updated**
- ❌ Grove subscription → update `grove.status`, `renewalDate`
- ❌ Tree subscription → update `TreeSubscription.status`
- ❌ Handle past_due → grace period logic

**customer.subscription.deleted**
- ❌ Grove subscription → call freeze logic
- ❌ Tree subscription → freeze specific membership if Grove also inactive

**invoice.payment_failed**
- ❌ Set status to `past_due`
- ❌ Start grace period countdown

**invoice.payment_succeeded**
- ❌ Restore `active` status
- ❌ Update `renewalDate`

### 3. UI Updates

#### Grove Page (`app/grove/page.tsx`)
- ❌ Display Trees grouped by Grove
- ❌ Show "Original" vs "Linked" badges
- ❌ Show individual subscription status badges
- ❌ "Add New Person" vs "Link Existing Person" buttons
- ❌ Frozen state UI with reactivation prompt

#### Tree Detail View
- ❌ Show subscription status (Grove-dependent vs Individual)
- ❌ "Reactivate This Tree ($4.99)" button when frozen
- ❌ Disable new content creation when frozen
- ❌ Read-only mode for frozen Trees

#### Person Search/Link Modal
- ❌ Search existing Persons by name/email
- ❌ Preview: "This person already exists in X other Groves"
- ❌ Confirm: "This won't use one of your Tree slots"

#### Freeze Banner
- ❌ Prominent banner when Grove is frozen
- ❌ Copy: "Your Grove plan expired. Memories are safe but frozen. To add new ones, renew your Grove or reactivate individual Trees for $4.99/year."
- ❌ "Renew Grove" CTA
- ❌ List of frozen Trees with individual "Reactivate ($4.99)" buttons

#### Billing Page Updates
- ❌ Show Individual Tree subscriptions separately
- ❌ "Active Individual Trees: 3 × $4.99/year = $14.97"
- ❌ Upgrade prompt: "Upgrade to Family Grove and save $5/year"
- ❌ Credit logic: Apply tree subscription credits toward Grove upgrade

### 4. Business Logic Functions

#### Capacity Enforcement (`lib/capacity.ts`)
```typescript
// ❌ Create file
export async function canAddOriginalTree(groveId: string): Promise<boolean>
export async function getTreeCount(groveId: string): Promise<number>
export async function incrementTreeCount(groveId: string): Promise<void>
```

#### Freeze Logic (`lib/freeze.ts`)
```typescript
// ❌ Create file
export async function freezeGrove(groveId: string): Promise<void>
export async function unfreezeGrove(groveId: string): Promise<void>
export async function freezeTree(membershipId: string): Promise<void>
export async function unfreezeTree(membershipId: string): Promise<void>
export async function isTreeFrozen(membershipId: string): Promise<boolean>
export async function canEditContent(branchId: string): Promise<boolean>
```

#### Person Linking (`lib/person.ts`)
```typescript
// ❌ Create file
export async function findPersonByEmail(email: string): Promise<Person | null>
export async function findPersonById(personId: string): Promise<Person | null>
export async function createPerson(name: string, userId?: string): Promise<Person>
export async function linkPersonToGrove(personId: string, groveId: string): Promise<void>
export async function getPersonMemberships(personId: string): Promise<GroveTreeMembership[]>
```

### 5. Stripe Product Configuration

#### In Stripe Dashboard:
- ❌ Create product: "Individual Tree" ($4.99/year recurring)
- ❌ Get price ID → add to `.env` as `STRIPE_PRICE_INDIVIDUAL_TREE`
- ❌ Verify existing Grove products:
  - `STRIPE_PRICE_FAMILY`
  - `STRIPE_PRICE_ANCESTRY`
  - `STRIPE_PRICE_INSTITUTIONAL`

### 6. Environment Variables

Add to `.env`:
```bash
STRIPE_PRICE_INDIVIDUAL_TREE=price_xxxxxxxxxxxxx
```

### 7. Testing Scenarios

#### QA Checklist:
- [ ] Add new person → uses Grove slot, increments `treeCount`
- [ ] Link existing person → does NOT use slot, no increment
- [ ] Grove at capacity → "Add Person" button disabled with tooltip
- [ ] Grove cancels → dependent Trees freeze, linked Trees stay active
- [ ] Individual Tree subscription → keeps Tree active when Grove frozen
- [ ] Frozen Tree → content is read-only, "Add Memory" blocked
- [ ] Frozen Tree → "Reactivate" button shows $4.99 checkout
- [ ] Grove reactivation → all dependent Trees unfreeze
- [ ] Stripe webhook → Grove status updates correctly
- [ ] Stripe webhook → Tree subscription status updates correctly
- [ ] Migration script → all existing data preserved

---

## 📋 Implementation Order (Recommended)

1. **Run migration** (after schema push)
   ```bash
   npx prisma db push
   npx ts-node prisma/migrations/migrate-to-person-model.ts
   ```

2. **Create freeze logic** (`lib/freeze.ts`)
   - Core business logic first
   - Used by both webhooks and UI

3. **Update webhooks** (`app/api/webhooks/stripe/route.ts`)
   - Handle subscription lifecycle
   - Trigger freeze/unfreeze automatically

4. **Create Person management APIs**
   - Add person
   - Link person
   - Search person

5. **Create Tree subscription APIs**
   - Individual checkout
   - Status check
   - Cancellation

6. **Update UI components**
   - Freeze banners
   - Status badges
   - Reactivation buttons
   - Person search modal

7. **Add Stripe products** (production)
   - Create Individual Tree product
   - Add price ID to environment

8. **Full integration testing**
   - Use Stripe test mode
   - Test all scenarios
   - Verify freeze/unfreeze logic

---

## 🎯 User Experience (Copy Guidelines)

### At Tree Capacity
> "You've planted all 10 Trees in your Grove. Upgrade to Ancestry Grove for 25 Trees, or manage existing Trees."

### Adding New Person
> "This person will become a new Tree in your Grove. It uses one of your 10 available Trees."

### Linking Existing Person
> "This person already has a Tree. Connecting them won't use up one of your Trees."

### Grove Frozen
> "Your Grove plan expired on [date]. Memories are safe but frozen. To add new ones, renew your Grove or reactivate individual Trees for $4.99/year."

### Tree Frozen (with Individual Option)
> "This Tree is frozen because your Grove has expired. Reactivate it for $4.99/year to continue adding memories."

### Successful Tree Reactivation
> "[Person Name]'s Tree is now active! You can add memories even while your Grove is inactive."

### Upgrade Prompt (with Individual Subscriptions)
> "You're paying $14.97/year for 3 individual Trees. Upgrade to Family Grove for $9.99/year and get 7 more Trees!"

---

## 🔑 Key Architectural Points

1. **Person is global** - A person exists once across all Groves
2. **Membership is the relationship** - GroveTreeMembership links Groves and Persons
3. **isOriginal determines counting** - Only original Trees count toward `treeLimit`
4. **Two subscription types** - Grove-level and Tree-level
5. **Freeze is cascading** - Grove freeze → dependent Trees freeze
6. **Linked Trees are immune** - They depend on their origin Grove
7. **Individual subscriptions override** - Tree stays active even if Grove frozen
8. **Branch belongs to Person** - `personId` not `treeId`

---

## ⚠️ Migration Safety

Before running migration in production:
1. ✅ Full database backup
2. ✅ Test migration on staging database
3. ✅ Verify all data transformation
4. ✅ Plan rollback strategy
5. ✅ Schedule maintenance window
6. ✅ Notify users of potential downtime

---

**Last Updated**: Current session (all schema changes complete)
**Status**: Schema ready, APIs pending implementation
**Estimated Remaining Work**: 10-15 hours of development + testing
