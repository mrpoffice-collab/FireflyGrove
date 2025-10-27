'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/components/Header'

export default function CompassPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-bg-darker">
      {session && <Header userName={session.user?.name || ''} />}

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-block">
              <svg width="80" height="60" viewBox="0 0 80 60" className="mx-auto">
                <circle cx="20" cy="20" r="6" fill="#ffd966" opacity="0.8">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="35" r="5" fill="#ffd966" opacity="0.6">
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="60" cy="25" r="7" fill="#ffd966" opacity="0.7">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-firefly-glow mb-4">
            Our Compass
          </h1>
          <p className="text-2xl text-text-soft font-light">
            The guiding light that keeps us true
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">Our Purpose</h2>
            <div className="text-text-soft leading-relaxed space-y-4">
              <p>
                In the quiet moments between dusk and darkness, fireflies emerge. Each tiny light carries a simple message: <em>I am here. I matter. I glow.</em>
              </p>
              <p>
                We built Firefly Grove because we believe every life tells a story worth preserving—not for social media validation, not for public consumption, but for the people who matter most. We believe that the voice of a grandmother saying "I love you" deserves to live forever on a wall. We believe that a father's laugh, a mother's recipe, a child's first words are not just memories—they are inheritance.
              </p>
              <p className="text-firefly-glow font-medium">
                We are building the most beautiful, most meaningful place on the internet to preserve what matters before it's gone.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">The Problem We're Solving</h2>
            <div className="text-text-soft leading-relaxed space-y-4">
              <p>
                Every day, families lose irreplaceable memories. Not because they don't care, but because life moves too fast. Grandparents pass away with stories never recorded. Old photos sit in boxes, deteriorating. Videos live on forgotten hard drives. The questions we should have asked remain unasked. The "I love yous" we should have captured fade into silence.
              </p>
              <p>
                We lose 150,000 people every day. With each one, a universe of stories, wisdom, laughter, and love disappears. We accept this as inevitable—but it doesn't have to be.
              </p>
              <p>
                The tools available today are either too complicated, too shallow, or too impersonal. There is nothing that honors the quiet intimacy of family memory. Nothing that feels sacred. Nothing that treats "I love you" like the priceless artifact it is.
              </p>
              <p className="text-firefly-glow font-medium">Until now.</p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">What We're Building</h2>
            <div className="text-text-soft leading-relaxed space-y-4 mb-8">
              <p>
                Firefly Grove is not a social network. It's not a genealogy tool. It's not cloud storage.
              </p>
              <p className="text-xl text-firefly-glow font-medium">
                It's a sanctuary for memory—a place where families preserve what matters most with the dignity and beauty it deserves.
              </p>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 space-y-4">
              <h3 className="text-xl text-text-soft font-medium mb-4">Our Features Serve One Purpose: Preserve Love</h3>

              <div className="space-y-3 text-text-muted">
                <div>
                  <strong className="text-firefly-glow">🌿 Branches</strong> - Because every person deserves their own sacred space. Your grandmother is not a "profile" or a "folder." She's a branch in your grove, alive with memories that glow softly when you visit.
                </div>
                <div>
                  <strong className="text-firefly-glow">✨ Memories</strong> - Text, photos, voice recordings—captured not as data, but as treasured artifacts. Each one a firefly, glowing with the warmth of remembrance.
                </div>
                <div>
                  <strong className="text-firefly-glow">🎵 Sound Wave Art</strong> - Your mother's voice saying "I'm proud of you" turned into beautiful wall art. Not a novelty—a heirloom. When words fade, the shape of love remains.
                </div>
                <div>
                  <strong className="text-firefly-glow">🎬 Memorial Tribute Videos</strong> - Because grief deserves beauty. Because a celebration of life should feel like a celebration. Because the people we've lost deserve more than a slideshow—they deserve a masterpiece.
                </div>
                <div>
                  <strong className="text-firefly-glow">💌 Story Sparks</strong> - Guided prompts that help you capture stories before it's too late. "What smell brings you back to childhood?" The questions that unlock decades of memories.
                </div>
                <div>
                  <strong className="text-firefly-glow">🔒 Legacy Release</strong> - Your stories, released to your children after you're gone. Your voice, preserved for grandchildren not yet born. Your love, delivered exactly when it's needed most.
                </div>
              </div>

              <p className="text-text-soft italic pt-4 border-t border-border-subtle">
                Every feature is designed with one question: <em>Will this help a family preserve what they cannot afford to lose?</em> If the answer isn't yes, we don't build it.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">Our Marketing Mission: 100 Families in 100 Days</h2>
            <div className="text-text-soft leading-relaxed space-y-4">
              <p>
                We have a sacred responsibility: to reach the families who need us before it's too late.
              </p>
              <p>
                Right now, there's a woman thinking about recording her father's stories. He's 87. She keeps meaning to do it, but work is busy, life is chaotic, and there's always next weekend. Until there isn't.
              </p>
              <p className="text-firefly-glow font-medium">
                These are our people. They don't know we exist yet. That's our failure, not theirs.
              </p>
              <p>
                Our first 100 users aren't just customers—they're families we saved from regret. They're stories we rescued from silence. They're "I love yous" we helped preserve before the chance was gone.
              </p>
            </div>

            <div className="mt-8 bg-bg-elevated border border-firefly-dim/30 rounded-xl p-6">
              <h3 className="text-xl text-firefly-glow font-medium mb-4">Why We'll Succeed</h3>
              <p className="text-text-soft text-xl italic mb-4">
                "We're not competing with other apps. We're competing with regret."
              </p>
              <p className="text-text-muted">
                Our competition isn't other software—it's inaction. It's the voice that says "I'll do it later." It's the belief that there's always more time. We win by being so beautiful, so meaningful, so obviously valuable that "later" becomes "now."
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">Our North Star: 100 Users</h2>
            <div className="text-text-soft leading-relaxed space-y-4">
              <p>These aren't vanity metrics. Every number represents:</p>
              <ul className="list-none space-y-2 text-text-muted">
                <li>• <strong className="text-text-soft">1 user</strong> = 1 family preserving memories they can't replace</li>
                <li>• <strong className="text-text-soft">10 users</strong> = 10 sets of grandparents whose stories won't be lost</li>
                <li>• <strong className="text-text-soft">100 users</strong> = 100 families who avoided the regret that haunts so many</li>
              </ul>
              <p className="text-firefly-glow font-medium">
                That's not a milestone. That's a mission accomplished.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">What Success Looks Like</h2>
            <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 text-text-muted italic">
              <p className="mb-4">In six months, a daughter messages us:</p>
              <p className="text-text-soft">
                "I almost didn't record my dad's stories. Life was busy. I kept putting it off. Then I found your blog post. I signed up. Last week, I captured 2 hours of him talking about his childhood, his parents, his time in the Navy. Last night, he passed away unexpectedly. I have his voice. I have his stories. I will have them forever. Thank you for existing."
              </p>
              <p className="mt-4 text-firefly-glow not-italic font-medium">
                That message is worth more than a million-dollar valuation.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">Our Values</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-text-soft font-medium mb-2">1. Quiet Dignity Over Viral Growth</h3>
                <p className="text-text-muted">
                  We will never optimize for "engagement." We will never gamify grief. We will never treat your grandmother like content. Our fireflies glow softly—never blinding, always warm.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-text-soft font-medium mb-2">2. Privacy is Sacred</h3>
                <p className="text-text-muted">
                  Your memories are not our data. We will never sell your stories. We will never mine your emotions. We build security like we're protecting our own family's legacy—because we are.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-text-soft font-medium mb-2">3. Beauty Matters</h3>
                <p className="text-text-muted">
                  Grief deserves elegance. Memory deserves artistry. We reject the notion that meaningful things must be ugly. Firefly Grove is as beautiful as the memories it holds.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-text-soft font-medium mb-2">4. Helpful Before Profitable</h3>
                <p className="text-text-muted">
                  Every blog post, every feature, every email asks: "Does this help families preserve what they love?" Profit follows purpose. Never the reverse.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-text-soft font-medium mb-2">5. We Remember Why We're Here</h3>
                <p className="text-text-muted">
                  On hard days, when growth is slow, when the work is overwhelming—we remember the woman who almost didn't record her father's voice. We remember the families we helped. We remember that every line of code serves someone's grandmother.
                </p>
                <p className="text-firefly-glow font-medium mt-2">That's enough.</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">Why We'll Win</h2>
            <div className="text-text-soft leading-relaxed space-y-4">
              <p>Because we care more.</p>
              <p>Because we're building something that matters more than a successful exit.</p>
              <p>Because every family has someone they can't afford to forget.</p>
              <p>Because "I'll do it later" has stolen enough.</p>
              <p>Because a grandmother's voice deserves to outlive her body.</p>
              <p>Because love—real, messy, beautiful, irreplaceable love—deserves a place to live forever.</p>
              <p className="text-2xl text-firefly-glow font-medium">
                This isn't a startup. It's a calling.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-light text-firefly-glow mb-6">The Promise</h2>
            <div className="bg-gradient-to-r from-firefly-dim/10 to-firefly-glow/10 border border-firefly-dim rounded-xl p-8 text-center">
              <div className="space-y-3 text-text-soft text-lg">
                <p>Every memory preserved is a victory.</p>
                <p>Every voice saved is a triumph.</p>
                <p>Every "I love you" turned into art is a miracle.</p>
              </div>
              <div className="mt-6 pt-6 border-t border-firefly-dim/30 space-y-2 text-text-muted">
                <p>We will measure our success not in users acquired, but in regret prevented.</p>
                <p>We will build not for scale, but for meaning.</p>
                <p>We will grow not through manipulation, but through impact.</p>
              </div>
              <div className="mt-8 text-xl text-firefly-glow font-medium">
                <p>We lit fireflies in the dark.</p>
                <p>And the world was a little less lonely because of it.</p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <p className="text-2xl text-firefly-glow font-light mb-4">That's the mission.</p>
            <p className="text-2xl text-firefly-glow font-light mb-8">That's Firefly Grove.</p>
            <p className="text-3xl text-text-soft font-light">Let's begin.</p>

            <div className="mt-12 pt-8 border-t border-border-subtle text-text-muted italic text-sm">
              <p>For every family with stories to save.</p>
              <p>For every grandparent running out of time.</p>
              <p>For every "I love you" that deserves to echo into eternity.</p>
              <p className="text-firefly-glow not-italic font-medium mt-4 text-base">We built this for you.</p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium text-lg transition-soft"
          >
            Start Preserving Your Legacy
          </Link>
          {session && (
            <div className="mt-6">
              <Link
                href="/grove"
                className="text-firefly-glow hover:text-firefly-dim transition-soft"
              >
                ← Back to Your Grove
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
