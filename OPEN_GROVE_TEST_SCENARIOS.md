# Open Grove Test Scenarios

## Overview
Complete test setup for the **Open Grove** system - the public legacy tree system where deceased individuals' memories are preserved temporarily (100 memory limit, 60-day trustee period) before being adopted into private groves for unlimited storage.

---

## 👥 TEST ACCOUNTS

### Beta Tester (Creator/Trustee)
```
📧 Email:    beta@fireflygrove.app
🔑 Password: BetaTest2024!
🌳 Trees:    4 legacy trees in Open Grove
```

**What Beta Tester Can Test:**
- Create new legacy trees in Open Grove
- Add memories up to 100 limit
- View trustee expiration warnings
- Adopt trees into their private grove
- See difference between Open Grove (limited) and Private Grove (unlimited)

### Adopter User
```
📧 Email:    adopter@fireflygrove.app
🔑 Password: Adopter2024!
🌳 Trees:    1 in Open Grove + 1 already adopted
```

**What Adopter Can Test:**
- Browse Open Grove for legacy trees
- Adopt trees from Open Grove into private grove
- See memory limit removed after adoption
- Add unlimited memories to adopted trees
- Manage both Open Grove and privately adopted trees

---

## 🌲 OPEN GROVE SYSTEM

**What is Open Grove?**
- System-managed grove (ID: `cmh3v2j820002nllms3zs6kf9`)
- Public space for legacy trees of deceased individuals
- **100 memory limit** per tree (prevents spam/abuse)
- **60-day trustee period** (temporary caretaker)
- Trees can be discovered and adopted by family members
- After adoption → moves to private grove → **unlimited memories**

**Key Architecture:**
- System user: `system@fireflygrove.com`
- Grove status: `LOCKED` (can't login)
- Plan type: `institutional`
- Tree limit: 999,999 (effectively unlimited trees)

---

## 📊 LEGACY TREES IN OPEN GROVE

### 1. John Doe (Ready for Adoption) ✅
**Status:** Active, ready to adopt
- **Birth:** 1940-05-15
- **Death:** 2023-08-20
- **Memories:** 25/100 (can add 75 more)
- **Trustee:** Beta Tester
- **Trustee Expires:** 50 days from now
- **Owner:** Beta Tester
- **Discovery:** Enabled

**Test Cases:**
- Add memories (should accept up to memory 100)
- Adopt into private grove
- Verify limit removed after adoption
- Add 101st memory after adoption (should succeed)

---

### 2. Jane Smith (At Memory Limit) 🔴
**Status:** AT 100 MEMORY LIMIT - Critical test case!
- **Birth:** 1935-11-03
- **Death:** 2024-01-10
- **Memories:** 100/100 (FULL)
- **Trustee:** Beta Tester
- **Trustee Expires:** 30 days from now
- **Owner:** Beta Tester
- **Discovery:** Enabled

**Test Cases:**
- Try to add 101st memory (should fail with error)
- Verify error message is clear and helpful
- Adopt into private grove
- After adoption, add 101st memory (should succeed)
- Verify unlimited memories after adoption

**Expected Error:**
```
"Memory limit reached (100/100). Adopt this tree into your private grove for unlimited memories."
```

---

### 3. Robert Johnson (Trustee Expired) ⏰
**Status:** Trustee period expired
- **Birth:** 1945-02-28
- **Death:** 2022-12-05
- **Memories:** 15/100
- **Trustee:** Beta Tester
- **Trustee Expires:** EXPIRED (10 days ago)
- **Owner:** Beta Tester
- **Discovery:** Enabled

**Test Cases:**
- View expired trustee warning
- Verify tree is still accessible
- Check if additional memories can be added (depends on policy)
- Adopt despite expiration
- Verify adoption works correctly

**Expected Behavior:**
- Tree remains in Open Grove after expiration
- Visible to public for discovery/adoption
- Trustee can still manage (grace period)
- Clear warning: "Trustee period expired X days ago"

---

### 4. Mary Williams (Fresh Tree) 🆕
**Status:** Fresh, recently added
- **Birth:** 1950-07-12
- **Death:** 2024-10-01
- **Memories:** 5/100 (plenty of space)
- **Trustee:** Adopter User
- **Trustee Expires:** 58 days from now
- **Owner:** Adopter User (owned by adopter!)
- **Discovery:** Enabled

**Test Cases:**
- Log in as adopter, see this tree
- Add memories as trustee
- Adopt own tree into private grove
- Verify self-adoption works correctly
- Test ownership edge case

---

### 5. James Brown (Public Tree) 🌐
**Status:** Public, discoverable
- **Birth:** 1938-04-19
- **Death:** 2021-06-30
- **Memories:** 50/100 (half full)
- **Trustee:** Beta Tester
- **Trustee Expires:** 40 days from now
- **Owner:** Beta Tester
- **Discovery:** Enabled

**Test Cases:**
- Search for "James Brown" in Open Grove
- View as public visitor (if implemented)
- Test discovery/search functionality
- Verify memories are visible (LEGACY visibility)
- Adopt as different user

---

## 🏡 PRIVATE GROVE COMPARISON

### Alice Cooper (Already Adopted) ✅
**Status:** In adopter's private grove (NOT in Open Grove)
- **Birth:** 1942-06-15
- **Death:** 2023-03-20
- **Memories:** 35 (no limit!)
- **Owner:** Adopter User
- **Grove:** Adopter's private grove
- **Discovery:** Disabled (private after adoption)
- **Memory Limit:** NULL (unlimited)
- **Trustee Expires:** NULL (no longer needed)

**Test Cases:**
- Log in as adopter, see this tree in your grove
- Add unlimited memories (no 100 limit)
- Verify no trustee expiration warnings
- Confirm privacy (not discoverable in Open Grove)
- Test that this tree does NOT appear in Open Grove search

**Why This Matters:**
Shows the contrast between Open Grove (limited, public, temporary) and Private Grove (unlimited, private, permanent).

---

## 🧪 COMPLETE TEST PLAN

### As Beta Tester:

#### Test 1: Create New Legacy Tree in Open Grove
1. Log in as beta@fireflygrove.app
2. Navigate to "Create Legacy Tree" or similar
3. Enter details for deceased person
4. Verify tree appears in Open Grove
5. Check memory limit is 100
6. Check trustee expiration is 60 days from creation

#### Test 2: Add Memories to Open Grove Tree
1. Select John Doe tree (25/100)
2. Add 10 new memories
3. Verify counter updates: 35/100
4. Try to add 75 more memories (should reach 100)
5. Try to add 101st memory (should fail)

#### Test 3: Hit Memory Limit
1. Select Jane Smith tree (100/100)
2. Try to add new memory
3. Verify clear error message
4. Error should suggest adoption
5. Check no data corruption occurred

#### Test 4: View Trustee Expiration Warning
1. Select Robert Johnson tree (expired)
2. See expiration warning banner
3. Verify warning is clear and actionable
4. Check if memories can still be added

#### Test 5: Adopt Tree into Private Grove
1. Select John Doe tree
2. Click "Adopt Tree" or similar button
3. Confirm adoption
4. Verify tree moves to your private grove
5. Check memory limit is removed (NULL)
6. Verify trustee expiration removed
7. Verify tree count incremented in your grove

#### Test 6: Add Unlimited Memories After Adoption
1. After adopting John Doe
2. Add 50+ memories (past original 100 limit)
3. Verify no limit enforced
4. Check all memories display correctly

---

### As Adopter User:

#### Test 1: Browse Open Grove
1. Log in as adopter@fireflygrove.app
2. Navigate to /open-grove page
3. See list of 5 legacy trees
4. Verify all trees visible and discoverable

#### Test 2: View Already-Adopted Tree
1. Check your grove dashboard
2. Find Alice Cooper tree
3. Verify it shows 35 memories
4. Verify no memory limit indicator
5. Verify no trustee expiration date
6. Confirm it does NOT appear in Open Grove

#### Test 3: View Tree You Own in Open Grove
1. Browse Open Grove
2. Find Mary Williams tree
3. Verify you see "You are the trustee" indicator
4. Note that it's still in Open Grove (not your private grove yet)

#### Test 4: Adopt Your Own Tree
1. Select Mary Williams tree
2. Adopt it into your private grove
3. Verify self-adoption works
4. Check tree removed from Open Grove
5. Verify it now appears in your private grove

#### Test 5: Adopt Someone Else's Tree
1. Browse Open Grove
2. Select John Doe (owned by beta tester)
3. Click "Adopt Tree"
4. Confirm adoption
5. Verify ownership transfers to you
6. Verify memory limit removed
7. Add memories past 100 to confirm unlimited

#### Test 6: Try to Adopt at Memory Limit
1. Browse Open Grove
2. Find Jane Smith (100/100)
3. Adopt this tree
4. Verify adoption succeeds despite being full
5. After adoption, add 101st memory (should work)

---

## 🔍 EDGE CASES TO TEST

### Memory Limit System:
- [ ] Adding memory #100 (should succeed)
- [ ] Adding memory #101 in Open Grove (should fail)
- [ ] Adding memory #101 after adoption (should succeed)
- [ ] Error message clarity at limit
- [ ] Memory counter accuracy (100/100 display)
- [ ] Batch uploads at limit (what happens?)

### Trustee Expiration:
- [ ] Tree with 1 day left (urgent warning)
- [ ] Tree expired yesterday (grace period?)
- [ ] Tree expired 10 days ago (what happens to tree?)
- [ ] Auto-actions after expiration (any?)
- [ ] Trustee can still add memories after expiration?
- [ ] Expiration warnings visible to all or just trustee?

### Adoption System:
- [ ] Adopt tree with 1 memory
- [ ] Adopt tree with 100 memories (full)
- [ ] Adopt tree with expired trustee
- [ ] Adopt own tree (self-adoption)
- [ ] Adopt tree from different user
- [ ] Grove tree limit enforcement during adoption
- [ ] What happens to original trustee after adoption?
- [ ] Can original owner/trustee still see tree?

### Discovery/Search:
- [ ] Search by name
- [ ] Search by death date range
- [ ] Filter by memory count
- [ ] Filter by trustee expiration
- [ ] Sort options (newest, oldest, most memories, etc.)
- [ ] Trees with discoveryEnabled: false (should not appear)
- [ ] Private adopted trees (should not appear)

### Permissions:
- [ ] Non-trustee adding memories to Open Grove tree
- [ ] Non-owner adopting tree
- [ ] Multiple users adopting same tree (race condition)
- [ ] Trustee deleting tree (allowed?)
- [ ] Public viewing Open Grove trees (logged out)

### Data Integrity:
- [ ] All memories transfer during adoption
- [ ] Media URLs preserved after adoption
- [ ] Branch settings maintained
- [ ] GroveTreeMembership records correct
- [ ] Tree count updates correctly
- [ ] No orphaned entries after adoption

---

## 📊 DATABASE VERIFICATION

After testing, verify in Prisma Studio or SQL:

```sql
-- Check Open Grove trees
SELECT
  p.name,
  p.memoryCount,
  p.memoryLimit,
  p.isLegacy,
  p.trusteeExpiresAt,
  u.email as owner_email
FROM "Person" p
JOIN "User" u ON p.ownerId = u.id
JOIN "GroveTreeMembership" gtm ON p.id = gtm.personId
JOIN "Grove" g ON gtm.groveId = g.id
WHERE g.isOpenGrove = true
ORDER BY p.name;

-- Check private adopted trees
SELECT
  p.name,
  p.memoryCount,
  p.memoryLimit,
  p.trusteeExpiresAt,
  u.email as owner_email,
  g.name as grove_name
FROM "Person" p
JOIN "User" u ON p.ownerId = u.id
JOIN "GroveTreeMembership" gtm ON p.id = gtm.personId
JOIN "Grove" g ON gtm.groveId = g.id
WHERE g.isOpenGrove = false AND p.isLegacy = true
ORDER BY p.name;

-- Check memory counts match entries
SELECT
  p.name,
  p.memoryCount as counted,
  COUNT(e.id) as actual
FROM "Person" p
LEFT JOIN "Branch" b ON p.id = b.personId
LEFT JOIN "Entry" e ON b.id = e.branchId
GROUP BY p.id, p.name, p.memoryCount
HAVING p.memoryCount != COUNT(e.id);

-- Check for trees at limit
SELECT
  p.name,
  p.memoryCount,
  p.memoryLimit,
  CASE
    WHEN p.memoryLimit IS NOT NULL AND p.memoryCount >= p.memoryLimit
    THEN 'AT LIMIT'
    ELSE 'OK'
  END as status
FROM "Person" p
WHERE p.isLegacy = true
ORDER BY p.memoryCount DESC;
```

---

## 🐛 KNOWN ISSUES TO WATCH FOR

1. **Memory limit not enforced:** Check if API validates against `memoryLimit` field
2. **Counter not updating:** Verify `memoryCount` increments on entry creation
3. **Adoption fails silently:** Ensure transaction completes fully or rolls back
4. **Trustee expiration ignored:** Check if UI shows warnings
5. **Search/discovery broken:** Verify `discoveryEnabled` flag is checked
6. **Tree appears in both groves:** Check GroveTreeMembership after adoption
7. **Unlimited after adoption not working:** Verify `memoryLimit` set to NULL

---

## ✅ SUCCESS CRITERIA

Open Grove system is working correctly if:

- ✅ Trees in Open Grove have 100 memory limit
- ✅ Trees in Open Grove have 60-day trustee period
- ✅ Clear error when trying to add 101st memory
- ✅ Adoption moves tree to private grove
- ✅ Memory limit removed after adoption (NULL)
- ✅ Trustee expiration removed after adoption (NULL)
- ✅ Unlimited memories possible in private grove
- ✅ Discovery/search finds Open Grove trees
- ✅ Private adopted trees not discoverable
- ✅ All memories and data preserved during adoption
- ✅ Tree count updates correctly in both groves
- ✅ Expired trustees show clear warnings

---

## 🚀 HOW TO RECREATE

If you need to reset and recreate these scenarios:

```bash
# Run the Open Grove setup script
npx tsx scripts/setup-open-grove-test.ts
```

This will:
1. Initialize Open Grove (system grove)
2. Create adopter user
3. Create 5 legacy trees in Open Grove with different scenarios
4. Create 1 already-adopted tree in private grove
5. Set up memory limit testing (100 limit)
6. Set up trustee expiration scenarios
7. Populate with realistic memory data

**Note:** Run `scripts/seed-beta-tester.ts` first if beta tester account doesn't exist.

---

## 📝 DETAILED TEST SCENARIOS

### Scenario A: Memory Limit Testing

**Objective:** Verify 100 memory limit in Open Grove and unlimited after adoption

**Steps:**
1. Log in as beta@fireflygrove.app
2. Select Jane Smith tree (100/100)
3. Try to add memory → Should fail
4. Note error message
5. Adopt Jane Smith into private grove
6. Try to add memory again → Should succeed
7. Add 50 more memories (150 total)
8. Verify all display correctly

**Expected Results:**
- Error at 101 in Open Grove: Clear message with adoption suggestion
- After adoption: No limit, counter shows 150+
- UI shows "Unlimited" instead of "X/100"

---

### Scenario B: Trustee Expiration

**Objective:** Test expiration warnings and grace period

**Steps:**
1. Log in as beta@fireflygrove.app
2. View Robert Johnson tree (expired 10 days ago)
3. Note warning banner
4. Try to add memory (should work? depends on policy)
5. Try to adopt expired tree
6. Verify adoption succeeds

**Expected Results:**
- Clear warning: "Trustee period expired 10 days ago"
- Suggestion to adopt or extend trustee period
- Tree still functional and adoptable

---

### Scenario C: Self-Adoption

**Objective:** Test adopting your own tree from Open Grove

**Steps:**
1. Log in as adopter@fireflygrove.app
2. View Mary Williams tree (you own this)
3. Note "You are the trustee" indicator
4. Adopt into your private grove
5. Verify tree leaves Open Grove
6. Verify tree appears in private grove
7. Add memories past 100

**Expected Results:**
- Self-adoption works seamlessly
- Tree removed from Open Grove discovery
- Memory limit removed
- Trustee period no longer relevant

---

### Scenario D: Cross-User Adoption

**Objective:** Test adopting another user's tree

**Steps:**
1. Log in as adopter@fireflygrove.app
2. Browse Open Grove
3. Select John Doe (owned by beta tester)
4. Adopt this tree
5. Log out, log in as beta@fireflygrove.app
6. Verify you no longer see John Doe in your trees
7. Log back in as adopter
8. Verify full ownership and permissions

**Expected Results:**
- Adoption transfers ownership completely
- Original owner loses access
- New owner has full permissions
- Memory limit removed for new owner

---

## 🎯 TESTING PRIORITIES

**Critical (Test First):**
1. Memory limit enforcement (Jane Smith)
2. Memory limit removal after adoption
3. Adoption workflow (John Doe → Adopter)
4. Unlimited memories in private grove (Alice Cooper)

**High Priority:**
5. Trustee expiration warnings (Robert Johnson)
6. Self-adoption (Mary Williams)
7. Discovery/search functionality
8. Error messages at memory limit

**Medium Priority:**
9. Tree counter updates
10. Data integrity during adoption
11. Permission changes after adoption
12. Grove tree count enforcement

**Low Priority:**
13. Search filters and sorting
14. Batch memory operations
15. Edge cases (multiple adoptions, race conditions)
16. Public visitor view (if implemented)

---

## 📧 TEST CREDENTIALS SUMMARY

```
Beta Tester (Creator):
📧 beta@fireflygrove.app
🔑 BetaTest2024!
🌳 4 trees in Open Grove

Adopter (Receiver):
📧 adopter@fireflygrove.app
🔑 Adopter2024!
🌳 1 in Open Grove + 1 adopted

System User (Open Grove owner):
📧 system@fireflygrove.com
🔒 LOCKED (cannot login)
```

---

## 🌐 URLS

- **Login:** https://firefly-grove.vercel.app/login
- **Open Grove:** https://firefly-grove.vercel.app/open-grove
- **Dashboard:** https://firefly-grove.vercel.app/dashboard (or /grove)
- **Prisma Studio:** http://localhost:5555

---

**Created:** 2025-10-28
**Last Updated:** 2025-10-28
**Script Location:** `scripts/setup-open-grove-test.ts`
