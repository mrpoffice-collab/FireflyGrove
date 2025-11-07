# 📊 Invite Friends - Analytics Tracking

## ✅ Implementation Complete

**Comprehensive analytics tracking has been added to the beta invites flow to measure user engagement and identify friction points.**

---

## 🎯 Events Being Tracked

### 1. **Page View**
**Event:** `invite_page_viewed`
**Triggers:** When user lands on `/beta-invites` page
**Metadata:**
- `isMobile` - Whether user is on mobile device
- `userType` - "admin" or "beta_tester"

**Purpose:** Track how many users click "Invite Friends" and actually reach the invite page

---

### 2. **SMS Button Click**
**Event:** `invite_sms_clicked`
**Triggers:** When user clicks "Send Text Message" button
**Metadata:**
- `hasCustomMessage` - Did they add a personal message?
- `hasName` - Did they include recipient's name?
- `isMobile` - Platform they're using
- `timeOnPage` - How long before they clicked (seconds)

**Purpose:** Track SMS invite engagement and form completion rate

---

### 3. **SMS Abandoned**
**Event:** `invite_sms_attempted`
**Action:** `abandoned`
**Triggers:** When user clicks SMS button without entering phone number
**Metadata:**
- `reason` - "no_phone_number"
- `hasMessage` - Did they fill custom message?
- `hasName` - Did they fill name field?

**Purpose:** Identify friction - are users trying to send SMS but forgetting the phone number?

---

### 4. **Email Button Click**
**Event:** `invite_email_clicked`
**Triggers:** When user clicks "Send Email Invite" button
**Metadata:**
- `hasCustomMessage` - Did they personalize the invite?
- `hasName` - Did they include recipient's name?
- `hasPhone` - Did they also fill phone field?
- `timeOnPage` - Time spent on page before clicking

**Purpose:** Track email invite attempts and form completion patterns

---

### 5. **Email Abandoned**
**Event:** `invite_email_attempted`
**Action:** `abandoned`
**Triggers:** When user clicks email button without entering email address
**Metadata:**
- `reason` - "no_email"
- `hasMessage` - Custom message filled?
- `hasName` - Name field filled?
- `hasPhone` - Phone field filled?

**Purpose:** Identify users who start the flow but don't complete it

---

### 6. **Email Sent Successfully**
**Event:** `invite_email_sent`
**Action:** `success`
**Triggers:** When email invite is successfully sent
**Metadata:**
- `duration` - Time to send (ms)
- `hasCustomMessage` - Was it personalized?
- `hasName` - Recipient name included?
- `recipientEmail` - Email address sent to

**Purpose:** Track successful conversions and personalization rate

---

### 7. **Email Failed**
**Event:** `invite_email_failed`
**Action:** `error`
**Triggers:** When email send fails (server error, network error, etc.)
**Metadata:**
- `duration` - Time until failure (ms)
- `error` - Error message from server
- `statusCode` - HTTP status code
- `errorMessage` - Detailed error info

**Purpose:** Identify technical issues preventing invite sends

---

## 📈 Key Metrics to Watch

### Engagement Funnel:
1. **Page Views** (`invite_page_viewed`)
2. **Button Clicks** (`invite_email_clicked` + `invite_sms_clicked`)
3. **Successful Sends** (`invite_email_sent`)

### Drop-off Points:
- **Abandoned attempts** (`invite_email_attempted` + `invite_sms_attempted`)
- **Failed sends** (`invite_email_failed`)

### Quality Indicators:
- **Time on page** - How long users spend before clicking
- **Personalization rate** - % with custom messages
- **Form completion** - % filling name/message fields

---

## 🔍 How to Use the Data

### 1. Check Overall Engagement
```
Query: Category = "invites"
Look for: invite_page_viewed count
```
**Shows:** How many users clicked "Invite Friends"

---

### 2. Measure Conversion Rate
```
Email Conversion = invite_email_sent / invite_email_clicked
SMS Conversion = (Not directly trackable - opens SMS app)
```
**Shows:** Success rate of invite attempts

---

### 3. Identify Friction Points
```
Query: Action = "abandoned"
Look for: invite_email_attempted, invite_sms_attempted
```
**Shows:** Where users are dropping off (missing required fields)

---

### 4. Track Errors
```
Query: invite_email_failed
Check metadata for: error messages, status codes
```
**Shows:** Technical issues blocking invites

---

### 5. Personalization Analysis
```
Query metadata: hasCustomMessage = true
```
**Shows:** % of invites with personal messages (higher quality)

---

## 📊 Sample Analytics Queries

### Check Recent Invite Activity (Last 7 Days)
```sql
SELECT
  eventType,
  action,
  COUNT(*) as count
FROM AnalyticsEvent
WHERE
  category = 'invites'
  AND createdAt > NOW() - INTERVAL 7 DAY
GROUP BY eventType, action
ORDER BY count DESC
```

### Measure Success Rate
```sql
SELECT
  (SELECT COUNT(*) FROM AnalyticsEvent WHERE eventType = 'invite_email_sent') as successful,
  (SELECT COUNT(*) FROM AnalyticsEvent WHERE eventType = 'invite_email_clicked') as attempted,
  (successful / attempted * 100) as success_rate_percent
```

### Find Abandoned Invites
```sql
SELECT
  metadata,
  createdAt,
  userId
FROM AnalyticsEvent
WHERE action = 'abandoned'
ORDER BY createdAt DESC
LIMIT 20
```

---

## 🎯 What to Look For

### ✅ Good Signals:
- High page view → button click ratio (>70%)
- High email sent → email clicked ratio (>90%)
- Low abandoned attempts (<10%)
- Many users adding custom messages (>30%)
- Fast time-on-page before clicking (shows confidence)

### 🚨 Warning Signals:
- **High page views but low clicks** → UI/friction issue
- **High clicks but low sends** → Technical problem
- **Many abandoned attempts** → Form UX issue (confusing fields)
- **High failure rate** → Email service problem
- **Long time-on-page** → Users confused/hesitant

---

## 🔧 Troubleshooting Guide

### If invites aren't showing in analytics:

1. **Check timeframe** - Default is "Last 7 Days"
2. **Switch to "All Time"** - See all historical data
3. **Run diagnostic script:**
   ```bash
   npx tsx scripts/check-recent-invites.ts
   ```

### If you see high abandonment:

1. Check metadata for `reason` field
2. Look for patterns (always same field missing?)
3. Consider:
   - Better field labels
   - Example text in placeholders
   - Required field indicators
   - Auto-focus on first empty field

### If email sends are failing:

1. Check `invite_email_failed` events
2. Look at `error` and `statusCode` metadata
3. Common issues:
   - Email service not configured
   - Rate limits hit
   - Invalid email addresses
   - Network timeouts

---

## 💡 Future Enhancements

Potential additions:
- [ ] Track form field interactions (focus, blur)
- [ ] Track time spent on each field
- [ ] A/B test different messaging
- [ ] Track invite recipient signups (conversion)
- [ ] Add heatmap for button positions
- [ ] Track copy/paste behavior (SMS link)

---

## 📝 Summary

**Now tracking:**
✅ Page views - Who clicks "Invite Friends"
✅ Button clicks - Email and SMS attempts
✅ Successful sends - Email invites that worked
✅ Failures - Technical errors
✅ Abandoned attempts - Missing required fields
✅ Personalization - Custom messages
✅ Time on page - User hesitation/confidence

**View in dashboard:**
- Go to `/admin/analytics`
- Category: "invites"
- All events are now visible!

---

*Tracking implemented: 2025-11-05*
