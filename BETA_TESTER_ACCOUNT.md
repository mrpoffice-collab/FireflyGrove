# Beta Tester Account - Highly Active User

## Login Credentials

**📧 Email:** `beta@fireflygrove.app`
**🔑 Password:** `BetaTest2024!`
**🌐 Login URL:** https://firefly-grove.vercel.app/login

---

## Account Overview

**Purpose:** Stress test all features with realistic, high-volume data to find edge cases and bugs.

### What's Included:

- **🏡 Grove:** Beta Tester Grove (Family plan)
- **🌳 Branches:** 5 family members
  - 3 Legacy branches (deceased, released to heirs)
  - 2 Living branches (active)
- **📝 Entries:** 130 memories across all branches
- **👨‍👩‍👧 Heirs:** 9 heirs (3 per legacy branch)
- **💾 Backups:** 3 backup records

---

## Family Structure

### Legacy Branches (Deceased):
1. **Rose Elizabeth Thompson (Grandma Rose)**
   - Born: 1935-03-15 | Died: 2018-11-22
   - 25 entries
   - 3 heirs (notified, released)

2. **Joseph Michael Thompson (Grandpa Joe)**
   - Born: 1932-07-04 | Died: 2015-06-10
   - 18 entries
   - 3 heirs (notified, released)

3. **Frank David Thompson (Uncle Frank)**
   - Born: 1955-09-12 | Died: 2020-03-05
   - 12 entries
   - 3 heirs (notified, released)

### Living Branches:
4. **Margaret Ann Thompson (Mom)**
   - Born: 1960-05-20 | Living
   - 35 entries

5. **Carol Sue Henderson (Aunt Carol)**
   - Born: 1958-12-25 | Living
   - 40 entries

---

## Test Coverage

Use this account to test:

### ✅ Memorial Video Maker
- **What to test:** Create videos from branches with lots of entries
- **Data available:** 5 branches, 130 total entries with photos
- **Edge cases:**
  - Large branch with 40 entries (Aunt Carol)
  - Mix of legacy and living branches
  - Entries with/without media

### ✅ Export Functionality
- **What to test:** Export entire grove or individual branches
- **Data available:** 130 entries, multiple media types
- **Edge cases:**
  - Large exports (130 entries)
  - Legacy vs living branch exports
  - Mix of text, photo, and audio entries

### ✅ Heir Management
- **What to test:** Heir notifications, access control, downloads
- **Data available:** 9 heirs across 3 legacy branches
- **Edge cases:**
  - Heirs on released legacy branches
  - Multiple heirs per branch (3 each)
  - Notification status (all notified)

### ✅ Legacy Branch System
- **What to test:** Legacy marking, heir release, status transitions
- **Data available:** 3 released legacy branches, 2 living
- **Edge cases:**
  - Already released branches (3)
  - Death dates in past
  - Legacy flag propagation to entries

### ✅ Search & Filtering
- **What to test:** Search across entries, filter by branch/visibility
- **Data available:** 130 entries, 3 visibility levels
- **Edge cases:**
  - Large result sets
  - Multiple branches
  - Mixed visibility (PRIVATE, SHARED, LEGACY)

### ✅ Backup System
- **What to test:** Backup creation, download, verification
- **Data available:** 3 existing backups
- **Edge cases:**
  - Large backup files (100MB-600MB simulated)
  - Verified backups
  - Weekly backup schedule

### ✅ Multi-Media Entries
- **What to test:** Photo/audio uploads, display, playback
- **Data available:** ~50% have photos, ~30% have audio
- **Edge cases:**
  - Entries with both text and media
  - Placeholder images (Lorem Picsum)
  - Missing media URLs

### ✅ Visibility Controls
- **What to test:** Private, shared, and legacy visibility
- **Data available:** Mix of all 3 visibility types
- **Edge cases:**
  - Legacy entries (auto-released)
  - Shared entries (multi-user access)
  - Private entries (owner-only)

---

## Heirs (for Testing):

**sarah@example.com** - Added to all 3 legacy branches
**michael@example.com** - Added to all 3 legacy branches
**emma@example.com** - Added to all 3 legacy branches

*Note: These are placeholder emails. Use for testing heir notification UI only.*

---

## How to Recreate

If you need to recreate this account (e.g., after data corruption or testing):

```bash
npx tsx scripts/seed-beta-tester.ts
```

This will:
1. Delete existing `beta@fireflygrove.app` account (if exists)
2. Create fresh account with all test data
3. Takes ~10-20 seconds to run

---

## Important Notes

⚠️ **This is a test account** - Do not use for production data
⚠️ **Credentials are in plain text** - Only for development/testing
⚠️ **Backup URLs are fake** - Placeholders for testing UI only
⚠️ **Audio URLs are fake** - Placeholders for testing UI only
⚠️ **Heir emails are fake** - Do not send actual emails to them

---

## Quick Reference Commands

```bash
# Create beta tester account
npx tsx scripts/seed-beta-tester.ts

# View in Prisma Studio
npx prisma studio

# Delete beta tester account (manual)
# Use Prisma Studio or SQL:
# DELETE FROM "User" WHERE email = 'beta@fireflygrove.app';
```

---

## Testing Checklist

When you return to test, try these workflows:

- [ ] Log in with beta account
- [ ] View all 5 branches in grove
- [ ] Create memorial video for "Grandma Rose" (25 entries)
- [ ] Export "Mom" branch (35 entries)
- [ ] Search across all entries
- [ ] Filter by visibility (private/shared/legacy)
- [ ] View heir management for legacy branches
- [ ] Test backup download (simulated)
- [ ] View entries with photos
- [ ] View entries with audio
- [ ] Test pagination with large datasets
- [ ] Test performance with 130 entries

---

## 🌳 TREE TRANSPLANT TESTING

**Additional Setup:** Enhanced with tree transplant/transfer scenarios!

See **TRANSPLANT_TEST_SCENARIOS.md** for complete transplant testing guide.

**Quick Summary:**
- **2 test accounts** (Beta Tester + Recipient)
- **8 trees total** for beta tester (5 original + 3 for transplant)
- **3 transfer scenarios** (pending, accepted, expired)
- **1 recipient account** with received tree

**Test Transplant Feature:**
```bash
npx tsx scripts/enhance-beta-tester-transplant.ts
```

---

## 🌲 OPEN GROVE TESTING

**The Most Sacred Feature:** Open Grove - public legacy tree system!

See **OPEN_GROVE_TEST_SCENARIOS.md** for complete Open Grove testing guide.

**Quick Summary:**
- **3 test accounts** (Beta Tester + Adopter + System)
- **5 legacy trees in Open Grove** with different scenarios
- **1 already-adopted tree** in private grove (for comparison)
- **Memory limit testing** (100 in Open Grove, unlimited after adoption)
- **Trustee expiration scenarios** (active, expiring soon, expired)
- **Adoption workflow** (from public → private)

**Open Grove Test Accounts:**

Beta Tester (Creator):
- Email: beta@fireflygrove.app
- Password: BetaTest2024!
- Role: Creates legacy trees, acts as trustee
- Trees: 4 in Open Grove

Adopter (Receiver):
- Email: adopter@fireflygrove.app
- Password: Adopter2024!
- Role: Browses and adopts legacy trees
- Trees: 1 in Open Grove + 1 already adopted

**Legacy Trees in Open Grove:**
1. **John Doe** - 25/100 memories (ready to adopt)
2. **Jane Smith** - 100/100 memories (AT LIMIT - critical test!)
3. **Robert Johnson** - 15/100 memories (trustee EXPIRED)
4. **Mary Williams** - 5/100 memories (owned by adopter)
5. **James Brown** - 50/100 memories (public, searchable)

**Already Adopted Tree:**
- **Alice Cooper** - 35 memories in private grove (unlimited, private)

**Test Open Grove Feature:**
```bash
npx tsx scripts/setup-open-grove-test.ts
```

**Critical Test Cases:**
- Try to add 101st memory to Jane Smith (should fail)
- Adopt John Doe → verify limit removed
- Add 101st memory after adoption (should succeed)
- View trustee expiration warning (Robert Johnson)
- Test self-adoption (Mary Williams)
- Verify unlimited memories in private grove (Alice Cooper)

---

**Created:** 2025-10-28
**Last Updated:** 2025-10-28
**Script Locations:**
- Base account: `scripts/seed-beta-tester.ts`
- Transplant scenarios: `scripts/enhance-beta-tester-transplant.ts`
- Open Grove scenarios: `scripts/setup-open-grove-test.ts`
