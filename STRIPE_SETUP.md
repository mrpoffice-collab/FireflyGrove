# Stripe Setup Guide for Firefly Grove

This guide will walk you through setting up Stripe for billing and subscriptions in test mode.

---

## 📋 Overview

You need to create:
- ✅ Stripe account (test mode)
- ✅ 4 Products with recurring prices
- ✅ Configure webhook endpoint
- ✅ Add keys to environment variables

**Time required**: ~15 minutes

---

## 🚀 Step 1: Create Stripe Account

1. Go to [stripe.com/register](https://stripe.com/register)
2. Sign up with your email
3. Complete the registration
4. **Stay in Test Mode** (toggle in top right should say "Test mode")

---

## 💰 Step 2: Create Products & Prices

You need to create 4 subscription products in Stripe Dashboard.

### Go to: Products → Add Product

---

### **Product 1: Family Grove**

- **Product Name**: `Family Grove`
- **Description**: `Ideal for growing families - 10 Family Trees`
- **Pricing Model**: `Recurring`
- **Price**: `$9.99`
- **Billing Period**: `Yearly`
- **Currency**: `USD`

Click **"Save Product"** and **copy the Price ID** (starts with `price_xxx`)

---

### **Product 2: Ancestry Grove**

- **Product Name**: `Ancestry Grove`
- **Description**: `For extensive family histories - 25 Family Trees`
- **Pricing Model**: `Recurring`
- **Price**: `$19.99`
- **Billing Period**: `Yearly`
- **Currency**: `USD`

Click **"Save Product"** and **copy the Price ID**

---

### **Product 3: Community Grove**

- **Product Name**: `Community Grove`
- **Description**: `For organizations and large families - 100 Family Trees`
- **Pricing Model**: `Recurring`
- **Price**: `$99.00`
- **Billing Period**: `Yearly`
- **Currency**: `USD`

Click **"Save Product"** and **copy the Price ID**

---

### **Product 4: Individual Tree**

- **Product Name**: `Individual Tree`
- **Description**: `Keep one person's tree active independently`
- **Pricing Model**: `Recurring`
- **Price**: `$4.99`
- **Billing Period**: `Yearly`
- **Currency**: `USD`

Click **"Save Product"** and **copy the Price ID**

---

## 🔑 Step 3: Get API Keys

### Go to: Developers → API keys

You'll see:

1. **Publishable key** (starts with `pk_test_`)
2. **Secret key** (starts with `sk_test_`) - click "Reveal test key"

**Copy both keys** - you'll need them next.

---

## 🪝 Step 4: Configure Webhook

Webhooks allow Stripe to notify your app when subscriptions change.

### Go to: Developers → Webhooks → Add endpoint

**Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
*(Replace with your actual deployment URL - for local testing use ngrok)*

**Events to listen to**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Click **"Add endpoint"**

Then click on the webhook and **reveal the signing secret** (starts with `whsec_`)

**Copy this webhook secret** - you'll need it.

---

## 🔧 Step 5: Update Environment Variables

### Update your `.env.local` file:

```env
# Stripe Test Mode Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from Step 2)
STRIPE_PRICE_FAMILY=price_YOUR_FAMILY_PRICE_ID
STRIPE_PRICE_ANCESTRY=price_YOUR_ANCESTRY_PRICE_ID
STRIPE_PRICE_INSTITUTIONAL=price_YOUR_COMMUNITY_PRICE_ID
STRIPE_PRICE_INDIVIDUAL_TREE=price_YOUR_INDIVIDUAL_TREE_PRICE_ID
```

**Important**: Keep the `_test_` versions for now. Switch to live keys only when ready for production.

---

## ✅ Step 6: Test the Integration

1. **Restart your dev server** (so it picks up new env vars)
   ```bash
   npm run dev
   ```

2. **Navigate to billing page** in your app
   - You should see all 4 plans listed

3. **Try to "Select Plan"** (Family Grove)
   - Should redirect to Stripe Checkout
   - You should see the $9.99/year subscription

4. **Use Stripe test cards** to complete payment:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC (e.g., 123)

5. **After successful payment**:
   - You should be redirected back to your app
   - Your plan should update to "Family Grove"
   - Your tree limit should increase to 10

---

## 🧪 Testing Webhooks Locally

If testing locally (localhost), Stripe can't reach your webhook. Use **Stripe CLI**:

### Install Stripe CLI:
```bash
# Windows (with Scoop)
scoop install stripe

# Mac (with Homebrew)
brew install stripe/stripe-cli/stripe
```

### Forward webhooks to localhost:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret starting with `whsec_` - use this in `.env.local` for local testing.

---

## 🎯 What Each Environment Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side, shows checkout | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Server-side, creates charges | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook authenticity | `whsec_...` |
| `STRIPE_PRICE_FAMILY` | Family Grove price ID | `price_...` |
| `STRIPE_PRICE_ANCESTRY` | Ancestry Grove price ID | `price_...` |
| `STRIPE_PRICE_INSTITUTIONAL` | Community Grove price ID | `price_...` |
| `STRIPE_PRICE_INDIVIDUAL_TREE` | Individual Tree price ID | `price_...` |

---

## 📊 Your Current Plan Structure

Based on `lib/plans.ts`:

| Plan | Price | Trees | Popular |
|------|-------|-------|---------|
| Trial Grove | Free | 1 | - |
| **Family Grove** | $9.99/year | 10 | ⭐ Popular |
| Ancestry Grove | $19.99/year | 25 | - |
| Community Grove | $99/year | 100 | - |
| Individual Tree | $4.99/year | 1 | - |

---

## 🐛 Troubleshooting

**Problem**: "No such price: price_xxx"
**Solution**: Make sure you copied the correct Price ID from Stripe Dashboard, not the Product ID.

**Problem**: "Webhook signature verification failed"
**Solution**: Make sure your `STRIPE_WEBHOOK_SECRET` matches the one from the webhook endpoint in Stripe Dashboard.

**Problem**: "Invalid API Key"
**Solution**: Double-check you copied the full key including the prefix (`pk_test_` or `sk_test_`).

**Problem**: Plans not showing up
**Solution**: Restart your dev server after adding environment variables.

**Problem**: Webhook not triggering
**Solution**: For local testing, use Stripe CLI with `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 🔒 Security Notes

- ✅ Never commit real API keys to Git
- ✅ Use test mode (`_test_`) keys during development
- ✅ Webhook secret prevents spoofed requests
- ✅ Always verify webhook signatures
- ✅ Keep secret keys server-side only

---

## 🚀 Production Checklist

Before going live:

- [ ] Create live mode products in Stripe (same as test mode)
- [ ] Get live API keys (starts with `pk_live_` and `sk_live_`)
- [ ] Update webhook endpoint to production URL
- [ ] Update environment variables in production hosting
- [ ] Test with real (small amount) transaction
- [ ] Set up Stripe tax settings (if applicable)
- [ ] Configure email receipts in Stripe settings

---

## 📧 Support

If you get stuck:
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Discord**: [stripe.com/community](https://stripe.com/community)
- **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## ✨ Quick Reference: Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**For all test cards**:
- Use any future expiry date
- Use any 3-digit CVC
- Use any billing postal code

---

## 🎉 Done!

Once you have all 7 environment variables set, your Stripe integration will be complete and you can test the full billing flow!

**Next steps**:
1. Set up all environment variables
2. Restart your dev server
3. Test a subscription purchase
4. Verify webhook is working
5. Ready for beta testers! 🚀
