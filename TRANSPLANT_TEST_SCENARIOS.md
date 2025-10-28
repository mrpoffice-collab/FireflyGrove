# Tree Transplant Test Scenarios

## Overview
Complete test setup for tree transplant/transfer functionality with two test accounts and realistic transfer scenarios.

---

## 👥 TEST ACCOUNTS

### Beta Tester (Sender)
```
📧 Email:    beta@fireflygrove.app
🔑 Password: BetaTest2024!
🌳 Trees:    8 total
```

**Trees Owned:**
1. Rose Elizabeth Thompson (Grandma Rose) - 25 entries
2. Joseph Michael Thompson (Grandpa Joe) - 18 entries
3. Margaret Ann Thompson (Mom) - 35 entries
4. Frank David Thompson (Uncle Frank) - 12 entries
5. Carol Sue Henderson (Aunt Carol) - 40 entries
6. **Grandpa William** - 15 entries (Ready to send)
7. **Aunt Martha** - 8 entries (Transfer pending)
8. **Uncle Bob** - 12 entries (Already transferred)

### Recipient User
```
📧 Email:    recipient@fireflygrove.app
🔑 Password: Recipient2024!
🌳 Trees:    1 (received)
```

**Trees Owned:**
1. **Uncle Bob** - 12 entries (Received from Beta Tester)

---

## 📤 TRANSFER SCENARIOS

### Scenario 1: Pending Transfer ⏳
**Tree:** Aunt Martha
**From:** beta@fireflygrove.app
**To:** recipient@fireflygrove.app
**Status:** Pending (awaiting acceptance)
**Message:** "Hi Sarah, I think you should have Aunt Martha's tree. She was closest to you."
**Expires:** 30 days from creation

**What to Test:**
- Recipient sees pending invitation
- Recipient can accept transfer
- Recipient can decline transfer
- Sender can cancel before acceptance
- Tree moves to recipient's grove on acceptance

---

### Scenario 2: Accepted Transfer ✅
**Tree:** Uncle Bob
**From:** beta@fireflygrove.app
**To:** recipient@fireflygrove.app
**Status:** Accepted (completed 7 days ago)
**Message:** "Uncle Bob's memories belong with you now."

**What to Test:**
- Tree appears in recipient's grove
- Recipient has full ownership and permissions
- Original sender no longer has access
- Branch ownership transferred correctly
- All 12 entries preserved
- GroveTreeMembership shows `isOriginal: false`

---

### Scenario 3: Expired Transfer ⏰
**Tree:** Grandpa William
**From:** beta@fireflygrove.app
**To:** oldrequest@example.com
**Status:** Expired (5 days ago)
**Message:** "Old transfer that expired"

**What to Test:**
- Expired transfers show in history
- Cannot be accepted after expiration
- Sender can resend to same or different recipient
- Tree remains with original owner

---

### Scenario 4: New Transfer (To Test) 🆕
**Tree:** Grandpa William (15 entries)
**From:** beta@fireflygrove.app
**To:** *Your choice*
**Status:** Ready to send

**What to Test:**
- Send tree to new email address
- Send tree to existing user (recipient@fireflygrove.app)
- Custom message functionality
- Email notification (if implemented)
- Token generation and link

---

## 🧪 COMPLETE TEST PLAN

### As Beta Tester (Sender):

#### Test 1: Send New Transfer
1. Log in as beta@fireflygrove.app
2. Navigate to Grandpa William's tree
3. Click "Transfer Tree" or similar option
4. Enter recipient email: recipient@fireflygrove.app
5. Add message: "You should have Grandpa's tree"
6. Send transfer
7. Verify transfer appears in "Sent Transfers" list

#### Test 2: View Pending Transfer
1. Navigate to transfers management page
2. Find Aunt Martha transfer (pending)
3. Verify status shows "Pending"
4. Verify recipient email correct
5. Check expiration date (should be ~30 days)

#### Test 3: Cancel Pending Transfer
1. Find Aunt Martha pending transfer
2. Click "Cancel Transfer"
3. Verify status changes to "cancelled"
4. Verify tree still owned by you

#### Test 4: Resend Expired Transfer
1. Find Grandpa William expired transfer
2. Click "Resend" or "Send Again"
3. Update recipient if desired
4. Verify new transfer created with new token

#### Test 5: View Completed Transfer
1. Navigate to Uncle Bob's tree
2. Verify you no longer have access (or shows "Transferred")
3. Check transfer history shows "Accepted"
4. Verify accepted date and recipient

---

### As Recipient User:

#### Test 1: View Received Tree
1. Log in as recipient@fireflygrove.app
2. Navigate to grove dashboard
3. Find Uncle Bob's tree
4. Verify you have full access
5. Check all 12 entries are present
6. Verify you can add new entries
7. Verify you can manage the tree

#### Test 2: Accept Pending Transfer
1. Check for pending invitation (Aunt Martha)
2. View transfer details
3. Read sender's message
4. Click "Accept Transfer"
5. Verify tree appears in your grove
6. Verify ownership transferred
7. Check all 8 entries preserved

#### Test 3: Decline Transfer
1. Have beta tester send Grandpa William to you
2. View pending invitation
3. Click "Decline Transfer"
4. Add optional reason
5. Verify transfer status changes to "declined"
6. Verify tree stays with original owner

#### Test 4: Manage Multiple Trees
1. After accepting Aunt Martha
2. Verify you have 2 trees (Uncle Bob + Aunt Martha)
3. Check both show in grove dashboard
4. Verify you can manage both independently
5. Check received trees marked as `isOriginal: false`

---

## 🔍 EDGE CASES TO TEST

### Transfer System:
- [ ] Send tree to email that doesn't exist yet (creates invite)
- [ ] Send tree to existing user
- [ ] Send tree to yourself (should error)
- [ ] Accept transfer after sender deletes account
- [ ] Accept transfer after tree is deleted
- [ ] Multiple pending transfers to same recipient
- [ ] Transfer already transferred tree (should error)
- [ ] Token expiration (30 days)
- [ ] Invalid/tampered tokens
- [ ] Duplicate token prevention

### Ownership:
- [ ] All entries transfer with tree
- [ ] Media/photos preserved
- [ ] Heir assignments transfer
- [ ] Branch settings preserved
- [ ] Privacy settings maintained
- [ ] Legacy status preserved

### Permissions:
- [ ] Original owner loses access after transfer
- [ ] New owner gets full permissions
- [ ] Other users' access unaffected
- [ ] Trustee roles transferred
- [ ] Moderator roles updated

### UI/UX:
- [ ] Clear visual indicators for transfer status
- [ ] Proper notifications for all parties
- [ ] Email notifications work
- [ ] Mobile-friendly transfer UI
- [ ] Loading states during transfer
- [ ] Error messages are clear

---

## 📊 DATA VERIFICATION

After testing, verify in database:

```sql
-- Check tree ownership
SELECT p.name, p.ownerId, u.email
FROM "Person" p
JOIN "User" u ON p.ownerId = u.id
WHERE p.name LIKE '%Uncle Bob%' OR p.name LIKE '%Aunt Martha%';

-- Check transfer statuses
SELECT
  tt.status,
  p.name as tree_name,
  sender.email as from_email,
  tt.recipientEmail as to_email,
  tt.createdAt,
  tt.acceptedAt
FROM "TreeTransfer" tt
JOIN "Person" p ON tt.personId = p.id
JOIN "User" sender ON tt.senderUserId = sender.id
ORDER BY tt.createdAt DESC;

-- Check grove memberships
SELECT
  g.name as grove_name,
  p.name as tree_name,
  gtm.isOriginal
FROM "GroveTreeMembership" gtm
JOIN "Grove" g ON gtm.groveId = g.id
JOIN "Person" p ON gtm.personId = p.id
WHERE p.name LIKE '%Uncle Bob%' OR p.name LIKE '%Aunt Martha%';
```

---

## 🐛 KNOWN ISSUES TO WATCH FOR

1. **Entries not transferring:** Check if Entry model has proper cascade
2. **Permissions not updating:** Verify owner/moderator fields updated
3. **Grove count incorrect:** Check treeCount updates properly
4. **Email notifications failing:** Test with real emails
5. **Token conflicts:** Ensure tokens are unique
6. **Expired transfers not cleaned up:** Check for cleanup job

---

## ✅ SUCCESS CRITERIA

Transfer system is working correctly if:

- ✅ Trees can be sent to any email address
- ✅ Recipients receive proper notification
- ✅ Pending transfers can be accepted/declined
- ✅ Ownership transfers completely on acceptance
- ✅ All entries/data preserved during transfer
- ✅ Original owner loses access after transfer
- ✅ Transfers expire after 30 days
- ✅ Transfer history is maintained
- ✅ UI is clear and intuitive
- ✅ Error messages are helpful

---

## 🚀 HOW TO RECREATE

If you need to reset and recreate these scenarios:

```bash
# Run the transplant enhancement script
npx tsx scripts/enhance-beta-tester-transplant.ts
```

This will:
1. Find or create beta tester account
2. Create recipient account
3. Create 3 additional trees for beta tester
4. Set up 3 transfer scenarios (pending, accepted, expired)
5. Transfer ownership for accepted scenario

---

## 📝 NOTES

- **Beta tester** has 8 trees total (5 original + 3 for transplant testing)
- **Recipient user** has 1 tree (Uncle Bob, received via transfer)
- **Pending transfer** (Aunt Martha) is ready to accept
- **Grandpa William** is available for new transfer testing
- All test accounts use simple passwords for easy testing
- All trees have entries/memories for realistic testing

---

**Created:** 2025-10-28
**Last Updated:** 2025-10-28
**Script Location:** `scripts/enhance-beta-tester-transplant.ts`
