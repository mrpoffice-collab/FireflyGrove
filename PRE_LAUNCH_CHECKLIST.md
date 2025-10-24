# Pre-Launch Verification Checklist

Before inviting beta testers, verify everything is working on production.

---

## ✅ Core User Journey

Test these on https://fireflygrove.app:

### Authentication
- [ ] Homepage loads properly
- [ ] Sign Up button visible and works
- [ ] Can create new account
- [ ] Auto-login after signup works
- [ ] Can log out and log back in
- [ ] Password reset works (if implemented)

### Grove & Trees
- [ ] Grove page displays after login
- [ ] Shows correct tree limit (1 for trial)
- [ ] Can click empty slot to create tree
- [ ] Tree creation modal works
- [ ] Can choose between Living/Legacy tree types
- [ ] Tree appears in grove after creation

### Branches
- [ ] Can click tree to view it
- [ ] Firefly visualization displays
- [ ] "+ New Branch" button works
- [ ] Can create a branch
- [ ] Branch appears in tree
- [ ] Can click branch to open it

### Memories
- [ ] "Add Memory" button visible
- [ ] Memory modal opens
- [ ] Can write text memory
- [ ] Can upload photo (test under 5MB)
- [ ] Photo size limit enforced (test over 5MB - should reject)
- [ ] Can record audio
- [ ] Audio size limit enforced (test long recording)
- [ ] Memory saves successfully
- [ ] Memory appears in branch

### Legacy Trees (Memorials)
- [ ] Can create memorial from grove
- [ ] Can edit memorial dates (pencil icon)
- [ ] Dates display correctly (no timezone issues)
- [ ] Can delete empty memorial
- [ ] Cannot delete memorial with memories
- [ ] Memorial appears in Open Grove

### Open Grove
- [ ] Open Grove page loads
- [ ] Public memorials display
- [ ] Can click memorial to view
- [ ] Can add memories to public memorial
- [ ] Memory limit (100) enforced for non-adopted trees

---

## 💳 Billing & Subscriptions

### Billing Page
- [ ] /billing page loads
- [ ] Shows current plan (Trial Grove)
- [ ] Shows 4 subscription options:
  - [ ] Family Grove ($9.99/year)
  - [ ] Ancestry Grove ($19.99/year)
  - [ ] Community Grove ($99/year)
  - [ ] Individual Tree ($4.99/year)
- [ ] Prices display correctly

### Checkout Flow
- [ ] Can click "Select Plan" on any plan
- [ ] Redirects to Stripe Checkout
- [ ] Can complete payment with test card: `4242 4242 4242 4242`
- [ ] Redirects back to app after payment
- [ ] Plan updates correctly on billing page
- [ ] Tree limit increases (e.g., 1 → 10 for Family)

### Subscription Management
- [ ] "Manage Payment Method & Billing" button works
- [ ] Redirects to Stripe Customer Portal
- [ ] Can update payment method in portal
- [ ] Plan changes sync back to app

### Webhook Verification
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Webhook endpoint shows recent successful events
- [ ] No 400/500 errors in webhook logs

---

## 🐛 Feedback System

### Access
- [ ] Click name in header → dropdown appears
- [ ] "🐛 Report an Issue" link visible
- [ ] Link goes to /feedback page

### Feedback Form
- [ ] Form loads properly
- [ ] Can fill out all fields
- [ ] Can submit feedback
- [ ] Shows success message after submit
- [ ] Email arrives at mrpoffice@gmail.com
- [ ] Email contains all submitted info
- [ ] Email is formatted nicely

---

## 🔧 Technical Checks

### Environment Variables (Vercel)
Go to Vercel → Settings → Environment Variables

Verify these are set:
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
- [ ] `STRIPE_SECRET_KEY` (sk_test_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
- [ ] `STRIPE_PRICE_FAMILY` (price_...)
- [ ] `STRIPE_PRICE_ANCESTRY` (price_...)
- [ ] `STRIPE_PRICE_INSTITUTIONAL` (price_...)
- [ ] `STRIPE_PRICE_INDIVIDUAL_TREE` (price_...)
- [ ] `RESEND_API_KEY` (re_...)
- [ ] `RESEND_FROM_EMAIL` (noreply@fireflygrove.app)
- [ ] `FEEDBACK_EMAIL` (mrpoffice@gmail.com)
- [ ] `DATABASE_URL` (your database connection string)
- [ ] `NEXTAUTH_SECRET` (your secret)
- [ ] `NEXTAUTH_URL` (https://fireflygrove.app)

### Deployment Status
- [ ] Latest deployment successful (green checkmark)
- [ ] No build errors
- [ ] All recent commits deployed
- [ ] Check deployment time matches recent changes

### Logs Check
- [ ] Go to Vercel → Deployments → Latest → Function Logs
- [ ] No critical errors showing
- [ ] No repeated warnings

---

## 📱 Browser Testing

Test on at least 2 browsers:
- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop or Mobile)
- [ ] Chrome (Mobile)

### Mobile Responsiveness
On mobile browser:
- [ ] Homepage looks good
- [ ] Can sign up
- [ ] Grove page is usable
- [ ] Can create tree/branch
- [ ] Can add memory
- [ ] Photo upload works
- [ ] Audio recording works

---

## 📧 Email Testing

### Resend Configuration
- [ ] Resend dashboard shows verified domain/email
- [ ] Recent emails showing in Resend logs
- [ ] Test feedback email sent and received
- [ ] Email rendering looks good (not in spam)

---

## 🎯 Performance Check

- [ ] Homepage loads in < 3 seconds
- [ ] Grove page loads in < 3 seconds
- [ ] Tree page loads in < 3 seconds
- [ ] Branch page loads in < 3 seconds
- [ ] Images load properly
- [ ] No broken links
- [ ] No console errors on any page

---

## 📄 Documentation Ready

- [ ] BETA_SETUP.md has correct URL (https://fireflygrove.app)
- [ ] BETA_SETUP.md has correct email (mrpoffice@gmail.com)
- [ ] BETA_SETUP.md has current date
- [ ] BETA_WELCOME_EMAIL.md is ready to customize
- [ ] STRIPE_SETUP.md available for reference (if needed)

---

## 🚀 Final Checks

- [ ] All recent commits pushed to GitHub
- [ ] Vercel auto-deployed latest code
- [ ] No demo mode warnings showing
- [ ] Stripe in test mode (not live)
- [ ] You have your own test account
- [ ] You've tested the full journey yourself

---

## ✅ Ready to Launch!

Once all boxes are checked:

1. **Send welcome email** to first 1-3 beta testers (use BETA_WELCOME_EMAIL.md)
2. **Attach BETA_SETUP.md** to the email
3. **Monitor mrpoffice@gmail.com** for feedback
4. **Check Vercel logs** for any errors
5. **Be available** to answer questions quickly

---

## 📊 During Beta

### Daily:
- Check mrpoffice@gmail.com for feedback
- Review Vercel function logs for errors
- Check Stripe dashboard for any payment issues

### Weekly:
- Compile feedback into prioritized list
- Fix critical bugs immediately
- Plan feature improvements based on feedback

### Before Adding More Testers:
- Fix any critical bugs found
- Verify existing testers can use core features
- Update documentation if needed

---

**Good luck with your beta launch!** 🎉
