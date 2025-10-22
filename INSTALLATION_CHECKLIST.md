# Installation Checklist - Firefly Grove

Use this checklist to ensure your Firefly Grove installation is complete and working correctly.

## Pre-Installation

- [ ] Node.js 18+ installed
  ```bash
  node --version  # Should be v18 or higher
  ```
- [ ] npm installed
  ```bash
  npm --version  # Should be 9+ or higher
  ```
- [ ] Git installed (optional, for cloning)
  ```bash
  git --version
  ```

## Installation Steps

### 1. Dependencies

- [ ] Run `npm install`
- [ ] No error messages during installation
- [ ] `node_modules` folder created
- [ ] Check installed packages:
  ```bash
  npm list --depth=0
  ```

  Should include:
  - next
  - react
  - prisma
  - next-auth
  - stripe
  - tailwindcss

### 2. Environment Setup

- [ ] `.env.local` file exists
- [ ] Contains `DEMO_MODE=true`
- [ ] Contains `DATABASE_URL="file:./dev.db"`
- [ ] Contains `NEXTAUTH_SECRET`
- [ ] Contains all required variables (see `.env.example`)

### 3. Database Setup

- [ ] Run `npm run db:push`
- [ ] No errors reported
- [ ] File `prisma/dev.db` created
- [ ] Check database:
  ```bash
  npm run db:studio
  ```
- [ ] Prisma Studio opens in browser
- [ ] See empty tables (User, Branch, Entry, etc.)

### 4. Seed Demo Data

- [ ] Run `npm run db:seed`
- [ ] See success messages:
  - ✓ Created demo users: Alice and Bob
  - ✓ Created demo branches
  - ✓ Created demo memories
  - ✓ Created demo heir records
  - 🌟 Demo data seeded successfully!
- [ ] No error messages

### 5. Verify Database Contents

- [ ] Open Prisma Studio: `npm run db:studio`
- [ ] Check **User** table:
  - [ ] 2 users (Alice, Bob)
  - [ ] Both have status "ACTIVE"
- [ ] Check **Branch** table:
  - [ ] 2 branches
  - [ ] "Zachary Peterson"
  - [ ] "Childhood Adventures"
- [ ] Check **Entry** table:
  - [ ] 5 total entries
  - [ ] Mix of PRIVATE, SHARED, LEGACY
- [ ] Check **BranchMember** table:
  - [ ] At least 1 member (Bob in Zachary branch)
- [ ] Check **Heir** table:
  - [ ] At least 1 heir entry

## First Run

### 6. Start Development Server

- [ ] Run `npm run dev`
- [ ] See "Ready" message
- [ ] Server running on http://localhost:3000
- [ ] No compilation errors

### 7. Test Landing Page

- [ ] Open http://localhost:3000
- [ ] See "Firefly Grove" title
- [ ] See animated fireflies (5 glowing dots)
- [ ] See "Enter Your Grove" button
- [ ] See three feature cards at bottom
- [ ] Page loads in <2 seconds

### 8. Test Login Page

- [ ] Click "Enter Your Grove"
- [ ] Redirects to `/login`
- [ ] See login form
- [ ] See "Demo Mode - Quick Login" section
- [ ] See two buttons: "Login as Alice" and "Login as Bob"

### 9. Test Authentication

**Using Quick Login:**
- [ ] Click "Login as Alice"
- [ ] Redirects to `/grove`
- [ ] No errors in console

**Using Manual Login:**
- [ ] Logout (click "Sign Out" in header)
- [ ] Enter email: `alice@demo.local`
- [ ] Enter password: `demo123`
- [ ] Click "Sign In"
- [ ] Successful login
- [ ] Redirects to `/grove`

### 10. Test Grove Page

- [ ] See "Your Grove" heading
- [ ] See firefly canvas with animated dots
- [ ] See 2 branch cards:
  - [ ] "Zachary Peterson" with 3 memories
  - [ ] "Childhood Adventures" with 2 memories
- [ ] See "New Branch" button
- [ ] See header with:
  - [ ] "Firefly Grove" title
  - [ ] User name "Alice Johnson"
  - [ ] "Sign Out" button

### 11. Test Branch Creation

- [ ] Click "New Branch"
- [ ] Modal opens
- [ ] Enter title: "Test Branch"
- [ ] Enter description: "Testing the system"
- [ ] Click "Create Branch"
- [ ] Modal closes
- [ ] New branch appears in list
- [ ] Shows "0 memories"

### 12. Test Branch Detail Page

- [ ] Click "Zachary Peterson" card
- [ ] Redirects to `/branch/[id]`
- [ ] See branch title and description
- [ ] See random prompt in box
- [ ] See "Add Memory" button
- [ ] See 3 memory cards below
- [ ] Each memory shows:
  - [ ] Author name
  - [ ] Timestamp (e.g., "2 months ago")
  - [ ] Visibility badge (Private/Shared/Legacy)
  - [ ] Memory text

### 13. Test Memory Creation

- [ ] Click "Add Memory"
- [ ] Modal opens with:
  - [ ] Text area (autofocused)
  - [ ] Photo upload input
  - [ ] Audio recording button
  - [ ] Visibility radio buttons
  - [ ] Cancel and Save buttons
- [ ] Enter text: "This is a test memory"
- [ ] Select "Private" visibility
- [ ] Click "Save Memory"
- [ ] Modal closes
- [ ] New memory appears at top of list
- [ ] Shows your test text

### 14. Test Photo Upload

- [ ] Click "Add Memory"
- [ ] Enter some text
- [ ] Click photo upload
- [ ] Select a small image (<1MB)
- [ ] See image preview appear
- [ ] Click "Save Memory"
- [ ] Memory shows with image displayed

### 15. Test Audio Recording

- [ ] Click "Add Memory"
- [ ] Enter some text
- [ ] Click "Start Recording"
- [ ] Browser asks for microphone permission
- [ ] Click "Allow"
- [ ] Button changes to "Stop Recording" (red, pulsing)
- [ ] Speak for 3 seconds
- [ ] Click "Stop Recording"
- [ ] Audio player appears
- [ ] Click play button - hear your recording
- [ ] Click "Save Memory"
- [ ] Memory shows with audio player

### 16. Test Navigation

- [ ] Click "Back to Grove"
- [ ] Returns to `/grove`
- [ ] All branches still visible
- [ ] Click "Childhood Adventures"
- [ ] See 2 memories
- [ ] Click "Firefly Grove" in header
- [ ] Returns to grove

### 17. Test Export

- [ ] Open any branch
- [ ] Note the branch ID in URL: `/branch/[THIS-ID]`
- [ ] Open new tab
- [ ] Visit: `http://localhost:3000/api/branches/[BRANCH-ID]/export`
- [ ] File downloads automatically
- [ ] File name: `[branch-title]-forever-kit.html`
- [ ] Open HTML file in browser
- [ ] See all memories formatted nicely
- [ ] Dark theme preserved
- [ ] Images display (if any)
- [ ] Audio works (if any)

### 18. Test User Switching

- [ ] Sign out
- [ ] Login as Bob: `bob@demo.local` / `demo123`
- [ ] See different grove view
- [ ] See shared "Zachary Peterson" branch
- [ ] Bob's view may differ from Alice's

### 19. Test Firefly Animation

- [ ] Open `/grove`
- [ ] Watch firefly canvas for 30 seconds
- [ ] Fireflies should:
  - [ ] Move smoothly
  - [ ] Glow (pulse)
  - [ ] Stay within bounds
  - [ ] Not flicker or lag

### 20. Browser Console Check

- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Should have no red errors
- [ ] Yellow warnings are OK
- [ ] Check Network tab
- [ ] All API calls return 200 or 201
- [ ] No 404 or 500 errors

## Production Verification (After Deployment)

If deploying to production, also check:

- [ ] HTTPS enabled (required for audio recording)
- [ ] Custom domain configured (optional)
- [ ] Environment variables set in Vercel
- [ ] Database is PostgreSQL (not SQLite)
- [ ] `DEMO_MODE=false`
- [ ] Stripe webhooks configured
- [ ] Cron jobs enabled
- [ ] First user can register
- [ ] Email notifications work (when implemented)

## Troubleshooting

If any item fails, see:

1. **SETUP_GUIDE.md** - Detailed instructions
2. **QUICKSTART.md** - Quick reference
3. **README.md** - Full documentation
4. **Terminal output** - Check for errors
5. **Browser console** - Check for JavaScript errors

### Common Issues

**Database errors:**
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

**Port in use:**
```bash
PORT=3001 npm run dev
```

**Module not found:**
```bash
npm install
```

**Firefly animation not smooth:**
- Close other tabs
- Use Chrome/Edge
- Check CPU usage

## Success Criteria

Your installation is successful when:

- ✅ All checklist items pass
- ✅ No errors in terminal
- ✅ No errors in browser console
- ✅ Can login and create memories
- ✅ Animations work smoothly
- ✅ Export downloads correctly

## Next Steps

After successful installation:

1. 📖 Read `PROJECT_SUMMARY.md` for overview
2. 🎨 Customize colors in `tailwind.config.ts`
3. ✍️ Edit prompts in `app/branch/[branchId]/page.tsx`
4. 🚀 Deploy to Vercel using `DEPLOYMENT.md`
5. 🧪 Test all features thoroughly
6. 📱 Share with beta testers

## Installation Complete! 🎉

If all items are checked, Firefly Grove is ready to use.

**Demo Credentials:**
- Email: `alice@demo.local`
- Password: `demo123`

**Explore the app and enjoy preserving your memories!**

---

Last Updated: October 2024
