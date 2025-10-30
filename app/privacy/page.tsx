'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

export default function PrivacyPolicyPage() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsAdmin((session.user as any).isAdmin || false)
    }
  }, [session])

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} isAdmin={isAdmin} />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-light text-text-soft mb-4">Privacy Policy</h1>
          <p className="text-text-muted mb-8">Effective Date: January 10, 2025 | Last Updated: January 10, 2025</p>

          <div className="prose prose-invert prose-headings:text-text-soft prose-p:text-text-muted prose-a:text-firefly-glow hover:prose-a:text-firefly-bright prose-strong:text-text-soft prose-li:text-text-muted max-w-none">

            {/* Table of Contents */}
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium text-text-soft mt-0 mb-4">Table of Contents</h2>
              <ol className="space-y-2 text-sm">
                <li><a href="#introduction">1. Introduction</a></li>
                <li><a href="#information-we-collect">2. Information We Collect</a></li>
                <li><a href="#how-we-use-information">3. How We Use Your Information</a></li>
                <li><a href="#data-storage-security">4. Data Storage and Security</a></li>
                <li><a href="#third-party-services">5. Third-Party Services</a></li>
                <li><a href="#cookies-tracking">6. Cookies and Tracking Technologies</a></li>
                <li><a href="#your-rights">7. Your Privacy Rights</a></li>
                <li><a href="#data-retention">8. Data Retention and Deletion</a></li>
                <li><a href="#childrens-privacy">9. Children's Privacy</a></li>
                <li><a href="#international-transfers">10. International Data Transfers</a></li>
                <li><a href="#california-privacy">11. California Privacy Rights (CCPA)</a></li>
                <li><a href="#gdpr-rights">12. European Privacy Rights (GDPR)</a></li>
                <li><a href="#changes-to-policy">13. Changes to This Policy</a></li>
                <li><a href="#contact-us">14. Contact Us</a></li>
              </ol>
            </div>

            {/* 1. Introduction */}
            <section id="introduction">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Firefly Grove ("we," "our," or "us"). We are committed to protecting your privacy and handling your personal information with the utmost care and respect. This Privacy Policy explains how we collect, use, store, and protect your information when you use our memory preservation platform at fireflygrove.app (the "Service").
              </p>
              <p>
                <strong>Our Core Privacy Principles:</strong>
              </p>
              <ul>
                <li><strong>Your Memories Are Yours:</strong> You own all content you create. We never sell your personal data or memories to third parties.</li>
                <li><strong>Privacy by Design:</strong> Privacy controls are built into every feature, allowing you to decide who sees what.</li>
                <li><strong>Transparency:</strong> We clearly explain what data we collect and why.</li>
                <li><strong>Security First:</strong> We use industry-standard encryption and security measures to protect your information.</li>
                <li><strong>Your Control:</strong> You can access, download, or delete your data at any time.</li>
              </ul>
              <p>
                By using Firefly Grove, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our Service.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section id="information-we-collect">
              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide Directly</h3>
              <p><strong>Account Information:</strong></p>
              <ul>
                <li>Name and email address (required for account creation)</li>
                <li>Password (encrypted and never stored in plain text)</li>
                <li>Payment information (processed securely by Stripe, not stored on our servers)</li>
              </ul>

              <p><strong>Content You Create:</strong></p>
              <ul>
                <li>Memories (text, photos, audio recordings)</li>
                <li>Tree and branch names and descriptions</li>
                <li>Comments and annotations</li>
                <li>Dates, locations, and metadata you add to memories</li>
                <li>Files you upload (photos, audio, video)</li>
              </ul>

              <p><strong>Communication Data:</strong></p>
              <ul>
                <li>Messages you send through our feedback system</li>
                <li>Support requests and correspondence</li>
                <li>Email preferences and notification settings</li>
              </ul>

              <h3>2.2 Information We Collect Automatically</h3>
              <p><strong>Technical Information:</strong></p>
              <ul>
                <li>IP address and geographic location (approximate)</li>
                <li>Browser type and version</li>
                <li>Device type (desktop, mobile, tablet)</li>
                <li>Operating system</li>
                <li>Referring website or source</li>
                <li>Pages visited and features used</li>
                <li>Date and time of visits</li>
                <li>Session duration</li>
              </ul>

              <p><strong>Analytics Data:</strong></p>
              <ul>
                <li>Feature usage patterns (which features you use most)</li>
                <li>Performance metrics (page load times, errors)</li>
                <li>User journey data (how you navigate through the Service)</li>
                <li>Engagement metrics (time spent, actions taken)</li>
              </ul>

              <h3>2.3 Information from Third Parties</h3>
              <p><strong>Payment Processors:</strong></p>
              <ul>
                <li>Transaction confirmations from Stripe (payment success/failure)</li>
                <li>Subscription status updates</li>
                <li>Billing dispute information</li>
              </ul>

              <p><strong>Social Authentication (if you choose to use it):</strong></p>
              <ul>
                <li>Basic profile information (name, email) from Google, Facebook, or other authentication providers</li>
                <li>Profile picture (if you choose to import it)</li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section id="how-we-use-information">
              <h2>3. How We Use Your Information</h2>

              <h3>3.1 To Provide and Improve Our Service</h3>
              <ul>
                <li>Create and maintain your account</li>
                <li>Store and organize your memories securely</li>
                <li>Enable you to create trees, branches, and memories</li>
                <li>Process uploads (photos, audio, video)</li>
                <li>Generate AI-powered writing prompts (Spark Collections)</li>
                <li>Provide search and discovery features</li>
                <li>Enable collaboration and sharing with family members</li>
                <li>Facilitate legacy planning and tree transfers</li>
                <li>Improve our algorithms and user experience</li>
                <li>Fix bugs and optimize performance</li>
              </ul>

              <h3>3.2 To Process Payments and Subscriptions</h3>
              <ul>
                <li>Process subscription payments securely via Stripe</li>
                <li>Manage your subscription tier and tree limits</li>
                <li>Process purchases from Grove Exchange (greeting cards, etc.)</li>
                <li>Send receipts and billing notifications</li>
                <li>Handle refunds and billing disputes</li>
                <li>Detect and prevent fraud</li>
              </ul>

              <h3>3.3 To Communicate With You</h3>
              <ul>
                <li>Send account-related emails (welcome, password reset, security alerts)</li>
                <li>Notify you of subscription changes, renewals, or expirations</li>
                <li>Send tree transfer invitations you request</li>
                <li>Respond to your support requests and feedback</li>
                <li>Send optional product updates and feature announcements (you can opt out)</li>
                <li>Send marketing emails (only if you consent - you can unsubscribe anytime)</li>
              </ul>

              <h3>3.4 For Legal and Security Purposes</h3>
              <ul>
                <li>Comply with legal obligations and court orders</li>
                <li>Protect against fraud, abuse, and security threats</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect our rights, property, and safety</li>
                <li>Protect the rights and safety of our users</li>
                <li>Investigate and prevent illegal activities</li>
              </ul>

              <h3>3.5 With Your Consent</h3>
              <ul>
                <li>For any other purpose disclosed to you at the time of collection</li>
                <li>For research or analytics (always anonymized)</li>
                <li>For testimonials or case studies (with explicit permission)</li>
              </ul>

              <p className="bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
                <strong>We DO NOT:</strong>
                <br />• Sell your personal information to anyone, ever
                <br />• Share your memories with third parties for advertising
                <br />• Use your content to train AI models without consent
                <br />• Access your private memories without your permission or legal requirement
              </p>
            </section>

            {/* 4. Data Storage and Security */}
            <section id="data-storage-security">
              <h2>4. Data Storage and Security</h2>

              <h3>4.1 How We Protect Your Data</h3>
              <p><strong>Encryption:</strong></p>
              <ul>
                <li>All data transmitted to and from our servers uses TLS/SSL encryption (HTTPS)</li>
                <li>Passwords are hashed using bcrypt with industry-standard salt rounds</li>
                <li>Sensitive data is encrypted at rest in our database</li>
                <li>Payment information is encrypted and processed by Stripe (PCI-DSS compliant)</li>
              </ul>

              <p><strong>Infrastructure Security:</strong></p>
              <ul>
                <li>Hosted on Vercel's secure, SOC 2 Type II certified infrastructure</li>
                <li>Database hosted on Neon (PostgreSQL) with automatic backups</li>
                <li>File storage on Vercel Blob with access controls</li>
                <li>Regular security patches and updates</li>
                <li>Automated vulnerability scanning</li>
                <li>DDoS protection and rate limiting</li>
              </ul>

              <p><strong>Access Controls:</strong></p>
              <ul>
                <li>Multi-factor authentication for admin accounts</li>
                <li>Role-based access control (RBAC)</li>
                <li>Audit logs for all administrative actions</li>
                <li>Limited employee access to production systems</li>
                <li>Background checks for employees with data access</li>
              </ul>

              <h3>4.2 Data Backup and Recovery</h3>
              <ul>
                <li>Automated daily backups of all data</li>
                <li>30-day backup retention policy</li>
                <li>Disaster recovery plan with 24-hour recovery time objective (RTO)</li>
                <li>Geographic redundancy across multiple data centers</li>
              </ul>

              <h3>4.3 Your Responsibility</h3>
              <p>While we implement strong security measures, you also play a role in protecting your account:</p>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Log out of shared devices</li>
                <li>Report suspicious activity immediately</li>
                <li>Keep your email account secure (it's used for password reset)</li>
              </ul>

              <p className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
                <strong>Security Notice:</strong> No method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security. In the unlikely event of a data breach affecting your account, we will notify you within 72 hours via email and provide details about what information was compromised and what steps we're taking.
              </p>
            </section>

            {/* 5. Third-Party Services */}
            <section id="third-party-services">
              <h2>5. Third-Party Services</h2>

              <p>We use carefully selected third-party services to operate Firefly Grove. Each service has been vetted for security and privacy compliance.</p>

              <h3>5.1 Services We Use</h3>

              <p><strong>Stripe (Payment Processing)</strong></p>
              <ul>
                <li><strong>Purpose:</strong> Process subscription payments and product purchases</li>
                <li><strong>Data Shared:</strong> Name, email, payment card information</li>
                <li><strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
                <li><strong>Compliance:</strong> PCI-DSS Level 1, GDPR compliant</li>
              </ul>

              <p><strong>Resend (Email Delivery)</strong></p>
              <ul>
                <li><strong>Purpose:</strong> Send transactional emails (account notifications, password resets, tree transfer invitations)</li>
                <li><strong>Data Shared:</strong> Email address, name, email content</li>
                <li><strong>Privacy Policy:</strong> <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a></li>
                <li><strong>Compliance:</strong> GDPR compliant</li>
              </ul>

              <p><strong>Vercel (Hosting & File Storage)</strong></p>
              <ul>
                <li><strong>Purpose:</strong> Host our application and store uploaded files (photos, audio)</li>
                <li><strong>Data Shared:</strong> All application data, uploaded media files</li>
                <li><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
                <li><strong>Compliance:</strong> SOC 2 Type II, GDPR compliant, ISO 27001</li>
              </ul>

              <p><strong>Neon (Database)</strong></p>
              <ul>
                <li><strong>Purpose:</strong> Store user accounts, memories, and application data</li>
                <li><strong>Data Shared:</strong> All structured data (accounts, trees, branches, memories)</li>
                <li><strong>Privacy Policy:</strong> <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer">neon.tech/privacy-policy</a></li>
                <li><strong>Compliance:</strong> SOC 2 Type II, GDPR compliant</li>
              </ul>

              <p><strong>OpenAI (AI Features)</strong></p>
              <ul>
                <li><strong>Purpose:</strong> Generate writing prompts (Spark Collections) and content suggestions</li>
                <li><strong>Data Shared:</strong> Anonymized context for prompt generation (no personally identifiable information)</li>
                <li><strong>Privacy Policy:</strong> <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com/policies/privacy-policy</a></li>
                <li><strong>Data Use:</strong> We do NOT send your memories or personal content to OpenAI. Only generic prompts are generated.</li>
              </ul>

              <h3>5.2 Analytics (Privacy-Focused)</h3>
              <p>We collect analytics to improve the Service, but we prioritize your privacy:</p>
              <ul>
                <li>We use our own analytics system (not Google Analytics)</li>
                <li>We do NOT track you across websites</li>
                <li>We do NOT sell analytics data to third parties</li>
                <li>We anonymize IP addresses</li>
                <li>We aggregate data to prevent individual identification</li>
              </ul>

              <h3>5.3 Links to Third-Party Websites</h3>
              <p>
                Our Service may contain links to third-party websites (e.g., social media, external resources). We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            {/* 6. Cookies and Tracking */}
            <section id="cookies-tracking">
              <h2>6. Cookies and Tracking Technologies</h2>

              <h3>6.1 What Are Cookies?</h3>
              <p>
                Cookies are small text files stored on your device by your web browser. They help us remember you, keep you logged in, and understand how you use our Service.
              </p>

              <h3>6.2 Types of Cookies We Use</h3>

              <p><strong>Essential Cookies (Required)</strong></p>
              <ul>
                <li><strong>Session cookies:</strong> Keep you logged in during your session</li>
                <li><strong>Security cookies:</strong> Detect authentication abuse and protect your account</li>
                <li><strong>CSRF tokens:</strong> Prevent cross-site request forgery attacks</li>
              </ul>
              <p className="text-sm text-text-muted italic">These cookies are necessary for the Service to function. They cannot be disabled.</p>

              <p><strong>Functional Cookies (Optional)</strong></p>
              <ul>
                <li><strong>Preferences:</strong> Remember your settings (theme, language, etc.)</li>
                <li><strong>Recent activity:</strong> Remember recently viewed trees/branches</li>
              </ul>

              <p><strong>Analytics Cookies (Optional)</strong></p>
              <ul>
                <li><strong>Usage tracking:</strong> Understand which features are most popular</li>
                <li><strong>Performance monitoring:</strong> Identify slow pages and errors</li>
                <li><strong>A/B testing:</strong> Test new features with small groups</li>
              </ul>

              <h3>6.3 Managing Cookies</h3>
              <p>You can control cookies through:</p>
              <ul>
                <li><strong>Your browser settings:</strong> Most browsers allow you to refuse cookies or delete existing ones</li>
                <li><strong>Our cookie banner:</strong> Manage your preferences when you first visit</li>
                <li><strong>Your account settings:</strong> Disable optional analytics cookies</li>
              </ul>
              <p className="text-sm text-text-muted">
                Note: Disabling essential cookies will prevent you from using the Service. Disabling optional cookies may limit some features but won't prevent core functionality.
              </p>

              <h3>6.4 Do Not Track (DNT)</h3>
              <p>
                We respect the "Do Not Track" browser setting. When DNT is enabled, we:
              </p>
              <ul>
                <li>Disable all optional analytics cookies</li>
                <li>Do not track your browsing behavior</li>
                <li>Do not share usage data with third parties</li>
              </ul>
            </section>

            {/* 7. Your Rights */}
            <section id="your-rights">
              <h2>7. Your Privacy Rights</h2>

              <p>You have significant control over your personal information. Here are your rights:</p>

              <h3>7.1 Access Your Data</h3>
              <p>You have the right to:</p>
              <ul>
                <li>View all personal information we have about you</li>
                <li>Download a copy of your data (data portability)</li>
                <li>Request a comprehensive data report</li>
              </ul>
              <p><strong>How to exercise:</strong> Go to Settings → Privacy → "Download My Data"</p>

              <h3>7.2 Correct Your Data</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Update your name, email, and profile information</li>
                <li>Correct inaccurate information</li>
                <li>Edit or delete memories you've created</li>
              </ul>
              <p><strong>How to exercise:</strong> Edit directly in your account or contact us</p>

              <h3>7.3 Delete Your Data</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Delete your entire account</li>
                <li>Delete specific memories, trees, or branches</li>
                <li>Request permanent deletion (right to be forgotten)</li>
              </ul>
              <p><strong>How to exercise:</strong> Settings → Account → "Delete Account" or contact us</p>
              <p className="bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <strong>Important:</strong> Account deletion is permanent and irreversible. All your memories, photos, and data will be permanently deleted within 30 days. We will send a confirmation email before deletion. If you have active subscriptions, they will be canceled (no refund for unused time).
              </p>

              <h3>7.4 Restrict Processing</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Pause analytics tracking</li>
                <li>Disable AI-generated prompts</li>
                <li>Opt out of optional features</li>
                <li>Temporarily freeze your account</li>
              </ul>

              <h3>7.5 Object to Processing</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Opt out of marketing emails (unsubscribe link in every email)</li>
                <li>Opt out of analytics and tracking</li>
                <li>Object to automated decision-making</li>
              </ul>

              <h3>7.6 Data Portability</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Export all your data in machine-readable formats (JSON, CSV)</li>
                <li>Export all media files (photos, audio) in original quality</li>
                <li>Transfer your data to another service</li>
              </ul>
              <p><strong>How to exercise:</strong> Settings → Export → "Download Full Backup"</p>

              <h3>7.7 Withdraw Consent</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Withdraw consent for optional features at any time</li>
                <li>Change privacy settings for memories (Private → Legacy, etc.)</li>
                <li>Revoke access for shared trees/branches</li>
              </ul>
            </section>

            {/* 8. Data Retention */}
            <section id="data-retention">
              <h2>8. Data Retention and Deletion</h2>

              <h3>8.1 How Long We Keep Your Data</h3>

              <p><strong>Active Accounts:</strong></p>
              <ul>
                <li>We retain your data as long as your account is active</li>
                <li>No automatic deletion for inactive accounts</li>
                <li>Your memories are preserved indefinitely (that's our purpose!)</li>
              </ul>

              <p><strong>Deleted Accounts:</strong></p>
              <ul>
                <li><strong>30-day grace period:</strong> Account marked for deletion but recoverable</li>
                <li><strong>After 30 days:</strong> Permanent deletion from all systems and backups</li>
                <li><strong>Exceptions:</strong> We may retain limited data for legal compliance (tax records, fraud prevention)</li>
              </ul>

              <p><strong>Subscription Data:</strong></p>
              <ul>
                <li>Payment records: 7 years (tax and legal requirements)</li>
                <li>Billing history: Duration of subscription + 7 years</li>
                <li>Canceled subscriptions: Immediate anonymization, 7-year retention for financial records</li>
              </ul>

              <p><strong>Support Communications:</strong></p>
              <ul>
                <li>Support tickets: 3 years after resolution</li>
                <li>Feedback submissions: Indefinitely (anonymized after 1 year)</li>
              </ul>

              <p><strong>Analytics Data:</strong></p>
              <ul>
                <li>Raw analytics: 90 days</li>
                <li>Aggregated analytics: Indefinitely (fully anonymized)</li>
              </ul>

              <h3>8.2 Deceased User Accounts</h3>
              <p>
                Firefly Grove is designed to preserve memories after death. If a user passes away:
              </p>
              <ul>
                <li>Accounts are NOT automatically deleted</li>
                <li>Legacy trees can be transferred to designated heirs (if configured)</li>
                <li>Family members can request access with proper documentation (death certificate)</li>
                <li>Trustees can manage accounts as designated by the user</li>
              </ul>
              <p>For more details, see our Legacy Planning documentation.</p>
            </section>

            {/* 9. Children's Privacy */}
            <section id="childrens-privacy">
              <h2>9. Children's Privacy (COPPA Compliance)</h2>

              <p>
                Firefly Grove is intended for users age 13 and older. We do not knowingly collect personal information from children under 13 without parental consent.
              </p>

              <h3>9.1 Age Verification</h3>
              <ul>
                <li>Users must confirm they are 13+ during signup</li>
                <li>We do not intentionally market to children under 13</li>
                <li>Parental consent required for users under 13</li>
              </ul>

              <h3>9.2 Children's Content</h3>
              <p>Parents and guardians may create content about children, including:</p>
              <ul>
                <li>Memories of childhood events</li>
                <li>Photos and videos of minors</li>
                <li>Family history including children</li>
              </ul>
              <p><strong>Parent Responsibility:</strong> Parents are responsible for decisions about what content to create about their children. We recommend using privacy settings appropriately.</p>

              <h3>9.3 If We Discover Underage Users</h3>
              <p>If we discover a user under 13 created an account without parental consent:</p>
              <ul>
                <li>We will immediately suspend the account</li>
                <li>We will delete all personal information within 30 days</li>
                <li>We will notify the email address on file</li>
                <li>Parents can contact us to verify age and restore access with consent</li>
              </ul>

              <p className="bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
                <strong>Parents:</strong> If you believe your child under 13 has created an account without your permission, please contact us immediately at mrpoffice@gmail.com and we will delete the account.
              </p>
            </section>

            {/* 10. International Data Transfers */}
            <section id="international-transfers">
              <h2>10. International Data Transfers</h2>

              <h3>10.1 Where Your Data Is Stored</h3>
              <p>
                Firefly Grove operates globally, and your data may be transferred to and stored in countries outside your country of residence, including the United States.
              </p>

              <p><strong>Data Locations:</strong></p>
              <ul>
                <li><strong>Primary servers:</strong> United States (Vercel, AWS)</li>
                <li><strong>Database:</strong> United States or EU (Neon, with geographic options)</li>
                <li><strong>File storage:</strong> Global CDN (Vercel Blob) with regional caching</li>
                <li><strong>Backups:</strong> Multiple geographic regions for redundancy</li>
              </ul>

              <h3>10.2 EU-US Data Transfers (GDPR Compliance)</h3>
              <p>For users in the European Economic Area (EEA), UK, or Switzerland:</p>
              <ul>
                <li>We rely on <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
                <li>Our hosting providers (Vercel, AWS, Neon) are certified under <strong>EU-US Data Privacy Framework</strong></li>
                <li>We implement <strong>additional safeguards</strong> including encryption and access controls</li>
                <li>You have the right to object to international transfers</li>
              </ul>

              <h3>10.3 Data Localization Requests</h3>
              <p>
                If you require data to be stored in a specific region for legal or compliance reasons, please contact us. We may be able to accommodate regional storage for Enterprise customers.
              </p>
            </section>

            {/* 11. California Privacy Rights (CCPA) */}
            <section id="california-privacy">
              <h2>11. California Privacy Rights (CCPA)</h2>

              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
              </p>

              <h3>11.1 Right to Know</h3>
              <p>You have the right to request:</p>
              <ul>
                <li>Categories of personal information we collect</li>
                <li>Specific pieces of personal information we have about you</li>
                <li>Categories of sources from which we collect information</li>
                <li>Business or commercial purposes for collecting information</li>
                <li>Categories of third parties with whom we share information</li>
              </ul>

              <h3>11.2 Right to Delete</h3>
              <p>You have the right to request deletion of personal information we collected from you, subject to certain exceptions.</p>

              <h3>11.3 Right to Opt-Out of Sale</h3>
              <p className="bg-green-900/20 border-l-4 border-green-500 p-4 my-4">
                <strong>We DO NOT sell your personal information.</strong> We have not sold personal information in the past 12 months and do not intend to sell it in the future.
              </p>

              <h3>11.4 Right to Non-Discrimination</h3>
              <p>We will not discriminate against you for exercising your CCPA rights, including by:</p>
              <ul>
                <li>Denying goods or services</li>
                <li>Charging different prices or rates</li>
                <li>Providing different quality of service</li>
                <li>Suggesting you will receive different pricing or quality</li>
              </ul>

              <h3>11.5 How to Exercise Your Rights</h3>
              <p>California residents can exercise these rights by:</p>
              <ul>
                <li><strong>Email:</strong> mrpoffice@gmail.com with subject "CCPA Request"</li>
                <li><strong>In-app:</strong> Settings → Privacy → "California Privacy Rights"</li>
                <li><strong>Phone:</strong> (Available upon request)</li>
              </ul>
              <p>We will respond to verified requests within 45 days.</p>

              <h3>11.6 Authorized Agents</h3>
              <p>
                You may designate an authorized agent to make requests on your behalf. The agent must provide proof of authorization.
              </p>

              <h3>11.7 California "Shine the Light" Law</h3>
              <p>
                Under California Civil Code Section 1798.83, California residents can request information about disclosure of personal information to third parties for direct marketing purposes. As stated above, we do not share personal information with third parties for their direct marketing purposes.
              </p>
            </section>

            {/* 12. GDPR Rights */}
            <section id="gdpr-rights">
              <h2>12. European Privacy Rights (GDPR)</h2>

              <p>
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR).
              </p>

              <h3>12.1 Legal Basis for Processing</h3>
              <p>We process your personal data under the following legal bases:</p>

              <p><strong>Contract Performance:</strong></p>
              <ul>
                <li>To provide the Service you signed up for</li>
                <li>To process payments and manage subscriptions</li>
                <li>To deliver features you've requested</li>
              </ul>

              <p><strong>Legitimate Interest:</strong></p>
              <ul>
                <li>To improve and optimize the Service</li>
                <li>To detect and prevent fraud</li>
                <li>To ensure security of our systems</li>
                <li>To analyze usage patterns (anonymized)</li>
              </ul>

              <p><strong>Consent:</strong></p>
              <ul>
                <li>For marketing emails (you can withdraw consent anytime)</li>
                <li>For optional analytics cookies</li>
                <li>For sharing content publicly</li>
              </ul>

              <p><strong>Legal Obligation:</strong></p>
              <ul>
                <li>To comply with tax and accounting laws</li>
                <li>To respond to law enforcement requests</li>
                <li>To enforce our Terms of Service</li>
              </ul>

              <h3>12.2 Your GDPR Rights</h3>

              <p><strong>Right of Access (Article 15):</strong></p>
              <p>You can request a copy of all personal data we hold about you.</p>

              <p><strong>Right to Rectification (Article 16):</strong></p>
              <p>You can correct inaccurate or incomplete data.</p>

              <p><strong>Right to Erasure / "Right to be Forgotten" (Article 17):</strong></p>
              <p>You can request deletion of your data in certain circumstances.</p>

              <p><strong>Right to Restriction of Processing (Article 18):</strong></p>
              <p>You can request we stop processing your data temporarily.</p>

              <p><strong>Right to Data Portability (Article 20):</strong></p>
              <p>You can receive your data in a structured, machine-readable format.</p>

              <p><strong>Right to Object (Article 21):</strong></p>
              <p>You can object to processing based on legitimate interest or for direct marketing.</p>

              <p><strong>Right to Not Be Subject to Automated Decision-Making (Article 22):</strong></p>
              <p>You can opt out of automated decisions that significantly affect you.</p>

              <h3>12.3 Data Protection Officer (DPO)</h3>
              <p>
                While we are not currently required to appoint a DPO, you can contact our privacy team with any concerns:
              </p>
              <ul>
                <li><strong>Email:</strong> mrpoffice@gmail.com</li>
                <li><strong>Subject:</strong> "GDPR Privacy Request"</li>
              </ul>

              <h3>12.4 Right to Lodge a Complaint</h3>
              <p>
                If you believe we have violated your privacy rights, you have the right to lodge a complaint with your local supervisory authority:
              </p>
              <ul>
                <li><strong>EU:</strong> Contact your national Data Protection Authority (DPA)</li>
                <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
              </ul>

              <h3>12.5 Response Time</h3>
              <p>
                We will respond to all GDPR requests within <strong>one month</strong> (30 days) of receiving your request. In complex cases, we may extend this by two additional months, but we will inform you of the extension and the reasons.
              </p>
            </section>

            {/* 13. Changes to This Policy */}
            <section id="changes-to-policy">
              <h2>13. Changes to This Privacy Policy</h2>

              <h3>13.1 How We Update This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
              </p>

              <h3>13.2 Notice of Material Changes</h3>
              <p>
                If we make material changes that affect how we use your personal information, we will notify you by:
              </p>
              <ul>
                <li><strong>Email notification</strong> to your registered email address</li>
                <li><strong>In-app banner</strong> when you log in</li>
                <li><strong>Updating the "Last Updated" date</strong> at the top of this policy</li>
              </ul>

              <h3>13.3 Your Options After Changes</h3>
              <p>
                After we notify you of changes:
              </p>
              <ul>
                <li>You have <strong>30 days to review the changes</strong></li>
                <li>Continued use of the Service constitutes acceptance of the new policy</li>
                <li>If you disagree with the changes, you can <strong>delete your account</strong> before they take effect</li>
                <li>For material changes, we may require explicit consent before applying them to existing data</li>
              </ul>

              <h3>13.4 Version History</h3>
              <p>
                You can request previous versions of this Privacy Policy by contacting us at mrpoffice@gmail.com.
              </p>
            </section>

            {/* 14. Contact Us */}
            <section id="contact-us">
              <h2>14. Contact Us</h2>

              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 my-6">
                <p className="mb-4"><strong>Firefly Grove</strong></p>

                <p className="mb-2"><strong>Email:</strong></p>
                <p className="mb-4">
                  <a href="mailto:mrpoffice@gmail.com" className="text-firefly-glow hover:text-firefly-bright">
                    mrpoffice@gmail.com
                  </a>
                </p>

                <p className="mb-2"><strong>Privacy Requests:</strong></p>
                <p className="mb-4">
                  For GDPR, CCPA, or other privacy requests, please use subject line: "Privacy Request"
                </p>

                <p className="mb-2"><strong>Website:</strong></p>
                <p className="mb-4">
                  <a href="https://fireflygrove.app" target="_blank" rel="noopener noreferrer" className="text-firefly-glow hover:text-firefly-bright">
                    fireflygrove.app
                  </a>
                </p>

                <p className="mb-2"><strong>Response Time:</strong></p>
                <p>We aim to respond to all inquiries within 2 business days, and privacy requests within 30 days.</p>
              </div>

              <h3>14.1 Emergency Requests</h3>
              <p>
                For urgent security or privacy concerns (e.g., unauthorized access to your account), please mark your email as "URGENT" and we will respond within 24 hours.
              </p>
            </section>

            {/* Footer Notice */}
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-6 mt-12">
              <h3 className="text-lg font-medium text-text-soft mt-0 mb-3">Your Privacy Matters</h3>
              <p className="mb-3">
                At Firefly Grove, we believe privacy is a fundamental right. Your memories are deeply personal, and we treat them with the respect and protection they deserve.
              </p>
              <p className="mb-3">
                We're committed to transparency in our data practices. This policy is written in plain language to ensure you understand exactly how your information is used.
              </p>
              <p className="mb-0">
                <strong>Questions or concerns?</strong> We're here to help. Contact us anytime at{' '}
                <a href="mailto:mrpoffice@gmail.com" className="text-firefly-glow hover:text-firefly-bright">
                  mrpoffice@gmail.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
