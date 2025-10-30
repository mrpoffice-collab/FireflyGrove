'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-light text-text-soft mb-4">Terms of Service</h1>
          <p className="text-text-muted mb-8">Effective Date: January 10, 2025 | Last Updated: January 10, 2025</p>

          <div className="prose prose-invert prose-headings:text-text-soft prose-p:text-text-muted prose-a:text-firefly-glow hover:prose-a:text-firefly-bright prose-strong:text-text-soft prose-li:text-text-muted max-w-none">

            {/* Table of Contents */}
            <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium text-text-soft mt-0 mb-4">Table of Contents</h2>
              <ol className="space-y-2 text-sm">
                <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                <li><a href="#service-description">2. Description of Service</a></li>
                <li><a href="#eligibility">3. Eligibility and Account Registration</a></li>
                <li><a href="#user-content">4. User Content and Ownership</a></li>
                <li><a href="#license-grant">5. License Grants</a></li>
                <li><a href="#prohibited-conduct">6. Prohibited Conduct</a></li>
                <li><a href="#intellectual-property">7. Intellectual Property Rights</a></li>
                <li><a href="#subscriptions-payments">8. Subscriptions and Payments</a></li>
                <li><a href="#cancellation-refunds">9. Cancellation and Refunds</a></li>
                <li><a href="#legacy-provisions">10. Legacy Planning and Deceased Users</a></li>
                <li><a href="#service-modifications">11. Service Modifications and Availability</a></li>
                <li><a href="#termination">12. Termination</a></li>
                <li><a href="#disclaimers">13. Disclaimers and Warranties</a></li>
                <li><a href="#limitation-liability">14. Limitation of Liability</a></li>
                <li><a href="#indemnification">15. Indemnification</a></li>
                <li><a href="#dmca">16. DMCA and Copyright Policy</a></li>
                <li><a href="#third-party">17. Third-Party Services and Links</a></li>
                <li><a href="#dispute-resolution">18. Dispute Resolution and Arbitration</a></li>
                <li><a href="#governing-law">19. Governing Law and Jurisdiction</a></li>
                <li><a href="#miscellaneous">20. Miscellaneous Provisions</a></li>
                <li><a href="#contact">21. Contact Information</a></li>
              </ol>
            </div>

            {/* 1. Acceptance of Terms */}
            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>

              <h3>1.1 Binding Agreement</h3>
              <p>
                These Terms of Service ("Terms," "Agreement") constitute a legally binding agreement between you ("User," "you," or "your") and Firefly Grove ("Company," "we," "us," or "our") governing your access to and use of the Firefly Grove platform, website, and services (collectively, the "Service") available at fireflygrove.app and all associated domains.
              </p>

              <h3>1.2 Acceptance by Use</h3>
              <p>
                BY ACCESSING, BROWSING, OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND OUR{' '}
                <Link href="/privacy">Privacy Policy</Link>, WHICH IS INCORPORATED HEREIN BY REFERENCE.
              </p>
              <p>
                If you do not agree to these Terms, you must immediately cease all use of the Service and may not create an account.
              </p>

              <h3>1.3 Amendments</h3>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be notified via:
              </p>
              <ul>
                <li>Email notification to your registered email address</li>
                <li>In-app notification upon login</li>
                <li>Update to the "Last Updated" date at the top of this page</li>
              </ul>
              <p>
                Your continued use of the Service after notification of changes constitutes acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and may delete your account.
              </p>

              <h3>1.4 Additional Terms</h3>
              <p>
                Certain features of the Service may be subject to additional terms and conditions, which will be presented to you at the time you access those features. Such additional terms are incorporated into these Terms by reference.
              </p>
            </section>

            {/* 2. Service Description */}
            <section id="service-description">
              <h2>2. Description of Service</h2>

              <h3>2.1 Core Service</h3>
              <p>
                Firefly Grove is a digital memory preservation platform that enables users to:
              </p>
              <ul>
                <li>Create and organize digital memory collections ("Groves," "Trees," and "Branches")</li>
                <li>Store memories including text, photographs, audio recordings, and video</li>
                <li>Manage privacy settings for content</li>
                <li>Collaborate with family members and designated users</li>
                <li>Plan for digital legacy and heir management</li>
                <li>Create memorial pages for deceased loved ones</li>
                <li>Access AI-powered writing prompts and organizational tools</li>
                <li>Purchase related products and services through Grove Exchange</li>
              </ul>

              <h3>2.2 Service Features</h3>
              <p><strong>Groves and Trees:</strong> Organizational structures for categorizing and storing memories.</p>
              <p><strong>Branches:</strong> Individual memory collections typically associated with specific people or themes.</p>
              <p><strong>Nest:</strong> Photo staging area with AI-generated writing prompts.</p>
              <p><strong>Spark Collections:</strong> AI-powered writing prompts to help capture memories.</p>
              <p><strong>Open Grove:</strong> Public memorial space for legacy trees accessible to the community.</p>
              <p><strong>Tree Transfers:</strong> Ability to transfer ownership of memory trees to other users.</p>
              <p><strong>Grove Exchange:</strong> Marketplace for related products (greeting cards, memorial videos, sound wave art, etc.).</p>

              <h3>2.3 Service Tiers</h3>
              <p>The Service is offered in multiple subscription tiers with varying features and storage limits:</p>
              <ul>
                <li><strong>Trial Grove:</strong> Limited capacity for evaluation purposes</li>
                <li><strong>Single Tree:</strong> Individual tree subscription ($4.99/year)</li>
                <li><strong>Family Grove:</strong> Up to 10 trees ($9.99/year)</li>
                <li><strong>Ancestry Grove:</strong> Up to 50 trees ($19.99/year)</li>
                <li><strong>Community Grove:</strong> Unlimited trees ($99/year)</li>
              </ul>
              <p className="text-sm text-text-muted">Pricing subject to change with 30-day notice to existing subscribers.</p>

              <h3>2.4 Beta Features</h3>
              <p>
                We may offer beta, experimental, or early-access features marked as such. These features are provided "AS IS" without warranty and may be modified or discontinued at any time without notice.
              </p>
            </section>

            {/* 3. Eligibility */}
            <section id="eligibility">
              <h2>3. Eligibility and Account Registration</h2>

              <h3>3.1 Age Requirements</h3>
              <p>
                You must be at least 13 years of age to use the Service. Users between 13 and 18 years of age must have parental or guardian consent. By creating an account, you represent and warrant that:
              </p>
              <ul>
                <li>You are at least 13 years old</li>
                <li>You have parental consent if under 18</li>
                <li>All registration information you provide is accurate and current</li>
                <li>You will maintain the accuracy of such information</li>
              </ul>

              <h3>3.2 Account Creation</h3>
              <p>
                To access certain features, you must create an account by providing:
              </p>
              <ul>
                <li>A valid email address</li>
                <li>Your name</li>
                <li>A secure password</li>
              </ul>
              <p>
                You agree to provide truthful, accurate, and complete information during registration and to update such information to maintain its accuracy.
              </p>

              <h3>3.3 Account Security</h3>
              <p>You are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your password and account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use or security breach</li>
                <li>Logging out at the end of each session on shared devices</li>
              </ul>
              <p>
                We are not liable for any loss or damage arising from your failure to comply with these security obligations.
              </p>

              <h3>3.4 One Account Per Person</h3>
              <p>
                Each user may maintain only one active account. You may not create multiple accounts for yourself or allow others to use your account. Violators may have all associated accounts terminated.
              </p>

              <h3>3.5 Account Transfer</h3>
              <p>
                You may not transfer, sell, or assign your account to any other person or entity without our prior written consent. Any purported transfer without consent is void.
              </p>
            </section>

            {/* 4. User Content */}
            <section id="user-content">
              <h2>4. User Content and Ownership</h2>

              <h3>4.1 Your Ownership</h3>
              <p className="bg-green-900/20 border-l-4 border-green-500 p-4">
                <strong>You retain all ownership rights to content you create, upload, or submit to the Service ("User Content").</strong> This includes but is not limited to:
              </p>
              <ul>
                <li>Written memories, stories, and text</li>
                <li>Photographs and images</li>
                <li>Audio recordings</li>
                <li>Video content</li>
                <li>Metadata, dates, and annotations</li>
              </ul>

              <h3>4.2 Your Responsibilities</h3>
              <p>You represent and warrant that:</p>
              <ul>
                <li>You own or have the necessary rights to all User Content you submit</li>
                <li>Your User Content does not violate any third-party rights (copyright, trademark, privacy, publicity, etc.)</li>
                <li>Your User Content does not violate any applicable law or regulation</li>
                <li>You have obtained all necessary permissions, releases, and consents for content featuring other people</li>
              </ul>

              <h3>4.3 Content Standards</h3>
              <p>All User Content must comply with these standards. User Content must NOT contain:</p>
              <ul>
                <li>Illegal content or content promoting illegal activities</li>
                <li>Threats, harassment, or hate speech</li>
                <li>Pornographic, obscene, or sexually explicit material</li>
                <li>Content that violates others' intellectual property rights</li>
                <li>Malware, viruses, or malicious code</li>
                <li>Spam, advertising, or commercial solicitations (except in designated areas)</li>
                <li>Private information of others without consent (doxxing)</li>
                <li>False, misleading, or deceptive content</li>
                <li>Content that impersonates others</li>
              </ul>

              <h3>4.4 Content Review</h3>
              <p>
                We reserve the right, but have no obligation, to monitor, review, or remove User Content that violates these Terms or is otherwise objectionable. However, we do not pre-screen content and are not responsible for User Content posted by others.
              </p>

              <h3>4.5 Backup Responsibility</h3>
              <p className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <strong>Important:</strong> While we maintain regular backups, YOU are solely responsible for maintaining your own backup copies of User Content. We strongly recommend using the "Forever Kit" export feature regularly to download local copies of all your memories.
              </p>
            </section>

            {/* 5. License Grants */}
            <section id="license-grant">
              <h2>5. License Grants</h2>

              <h3>5.1 License You Grant to Us</h3>
              <p>
                By submitting User Content to the Service, you grant Firefly Grove a limited, non-exclusive, worldwide, royalty-free, sublicensable license to:
              </p>
              <ul>
                <li><strong>Store and host</strong> your User Content on our servers</li>
                <li><strong>Display</strong> your User Content to you and users you designate (based on your privacy settings)</li>
                <li><strong>Transmit</strong> your User Content across networks and devices as necessary to provide the Service</li>
                <li><strong>Make copies</strong> for backup, caching, and technical purposes</li>
                <li><strong>Modify</strong> User Content only for technical formatting (resize images, convert file formats, etc.)</li>
              </ul>

              <h3>5.2 Limitations on Our License</h3>
              <p className="bg-blue-900/20 border-l-4 border-blue-500 p-4">
                <strong>We will NOT:</strong>
                <br />• Use your private memories for marketing or advertising
                <br />• Share your content with third parties for their commercial purposes
                <br />• Claim ownership of your User Content
                <br />• Use your content to train AI models without explicit consent
              </p>

              <h3>5.3 Public Content License</h3>
              <p>
                For User Content you designate as "Public" or post to Open Grove (public memorials), you additionally grant us and other users a license to:
              </p>
              <ul>
                <li>View and access the public content</li>
                <li>Share links to public content</li>
                <li>Embed public content (where technically enabled)</li>
              </ul>

              <h3>5.4 Testimonials and Marketing</h3>
              <p>
                If you provide testimonials, reviews, or feedback about the Service, you grant us the right to use such content (including your name) in our marketing materials. You may request removal at any time by contacting us.
              </p>

              <h3>5.5 License Duration</h3>
              <p>
                The licenses granted in this Section continue for the duration of copyright protection unless you delete the User Content or terminate your account, at which point the licenses terminate within 30 days (except for content you made public, which may remain cached).
              </p>
            </section>

            {/* 6. Prohibited Conduct */}
            <section id="prohibited-conduct">
              <h2>6. Prohibited Conduct</h2>

              <h3>6.1 Prohibited Activities</h3>
              <p>You agree NOT to:</p>

              <p><strong>Technical Violations:</strong></p>
              <ul>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Circumvent or disable security features</li>
                <li>Use automated systems (bots, scrapers, spiders) without permission</li>
                <li>Overload or interfere with servers or networks</li>
                <li>Introduce viruses, malware, or harmful code</li>
                <li>Access non-public areas of the Service</li>
                <li>Probe, scan, or test vulnerabilities</li>
              </ul>

              <p><strong>Misuse of Service:</strong></p>
              <ul>
                <li>Impersonate others or misrepresent affiliation</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Stalk or collect information about other users</li>
                <li>Sell, rent, or commercialize the Service without authorization</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>

              <p><strong>Content Violations:</strong></p>
              <ul>
                <li>Upload content you don't have rights to</li>
                <li>Infringe intellectual property rights</li>
                <li>Post misleading or fraudulent content</li>
                <li>Share private information of others (doxxing)</li>
                <li>Post spam or unsolicited commercial content</li>
              </ul>

              <p><strong>Account Violations:</strong></p>
              <ul>
                <li>Create multiple accounts for abusive purposes</li>
                <li>Share your account credentials</li>
                <li>Transfer your account without permission</li>
                <li>Circumvent subscription limits or billing</li>
              </ul>

              <h3>6.2 Consequences of Violations</h3>
              <p>
                Violation of these prohibitions may result in:
              </p>
              <ul>
                <li>Warning or notice</li>
                <li>Temporary suspension of account</li>
                <li>Permanent termination of account</li>
                <li>Legal action and liability for damages</li>
                <li>Reporting to law enforcement authorities</li>
              </ul>
            </section>

            {/* 7. Intellectual Property */}
            <section id="intellectual-property">
              <h2>7. Intellectual Property Rights</h2>

              <h3>7.1 Our Ownership</h3>
              <p>
                The Service, including its software, design, text, graphics, logos, icons, images, audio clips, data compilations, and overall "look and feel" (excluding User Content) is owned by Firefly Grove and is protected by:
              </p>
              <ul>
                <li>United States and international copyright laws</li>
                <li>Trademark laws</li>
                <li>Trade dress protections</li>
                <li>Other intellectual property rights</li>
              </ul>

              <h3>7.2 Trademarks</h3>
              <p>
                "Firefly Grove," our logo, and other marks used in connection with the Service are trademarks of Firefly Grove. You may not use our trademarks without prior written permission.
              </p>

              <h3>7.3 License to Use Service</h3>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to:
              </p>
              <ul>
                <li>Access and use the Service for personal, non-commercial purposes</li>
                <li>Download and use our mobile applications (if available) on devices you own or control</li>
              </ul>

              <h3>7.4 Restrictions on Use</h3>
              <p>You may NOT:</p>
              <ul>
                <li>Modify, copy, or create derivative works of the Service</li>
                <li>Redistribute, sublicense, or sell access to the Service</li>
                <li>Frame or mirror any part of the Service</li>
                <li>Remove or alter any proprietary notices</li>
                <li>Use the Service to build a competing product or service</li>
              </ul>

              <h3>7.5 Feedback</h3>
              <p>
                If you provide suggestions, ideas, or feedback about the Service ("Feedback"), you grant us the right to use such Feedback without restriction or compensation. We own all rights to improvements or modifications made based on your Feedback.
              </p>
            </section>

            {/* 8. Subscriptions */}
            <section id="subscriptions-payments">
              <h2>8. Subscriptions and Payments</h2>

              <h3>8.1 Subscription Plans</h3>
              <p>
                Certain features of the Service require a paid subscription. Subscription plans include:
              </p>
              <ul>
                <li><strong>Single Tree:</strong> $4.99 per year (1 tree)</li>
                <li><strong>Family Grove:</strong> $9.99 per year (10 trees)</li>
                <li><strong>Ancestry Grove:</strong> $19.99 per year (50 trees)</li>
                <li><strong>Community Grove:</strong> $99 per year (unlimited trees)</li>
              </ul>

              <h3>8.2 Billing</h3>
              <p><strong>Payment Processing:</strong></p>
              <ul>
                <li>All payments are processed securely through Stripe</li>
                <li>We do not store your full credit card information</li>
                <li>You authorize Stripe to charge your payment method</li>
              </ul>

              <p><strong>Automatic Renewal:</strong></p>
              <ul>
                <li>Subscriptions automatically renew at the end of each billing period</li>
                <li>Your payment method will be charged automatically unless you cancel</li>
                <li>We will notify you before renewal with an opportunity to cancel</li>
                <li>Renewal rates may change with 30-day advance notice</li>
              </ul>

              <h3>8.3 Price Changes</h3>
              <p>
                We reserve the right to change subscription prices at any time. Price changes will:
              </p>
              <ul>
                <li>Be notified to you at least 30 days in advance</li>
                <li>NOT affect your current subscription until renewal</li>
                <li>Give you the right to cancel before the price change takes effect</li>
              </ul>

              <h3>8.4 Taxes</h3>
              <p>
                Prices are exclusive of all taxes, levies, or duties. You are responsible for payment of all such taxes, except for taxes based on our net income.
              </p>

              <h3>8.5 Payment Failures</h3>
              <p>
                If payment fails:
              </p>
              <ul>
                <li>We will attempt to charge your payment method up to 3 times</li>
                <li>You will be notified via email</li>
                <li>Your account may be downgraded or suspended after 14 days</li>
                <li>Access may be restricted until payment is received</li>
              </ul>

              <h3>8.6 Free Trials</h3>
              <p>
                We may offer free trials for new users. By starting a free trial:
              </p>
              <ul>
                <li>You must provide valid payment information</li>
                <li>You will be automatically charged when the trial ends unless you cancel</li>
                <li>Trial duration and terms will be clearly stated</li>
                <li>We reserve the right to determine trial eligibility</li>
                <li>One trial per user (multiple account trials prohibited)</li>
              </ul>
            </section>

            {/* 9. Cancellation */}
            <section id="cancellation-refunds">
              <h2>9. Cancellation and Refunds</h2>

              <h3>9.1 Your Right to Cancel</h3>
              <p>
                You may cancel your subscription at any time through:
              </p>
              <ul>
                <li>Account Settings → Manage Plan → Cancel Subscription</li>
                <li>Stripe Customer Portal (link in billing emails)</li>
                <li>Contacting our support team</li>
              </ul>

              <h3>9.2 Effect of Cancellation</h3>
              <ul>
                <li>Cancellation is effective at the end of your current billing period</li>
                <li>You retain access until the end of your paid period</li>
                <li>No partial refunds for unused time in the billing period</li>
                <li>Your account will be downgraded to Trial Grove after cancellation</li>
                <li>Trees exceeding trial limits will become inaccessible (but not deleted)</li>
              </ul>

              <h3>9.3 Refund Policy</h3>
              <p><strong>30-Day Money-Back Guarantee:</strong></p>
              <ul>
                <li>First-time subscribers can request a full refund within 30 days</li>
                <li>Contact support with your request</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>One refund per user (applies to first subscription only)</li>
              </ul>

              <p><strong>No Refunds After 30 Days:</strong></p>
              <ul>
                <li>After 30 days, subscriptions are non-refundable</li>
                <li>You may cancel to prevent future charges</li>
                <li>No prorated refunds for cancellations mid-period</li>
              </ul>

              <p><strong>Exceptions:</strong></p>
              <ul>
                <li>Service outages exceeding 72 continuous hours: Prorated credit</li>
                <li>Billing errors: Full correction and refund</li>
                <li>Unauthorized charges: Full investigation and refund if confirmed</li>
              </ul>

              <h3>9.4 Account Deletion After Cancellation</h3>
              <p>
                Canceling your subscription does NOT delete your account. To permanently delete your account and all data:
              </p>
              <ul>
                <li>Go to Settings → Account → Delete Account</li>
                <li>This action is irreversible</li>
                <li>All data will be permanently deleted within 30 days</li>
                <li>See our Privacy Policy for details</li>
              </ul>
            </section>

            {/* 10. Legacy Provisions */}
            <section id="legacy-provisions">
              <h2>10. Legacy Planning and Deceased Users</h2>

              <h3>10.1 Purpose</h3>
              <p>
                Firefly Grove is designed to preserve memories beyond a lifetime. We offer special provisions for users planning their digital legacy and for accounts of deceased users.
              </p>

              <h3>10.2 Tree Transfer Feature</h3>
              <p>
                Active users may transfer ownership of trees to other users (living or deceased):
              </p>
              <ul>
                <li>Transfers require recipient email address</li>
                <li>Recipient must accept the transfer</li>
                <li>Transfers are final once accepted</li>
                <li>Sender relinquishes all rights to the transferred tree</li>
              </ul>

              <h3>10.3 Legacy Trees (Memorials)</h3>
              <p>
                Users may create memorial trees for deceased loved ones:
              </p>
              <ul>
                <li>Memorial trees can be designated for Open Grove (public access)</li>
                <li>Memory limits apply to trees in Open Grove (100 memories)</li>
                <li>Trees can be "adopted" into private groves for unlimited memories</li>
                <li>Public memorials remain accessible to the community</li>
              </ul>

              <h3>10.4 Deceased User Accounts</h3>
              <p>
                When a user passes away, we offer several options:
              </p>

              <p><strong>Option 1: Trustee Access (If Configured)</strong></p>
              <ul>
                <li>User may designate a trustee before death</li>
                <li>Trustee gains access according to user's instructions</li>
                <li>Trustee can manage, preserve, or delete content as instructed</li>
                <li>Trustee designation expires after specified period</li>
              </ul>

              <p><strong>Option 2: Next of Kin Request</strong></p>
              <p>
                Family members may request access by providing:
              </p>
              <ul>
                <li>Death certificate</li>
                <li>Proof of relationship (birth certificate, marriage license, etc.)</li>
                <li>Government-issued ID</li>
                <li>Completed affidavit</li>
              </ul>
              <p>
                We will review requests on a case-by-case basis and may grant limited access or provide data export.
              </p>

              <p><strong>Option 3: Memorialize Account</strong></p>
              <ul>
                <li>Account can be "memorialized" (preserved but not accessible for login)</li>
                <li>Public content remains visible</li>
                <li>No new charges or renewals</li>
                <li>Content preserved indefinitely (with active subscription or special arrangement)</li>
              </ul>

              <h3>10.5 No Liability for Legacy Actions</h3>
              <p>
                We are not responsible for:
              </p>
              <ul>
                <li>Disputes between family members over access to deceased user accounts</li>
                <li>Content shared by trustees or heirs</li>
                <li>Inaccuracies in legacy planning instructions</li>
                <li>Failure to preserve content if subscriptions lapse without payment</li>
              </ul>
            </section>

            {/* 11. Service Modifications */}
            <section id="service-modifications">
              <h2>11. Service Modifications and Availability</h2>

              <h3>11.1 Right to Modify</h3>
              <p>
                We reserve the right to:
              </p>
              <ul>
                <li>Modify, suspend, or discontinue any part of the Service</li>
                <li>Add or remove features</li>
                <li>Change functionality or user interface</li>
                <li>Update software and systems</li>
              </ul>
              <p>
                We will provide reasonable notice of material changes affecting core functionality.
              </p>

              <h3>11.2 Service Availability</h3>
              <p>
                While we strive for 99.9% uptime, we do not guarantee uninterrupted or error-free service. The Service may be unavailable due to:
              </p>
              <ul>
                <li>Scheduled maintenance (with advance notice when possible)</li>
                <li>Emergency maintenance or repairs</li>
                <li>Force majeure events</li>
                <li>Third-party service failures</li>
                <li>DDoS attacks or security threats</li>
              </ul>

              <h3>11.3 Beta Features</h3>
              <p>
                Beta, experimental, or early-access features:
              </p>
              <ul>
                <li>Are provided "AS IS" without warranty</li>
                <li>May contain bugs or errors</li>
                <li>May be modified or removed without notice</li>
                <li>Are not guaranteed to become permanent features</li>
              </ul>

              <h3>11.4 Service Discontinuation</h3>
              <p>
                If we decide to permanently discontinue the Service:
              </p>
              <ul>
                <li>We will provide at least 90 days advance notice</li>
                <li>You will have the opportunity to export all your data</li>
                <li>Prorated refunds will be issued for prepaid subscriptions</li>
                <li>We will assist with data migration where reasonably possible</li>
              </ul>
            </section>

            {/* 12. Termination */}
            <section id="termination">
              <h2>12. Termination</h2>

              <h3>12.1 Termination by You</h3>
              <p>
                You may terminate your account at any time by:
              </p>
              <ul>
                <li>Going to Settings → Account → Delete Account</li>
                <li>Contacting our support team</li>
              </ul>
              <p>
                Termination is effective immediately for account access, with full data deletion within 30 days.
              </p>

              <h3>12.2 Termination by Us</h3>
              <p>
                We may suspend or terminate your account immediately, without prior notice or liability, if:
              </p>
              <ul>
                <li>You breach any provision of these Terms</li>
                <li>You violate applicable laws or regulations</li>
                <li>Your conduct harms other users or the Service</li>
                <li>You fail to pay subscription fees</li>
                <li>We are required to do so by law</li>
                <li>We reasonably believe termination is necessary to protect our rights or property</li>
              </ul>

              <h3>12.3 Effect of Termination</h3>
              <p>
                Upon termination:
              </p>
              <ul>
                <li>Your right to access the Service immediately ceases</li>
                <li>All licenses granted to you terminate</li>
                <li>We may delete your account and User Content after 30 days</li>
                <li>You remain liable for all fees owed prior to termination</li>
                <li>No refunds will be issued except as stated in Section 9</li>
              </ul>

              <h3>12.4 Survival</h3>
              <p>
                The following sections survive termination: 4 (User Content), 5.5 (License Duration), 7 (Intellectual Property), 13 (Disclaimers), 14 (Limitation of Liability), 15 (Indemnification), 18 (Dispute Resolution), and 19 (Governing Law).
              </p>

              <h3>12.5 Data Retrieval After Termination</h3>
              <p className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <strong>Important:</strong> After account termination, you have a 30-day grace period to export your data. After 30 days, all data is permanently deleted and cannot be recovered. We strongly recommend exporting data BEFORE terminating your account.
              </p>
            </section>

            {/* 13. Disclaimers */}
            <section id="disclaimers">
              <h2>13. Disclaimers and Warranties</h2>

              <h3>13.1 "AS IS" and "AS AVAILABLE"</h3>
              <p className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>Warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Title</li>
                <li>Accuracy, completeness, or reliability of content</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Freedom from viruses or harmful components</li>
              </ul>

              <h3>13.2 No Guarantee of Data Preservation</h3>
              <p>
                While we implement robust backup and security measures, WE DO NOT GUARANTEE that your User Content will be preserved without loss or corruption. You are solely responsible for maintaining backup copies of important content.
              </p>

              <h3>13.3 Third-Party Content and Services</h3>
              <p>
                The Service may contain links to third-party websites or integrate with third-party services. We do not endorse and are not responsible for:
              </p>
              <ul>
                <li>Accuracy or reliability of third-party content</li>
                <li>Privacy practices of third parties</li>
                <li>Availability of third-party services</li>
                <li>Actions or omissions of third parties</li>
              </ul>

              <h3>13.4 AI-Generated Content</h3>
              <p>
                AI-powered features (such as Spark Collections writing prompts) are provided for assistance only. We do not guarantee:
              </p>
              <ul>
                <li>Accuracy of AI-generated suggestions</li>
                <li>Appropriateness for your specific use case</li>
                <li>Freedom from bias or errors</li>
              </ul>
              <p>
                You are responsible for reviewing and verifying all AI-generated content before use.
              </p>

              <h3>13.5 No Professional Advice</h3>
              <p>
                The Service does not provide legal, tax, financial, or estate planning advice. Consult qualified professionals for such matters.
              </p>

              <h3>13.6 Jurisdictional Variations</h3>
              <p>
                Some jurisdictions do not allow exclusion of implied warranties. In such jurisdictions, the above exclusions may not apply to you, and you may have additional rights.
              </p>
            </section>

            {/* 14. Limitation of Liability */}
            <section id="limitation-liability">
              <h2>14. Limitation of Liability</h2>

              <h3>14.1 Exclusion of Damages</h3>
              <p className="bg-red-900/20 border-l-4 border-red-500 p-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL FIREFLY GROVE, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:
              </p>
              <ul>
                <li><strong>Indirect damages</strong></li>
                <li><strong>Incidental damages</strong></li>
                <li><strong>Special damages</strong></li>
                <li><strong>Consequential damages</strong></li>
                <li><strong>Punitive damages</strong></li>
                <li><strong>Loss of profits</strong></li>
                <li><strong>Loss of data</strong></li>
                <li><strong>Loss of goodwill</strong></li>
                <li><strong>Business interruption</strong></li>
                <li><strong>Emotional distress</strong></li>
              </ul>
              <p>
                ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>

              <h3>14.2 Cap on Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF:
              </p>
              <ul>
                <li>The amount you paid us in the 12 months preceding the claim, OR</li>
                <li>$100 USD</li>
              </ul>

              <h3>14.3 Exceptions</h3>
              <p>
                The limitations in this section do not apply to:
              </p>
              <ul>
                <li>Death or personal injury caused by our gross negligence</li>
                <li>Fraud or fraudulent misrepresentation</li>
                <li>Liability that cannot be excluded by law</li>
                <li>Your indemnification obligations under Section 15</li>
              </ul>

              <h3>14.4 Basis of the Bargain</h3>
              <p>
                You acknowledge that we have set our prices and entered into these Terms in reliance upon the disclaimers of warranty and limitations of liability set forth herein, and that the same form an essential basis of the bargain between you and us.
              </p>

              <h3>14.5 Jurisdictional Variations</h3>
              <p>
                Some jurisdictions do not allow limitation or exclusion of liability for incidental or consequential damages. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
              </p>
            </section>

            {/* 15. Indemnification */}
            <section id="indemnification">
              <h2>15. Indemnification</h2>

              <h3>15.1 Your Indemnification Obligations</h3>
              <p>
                You agree to indemnify, defend, and hold harmless Firefly Grove, its affiliates, and their respective officers, directors, employees, agents, and representatives from and against any and all claims, liabilities, damages, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising from or related to:
              </p>
              <ul>
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another person or entity</li>
                <li>Your User Content, including any claims of infringement or violation of third-party rights</li>
                <li>Your violation of any applicable law or regulation</li>
                <li>Any dispute between you and other users</li>
              </ul>

              <h3>15.2 Control of Defense</h3>
              <p>
                We reserve the right, at our own expense, to assume the exclusive defense and control of any matter subject to indemnification by you. You agree to cooperate with our defense of such claims.
              </p>

              <h3>15.3 Notice Requirement</h3>
              <p>
                We will make reasonable efforts to notify you of any such claim, but our failure to provide notice does not relieve you of your indemnification obligations unless you are materially prejudiced by the lack of notice.
              </p>
            </section>

            {/* 16. DMCA */}
            <section id="dmca">
              <h2>16. DMCA and Copyright Policy</h2>

              <h3>16.1 Copyright Respect</h3>
              <p>
                We respect the intellectual property rights of others and expect our users to do the same. We will respond to valid notices of copyright infringement in accordance with the Digital Millennium Copyright Act ("DMCA").
              </p>

              <h3>16.2 Filing a DMCA Notice</h3>
              <p>
                If you believe your copyrighted work has been infringed on the Service, submit a DMCA notice containing:
              </p>
              <ul>
                <li>Physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Description of the copyrighted work claimed to be infringed</li>
                <li>Description and location of the infringing material on the Service (URL or specific identification)</li>
                <li>Your contact information (address, phone number, email)</li>
                <li>A statement that you have a good faith belief that the use is not authorized</li>
                <li>A statement under penalty of perjury that the information is accurate and you are authorized to act</li>
              </ul>
              <p>
                <strong>Send DMCA notices to:</strong> mrpoffice@gmail.com with subject "DMCA Takedown Notice"
              </p>

              <h3>16.3 Counter-Notification</h3>
              <p>
                If your content was removed due to a DMCA notice and you believe it was removed in error, you may file a counter-notification containing:
              </p>
              <ul>
                <li>Your physical or electronic signature</li>
                <li>Identification of the removed material and its prior location</li>
                <li>A statement under penalty of perjury that the material was removed by mistake or misidentification</li>
                <li>Your contact information and consent to jurisdiction</li>
              </ul>

              <h3>16.4 Repeat Infringer Policy</h3>
              <p>
                We will terminate the accounts of users who are repeat copyright infringers in appropriate circumstances and in our sole discretion.
              </p>

              <h3>16.5 False Claims</h3>
              <p>
                Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing may be subject to liability for damages. Do not make false claims.
              </p>
            </section>

            {/* 17. Third Party */}
            <section id="third-party">
              <h2>17. Third-Party Services and Links</h2>

              <h3>17.1 Third-Party Services We Use</h3>
              <p>
                The Service integrates with or uses third-party services including:
              </p>
              <ul>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Resend:</strong> Email delivery</li>
                <li><strong>Vercel:</strong> Hosting and file storage</li>
                <li><strong>Neon:</strong> Database services</li>
                <li><strong>OpenAI:</strong> AI features (writing prompts)</li>
              </ul>
              <p>
                Your use of the Service constitutes acceptance of these third parties' terms and privacy policies.
              </p>

              <h3>17.2 Third-Party Links</h3>
              <p>
                The Service may contain links to third-party websites. These links are provided for your convenience only. We do not:
              </p>
              <ul>
                <li>Endorse or make representations about third-party sites</li>
                <li>Control the content of third-party sites</li>
                <li>Accept responsibility for third-party practices</li>
                <li>Guarantee the availability of third-party services</li>
              </ul>

              <h3>17.3 Third-Party Actions</h3>
              <p>
                We are not liable for:
              </p>
              <ul>
                <li>Actions or omissions of third-party service providers</li>
                <li>Failures or interruptions of third-party services</li>
                <li>Third-party data breaches or security incidents</li>
                <li>Third-party pricing or policy changes</li>
              </ul>
            </section>

            {/* 18. Dispute Resolution */}
            <section id="dispute-resolution">
              <h2>18. Dispute Resolution and Arbitration</h2>

              <h3>18.1 Informal Resolution</h3>
              <p>
                Before filing a claim, you agree to contact us at mrpoffice@gmail.com and attempt to resolve the dispute informally for at least 30 days. Most disputes can be resolved quickly and amicably this way.
              </p>

              <h3>18.2 Binding Arbitration</h3>
              <p className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <strong>PLEASE READ CAREFULLY:</strong> This section contains an arbitration agreement which will, with limited exceptions, require you to submit claims you have against us to binding and final arbitration.
              </p>
              <p>
                If informal resolution fails, you agree that any dispute, claim, or controversy arising from or relating to these Terms or the Service shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules.
              </p>

              <h3>18.3 Arbitration Procedure</h3>
              <ul>
                <li>Arbitration will be conducted by a single neutral arbitrator</li>
                <li>Arbitration will take place in your county of residence or remotely by video conference</li>
                <li>The arbitrator may award any relief that would be available in court</li>
                <li>The arbitrator's decision is final and binding</li>
                <li>Judgment on the award may be entered in any court of competent jurisdiction</li>
              </ul>

              <h3>18.4 Exceptions to Arbitration</h3>
              <p>
                Either party may bring suit in court for:
              </p>
              <ul>
                <li>Claims of intellectual property infringement</li>
                <li>Claims related to or arising from theft, piracy, or unauthorized use</li>
                <li>Small claims court actions (below jurisdictional limit)</li>
                <li>Injunctive or equitable relief</li>
              </ul>

              <h3>18.5 Class Action Waiver</h3>
              <p className="bg-red-900/20 border-l-4 border-red-500 p-4">
                <strong>YOU AND FIREFLY GROVE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.</strong>
              </p>
              <p>
                Unless both parties agree otherwise, the arbitrator may not consolidate more than one person's claims and may not preside over any form of representative or class proceeding.
              </p>

              <h3>18.6 Opt-Out of Arbitration</h3>
              <p>
                You may opt out of this arbitration agreement by sending written notice to mrpoffice@gmail.com within 30 days of first accepting these Terms. Your notice must include your name, address, and a clear statement that you wish to opt out of the arbitration agreement.
              </p>

              <h3>18.7 Changes to Arbitration Agreement</h3>
              <p>
                If we make material changes to this arbitration agreement, you may reject the changes by sending written notice within 30 days. In that case, the previous arbitration provisions will continue to apply.
              </p>
            </section>

            {/* 19. Governing Law */}
            <section id="governing-law">
              <h2>19. Governing Law and Jurisdiction</h2>

              <h3>19.1 Governing Law</h3>
              <p>
                These Terms and any dispute arising from or relating to these Terms or the Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>

              <h3>19.2 Jurisdiction and Venue</h3>
              <p>
                For any disputes not subject to arbitration (as described in Section 18), you agree to the exclusive jurisdiction and venue of the state and federal courts located in New Castle County, Delaware.
              </p>

              <h3>19.3 Waiver of Jury Trial</h3>
              <p>
                TO THE EXTENT PERMITTED BY LAW, YOU AND FIREFLY GROVE WAIVE ANY RIGHT TO A JURY TRIAL in any proceeding arising out of or related to these Terms or the Service.
              </p>

              <h3>19.4 International Users</h3>
              <p>
                The Service is controlled and operated from the United States. If you access the Service from outside the United States, you do so at your own risk and are responsible for compliance with local laws.
              </p>
            </section>

            {/* 20. Miscellaneous */}
            <section id="miscellaneous">
              <h2>20. Miscellaneous Provisions</h2>

              <h3>20.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any additional terms referenced herein, constitute the entire agreement between you and Firefly Grove and supersede all prior agreements, understandings, and communications, whether written or oral.
              </p>

              <h3>20.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions will continue in full force and effect. The invalid provision will be modified to the minimum extent necessary to make it valid and enforceable.
              </p>

              <h3>20.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. Any waiver of any provision will be effective only if in writing and signed by us.
              </p>

              <h3>20.4 Assignment</h3>
              <p>
                You may not assign, transfer, or delegate these Terms or your rights or obligations hereunder without our prior written consent. We may assign these Terms without restriction. Any purported assignment in violation of this section is void.
              </p>

              <h3>20.5 Force Majeure</h3>
              <p>
                We will not be liable for any delay or failure to perform resulting from causes outside our reasonable control, including but not limited to: acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, network infrastructure failures, strikes, or shortages of transportation, fuel, energy, labor, or materials.
              </p>

              <h3>20.6 Notices</h3>
              <p>
                All notices to you will be sent to the email address associated with your account. You are responsible for keeping your email address current. Notices to us should be sent to:
              </p>
              <p className="ml-6">
                Email: mrpoffice@gmail.com<br />
                Subject: "Legal Notice - Terms of Service"
              </p>

              <h3>20.7 No Third-Party Beneficiaries</h3>
              <p>
                These Terms do not create any third-party beneficiary rights except as expressly stated herein.
              </p>

              <h3>20.8 Headings</h3>
              <p>
                The section headings in these Terms are for convenience only and have no legal or contractual effect.
              </p>

              <h3>20.9 Language</h3>
              <p>
                These Terms are drafted in English. If translated into other languages, the English version shall prevail in case of any conflict.
              </p>

              <h3>20.10 Export Controls</h3>
              <p>
                You agree to comply with all applicable export and re-export control laws and regulations, including the Export Administration Regulations maintained by the U.S. Department of Commerce. You represent that you are not located in a country subject to U.S. embargo or designated as a "terrorist supporting" country, and that you are not on any U.S. government list of prohibited or restricted parties.
              </p>

              <h3>20.11 Government Use</h3>
              <p>
                If you are a U.S. government entity, the Service is a "commercial item" as defined in 48 C.F.R. § 2.101, and is licensed in accordance with these Terms.
              </p>

              <h3>20.12 Survival</h3>
              <p>
                All provisions that by their nature should survive termination shall survive, including but not limited to: ownership provisions, warranty disclaimers, indemnification, limitations of liability, dispute resolution, and governing law.
              </p>
            </section>

            {/* 21. Contact */}
            <section id="contact">
              <h2>21. Contact Information</h2>

              <p>
                If you have questions, concerns, or disputes regarding these Terms of Service, please contact us:
              </p>

              <div className="bg-bg-dark border border-border-subtle rounded-lg p-6 my-6">
                <p className="mb-4"><strong>Firefly Grove</strong></p>

                <p className="mb-2"><strong>General Inquiries:</strong></p>
                <p className="mb-4">
                  <a href="mailto:mrpoffice@gmail.com" className="text-firefly-glow hover:text-firefly-bright">
                    mrpoffice@gmail.com
                  </a>
                </p>

                <p className="mb-2"><strong>Legal Notices:</strong></p>
                <p className="mb-4">
                  Email: mrpoffice@gmail.com<br />
                  Subject: "Legal Notice - Terms of Service"
                </p>

                <p className="mb-2"><strong>DMCA Notices:</strong></p>
                <p className="mb-4">
                  Email: mrpoffice@gmail.com<br />
                  Subject: "DMCA Takedown Notice"
                </p>

                <p className="mb-2"><strong>Website:</strong></p>
                <p className="mb-4">
                  <a href="https://fireflygrove.app" target="_blank" rel="noopener noreferrer" className="text-firefly-glow hover:text-firefly-bright">
                    fireflygrove.app
                  </a>
                </p>

                <p className="mb-2"><strong>Response Time:</strong></p>
                <p>We aim to respond to all inquiries within 2 business days, and legal matters within 10 business days.</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="bg-firefly-dim/10 border border-firefly-dim/30 rounded-lg p-6 mt-12">
              <h3 className="text-lg font-medium text-text-soft mt-0 mb-3">Acknowledgment of Understanding</h3>
              <p className="mb-3">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
              </p>
              <p className="mb-3">
                You further acknowledge that these Terms, together with our Privacy Policy, represent the complete and exclusive statement of the agreement between you and Firefly Grove regarding your use of the Service.
              </p>
              <p className="mb-0">
                <strong>Questions?</strong> Contact us at{' '}
                <a href="mailto:mrpoffice@gmail.com" className="text-firefly-glow hover:text-firefly-bright">
                  mrpoffice@gmail.com
                </a>
                {' '}before accepting these Terms if you need clarification on any provision.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
