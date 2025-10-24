# Firefly Grove - Beta Testing Guide

Welcome to Firefly Grove beta testing! This guide will help you set up and test the application.

## 🎯 What We're Testing

Firefly Grove is a digital memory preservation platform where users can:
- Create Trees to organize family branches
- Add Memories with photos and audio recordings
- Create Legacy Trees (memorials) for loved ones
- Invite family members to collaborate
- Manage subscriptions and billing

---

## 🚀 Quick Start for Beta Testers

### 1. **Access the Application**

- **URL**: [Your deployed URL here]
- **Test Accounts**: We recommend creating your own account to test the full sign-up flow

### 2. **Sign Up Flow**

1. Visit the homepage
2. Click "Sign Up" button
3. Enter your name, email, and password (min 6 characters)
4. You'll be automatically logged in and redirected to your Grove

### 3. **Test the Core Journey**

#### A. Create Your First Tree
1. Click an empty tree slot in your Grove
2. Choose "Living Family Tree" or "Legacy Tree (Memorial)"
3. Give it a name (e.g., "Smith Family")
4. Click "Create Tree"

#### B. Add a Branch
1. Click on your tree
2. Click "+ New Branch"
3. Enter a name (e.g., "Mom", "Dad", "Grandma")
4. Click "Create Branch"

#### C. Add Memories
1. Click on a branch
2. Click "Add Memory" or "Light a Memory" (for legacy)
3. Write your memory (required)
4. **Optional**: Add a photo (max 5MB)
5. **Optional**: Record audio (max 10MB)
6. Choose visibility (Private, Shared, or Legacy)
7. Click "Save Memory"

---

## 📸 File Upload Limits (Beta)

**Important**: During beta, we're using database storage for files:

- **Photos**: Maximum 5MB per image
- **Audio**: Maximum 10MB per recording
- **Formats**:
  - Images: JPG, PNG, GIF, WebP
  - Audio: WebM (browser-recorded)

**Note**: These files are stored as base64 in the database. This is for beta convenience only and will be migrated to cloud storage for production.

---

## 🧪 Key Features to Test

### ✅ Must Test
- [ ] Sign up with new account
- [ ] Create a tree (both Living and Legacy types)
- [ ] Add branches to a tree
- [ ] Create memories with text only
- [ ] Create memories with photos (test size limits)
- [ ] Create memories with audio recordings
- [ ] View the firefly visualization on tree page
- [ ] Edit branch names
- [ ] Edit memorial tree dates
- [ ] Delete empty branches/memorials

### ⭐ Important to Test
- [ ] Create a memorial in Open Grove
- [ ] Browse Open Grove public memorials
- [ ] Invite a family member to collaborate
- [ ] Test visibility settings (Private vs Shared)
- [ ] View billing page and plan options
- [ ] Test memory duplicate detection
- [ ] Test legacy memory adoption prompt (at 50 memories)

### 🎨 Nice to Test
- [ ] Test on mobile devices
- [ ] Test with slow internet connection
- [ ] Try uploading large files (should be blocked)
- [ ] Test browser back button navigation
- [ ] Test with multiple tabs open

---

## 🐛 Known Limitations (Beta)

1. **File Storage**: Photos/audio stored in database (base64). This works but isn't scalable long-term.
2. **Email Notifications**: Require Resend API key to be configured
3. **Billing**: Currently in Stripe test mode
4. **File Size**: Limited to 5MB (photos) and 10MB (audio) for beta
5. **Audio Format**: Only WebM format (browser native recording)

---

## 📝 What to Report

### 🚨 Critical Issues
- Application crashes or errors
- Unable to sign up or log in
- Cannot create trees or branches
- Cannot save memories
- Data loss or corruption

### ⚠️ Important Issues
- Confusing user experience
- Unclear error messages
- Features not working as expected
- Performance issues (slow loading)

### 💡 Feedback
- Feature requests
- UI/UX suggestions
- Wording improvements
- "It would be cool if..."

---

## 📧 How to Report Issues

**Option 1**: Use the feedback form in the app
- Click your name in the header → "Feedback"
- Describe the issue
- Include steps to reproduce

**Option 2**: Email directly
- Send to: [your-email@example.com]
- Include:
  - What you were trying to do
  - What happened instead
  - Screenshots if relevant
  - Browser and device info

**Option 3**: File an issue (if GitHub access)
- Repository: [Your GitHub URL]
- Use issue template
- Add "beta-testing" label

---

## 🎁 Beta Perks

As a thank you for beta testing:
- ✨ Free access during beta period
- 🌟 Priority support
- 💬 Direct input on feature priorities
- 🎉 Special "Founding Member" status (if we launch this)

---

## 🔒 Privacy & Data

**During Beta**:
- Your data is stored securely in our database
- We will NOT share your data with third parties
- We may reset the database before public launch (we'll notify you)
- Please don't upload sensitive/private information during beta

---

## ❓ FAQ

**Q: Can I invite real family members?**
A: Yes! Just know that this is beta software and may have bugs.

**Q: Will my data be preserved after beta?**
A: We'll do our best, but there's a chance we'll need to reset the database. We'll give advance notice.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions). Audio recording works best in Chrome.

**Q: Can I use this on mobile?**
A: Yes! The site is responsive and works on mobile browsers.

**Q: Is there a mobile app?**
A: Not yet. Mobile browser access only for now.

**Q: What happens when I hit my tree limit?**
A: You'll see an upgrade prompt to a paid plan. During beta, billing is in test mode.

---

## 💪 Beta Testing Best Practices

1. **Be Patient**: Expect bugs and rough edges
2. **Be Thorough**: Try to break things (in a good way!)
3. **Be Honest**: Tell us what doesn't work or feels wrong
4. **Be Vocal**: No feedback is too small
5. **Be Creative**: Use the app in ways we didn't expect

---

## 🎯 Testing Scenarios

### Scenario 1: Family Tree for Living Family
1. Create a "Smith Family" tree
2. Add branches for Mom, Dad, Sister, Brother
3. Add memories to each branch with photos from family events
4. Invite Mom to collaborate on her branch
5. Test visibility: Make some memories Private, some Shared

### Scenario 2: Memorial for Loved One
1. Create a memorial in Open Grove
2. Add their birth/death dates
3. Add 5-10 memories with photos
4. View it in Open Grove as a public visitor would
5. Test adopting it into your private grove

### Scenario 3: Multi-Tree Organization
1. Create 3 different trees (e.g., Mom's Side, Dad's Side, Friends)
2. Add branches to each
3. Test navigating between trees
4. Try hitting your tree limit (3 for free plan)
5. View the billing upgrade flow

---

## 🛠️ Troubleshooting

**Problem**: "Can't upload photo"
**Solution**: Check file size (must be under 5MB). Try a smaller photo.

**Problem**: "Microphone not working"
**Solution**: Check browser permissions. Chrome works best for audio recording.

**Problem**: "Email invites not sending"
**Solution**: This is a known limitation - email requires server configuration.

**Problem**: "Page won't load"
**Solution**: Try refreshing. If that doesn't work, clear browser cache or try incognito mode.

---

## 📞 Support

Need help? Reach out:
- **Email**: [your-email@example.com]
- **Response Time**: Usually within 24 hours
- **Best Time**: [Your timezone and availability]

---

## 🙏 Thank You!

Thank you for being an early tester of Firefly Grove. Your feedback will directly shape the future of this platform.

Every bug you find, every suggestion you make, and every moment you spend testing helps us build something meaningful for families everywhere.

Let's make memories last forever. 🌟

---

**Last Updated**: [Current Date]
**Beta Version**: 0.1.0
