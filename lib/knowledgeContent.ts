/**
 * Comprehensive Knowledge Bank Content
 * Auto-generates detailed documentation pages for each feature
 */

export interface KnowledgeSection {
  title: string
  content: string
}

export interface KnowledgeArticle {
  slug: string
  title: string
  subtitle: string
  icon: string
  category: string

  // Main content sections
  overview: string
  howItWorks: KnowledgeSection[]
  useCases: string[]
  tips: string[]
  faqs: { question: string; answer: string }[]

  // Related content
  relatedGuides: string[]
}

export const knowledgeArticles: Record<string, KnowledgeArticle> = {
  'audio-sparks-quick-capture': {
    slug: 'audio-sparks-quick-capture',
    title: 'Audio Sparks: Quick Voice Capture',
    subtitle: 'Capture thoughts in seconds with voice',
    icon: '⚡',
    category: 'VOICE_AUDIO',

    overview: `Audio Sparks is your fastest way to preserve memories. Instead of typing, just speak - perfect for those quick thoughts, sudden recollections, or moments when you're on the go. Every spark of memory matters, no matter how small.`,

    howItWorks: [
      {
        title: 'Open Audio Sparks',
        content: 'Click the Audio Sparks button in your sidebar or press the keyboard shortcut (Alt+A). The recording interface opens instantly.',
      },
      {
        title: 'Record Your Memory',
        content: 'Click the microphone button and start talking. Share your thought, memory, or story naturally - no need to be formal. Speak for as long or short as you like.',
      },
      {
        title: 'Save to Your Tree',
        content: 'When you finish, click stop. Your audio is automatically transcribed to text (which you can edit) and saved to your selected branch.',
      },
      {
        title: 'Add Context (Optional)',
        content: 'Before saving, you can add a date, location, tags, or attach a photo. Or just save it as-is - the memory is what matters.',
      },
    ],

    useCases: [
      'Recording a quick thought while cooking dinner',
      'Capturing a childhood memory that suddenly came to mind',
      'Preserving a story your grandmother just told you over the phone',
      'Documenting daily moments without interrupting your flow',
      'Creating voice journal entries throughout your day',
      'Recording memories while driving (hands-free)',
    ],

    tips: [
      'Use Audio Sparks during your morning coffee - make it a daily ritual',
      'Keep your phone nearby with Firefly Grove open for spontaneous captures',
      'Don\'t worry about perfect grammar - speak naturally and authentically',
      'You can always edit the transcribed text later if needed',
      'Tag recurring themes (like "garden memories" or "dad stories") for easy finding later',
      'Audio Sparks works great with prompts - try combining them!',
    ],

    faqs: [
      {
        question: 'Is my voice recording kept or just the transcription?',
        answer: 'Both! We keep your original voice recording AND the transcribed text. You can play back your voice anytime, or just read the text.',
      },
      {
        question: 'What if the transcription gets something wrong?',
        answer: 'You can edit the transcribed text before saving, or edit it anytime after. Your original voice recording is always preserved.',
      },
      {
        question: 'Can I use Audio Sparks on my phone?',
        answer: 'Yes! Audio Sparks works on all devices. It\'s especially handy on mobile for capturing memories throughout your day.',
      },
      {
        question: 'How long can my Audio Spark be?',
        answer: 'As long as you need! Most Audio Sparks are 30 seconds to 2 minutes, but you can record longer stories too.',
      },
      {
        question: 'Can family members hear my Audio Sparks?',
        answer: 'Only if you save them to a shared branch. If you save to a private branch, only you can see (and hear) them.',
      },
    ],

    relatedGuides: [
      'recording-voice-memories',
      'memory-visibility-privacy',
      'story-sparks-writing-prompts',
    ],
  },

  'understanding-trees-and-branches': {
    slug: 'understanding-trees-and-branches',
    title: 'Understanding Trees and Branches',
    subtitle: 'Learn how to organize your family memories',
    icon: '🌳',
    category: 'GETTING_STARTED',

    overview: `In Firefly Grove, your memories are organized like a real tree - with a trunk (your main family line) and branches (different aspects of life, people, or themes). This natural structure makes it easy to find memories and control who sees what.`,

    howItWorks: [
      {
        title: 'Your Tree is Your Family',
        content: 'Each tree represents a family or legacy. Most people start with one tree for their immediate family. The tree trunk represents your main family timeline.',
      },
      {
        title: 'Branches Organize by Theme',
        content: 'Create branches for different parts of life: "Dad\'s Military Service", "Our Garden Journey", "Grandma\'s Recipes", "Family Vacations". Each branch holds related memories.',
      },
      {
        title: 'Branches Can Have Sub-Branches',
        content: 'Just like a real tree! "Family Vacations" could branch into "Beach Trips" and "Mountain Getaways". Organize as simply or detailed as you like.',
      },
      {
        title: 'Control Access Per Branch',
        content: 'Different branches can have different privacy settings. Share "Family Recipes" with everyone, but keep "Dad\'s Health Journey" private.',
      },
    ],

    useCases: [
      'Organizing memories by person: "Mom\'s Story", "Dad\'s Story", "Our Kids"',
      'Grouping by life phase: "Childhood", "College Years", "Marriage", "Retirement"',
      'Categorizing by theme: "Holidays", "Daily Life", "Major Events", "Recipes"',
      'Separating by privacy: Public branches for extended family, private for sensitive topics',
      'Creating project branches: "Building Our Home", "Learning to Garden"',
    ],

    tips: [
      'Start simple - you can always create more branches later',
      'Name branches clearly so family members understand what goes where',
      'Use branches to give different family members ownership of their stories',
      'Don\'t over-organize! Sometimes "Memories" is enough',
      'Think of branches as chapters in your family\'s book',
      'You can move memories between branches anytime - nothing is permanent',
    ],

    faqs: [
      {
        question: 'How many branches can I create?',
        answer: 'As many as you need! Most families have 5-15 main branches, each with a few sub-branches. There\'s no limit.',
      },
      {
        question: 'Can I change branch names later?',
        answer: 'Absolutely! Click on any branch and select "Edit Branch" to change the name, description, or privacy settings.',
      },
      {
        question: 'What\'s the difference between a tree and a branch?',
        answer: 'A tree is your whole family\'s collection. Branches are the categories within that tree. Most people only need one tree, but you can create multiple trees for different families or purposes.',
      },
      {
        question: 'Can memories be in multiple branches?',
        answer: 'Each memory lives in one branch, but you can create "memory threads" (replies) that reference it from other branches.',
      },
      {
        question: 'What happens to memories if I delete a branch?',
        answer: 'We\'ll ask you to move the memories to another branch first. We never delete memories without confirmation!',
      },
    ],

    relatedGuides: [
      'branches-organization-strategies',
      'multiple-trees-organization',
      'branch-permissions-access-control',
    ],
  },

  'the-nest-bulk-photo-uploads': {
    slug: 'the-nest-bulk-photo-uploads',
    title: 'The Nest: Bulk Photo Uploads',
    subtitle: 'Upload hundreds of photos at once',
    icon: '📸',
    category: 'PHOTOS_MEDIA',

    overview: `The Nest is your staging area for photos. Instead of uploading photos one-by-one into memories, drop hundreds of photos into the Nest, then "hatch" them into organized memories whenever you're ready. Perfect for digitizing old photo albums or organizing years of phone photos.`,

    howItWorks: [
      {
        title: 'Upload to the Nest',
        content: 'Drag and drop photos, entire folders, or select hundreds of files at once. The Nest accepts JPG, PNG, HEIC, and most image formats. Upload happens in the background.',
      },
      {
        title: 'Photos Wait in the Nest',
        content: 'All uploaded photos sit safely in the Nest until you\'re ready to organize them. They\'re backed up and secure, but not yet part of your memory timeline.',
      },
      {
        title: 'Hatch into Memories',
        content: 'When you have time, visit the Nest and "hatch" photos. Select a photo, add a story or caption, choose a branch and date, then click "Hatch to Memory". The photo becomes a proper memory in your tree.',
      },
      {
        title: 'Batch Hatch Multiple Photos',
        content: 'Select multiple photos from the same event and hatch them together into one memory. Great for vacations, birthday parties, or family gatherings.',
      },
    ],

    useCases: [
      'Digitizing boxes of old printed photos from albums',
      'Uploading years of phone camera rolls all at once',
      'Processing photos from a big family reunion or vacation',
      'Getting photos from family members who send you hundreds at a time',
      'Organizing photos when you have limited time - upload now, organize later',
      'Scanning old slides or negatives in bulk',
    ],

    tips: [
      'Upload everything first, organize later - don\'t let perfectionism stop you from preserving photos',
      'Use the Nest\'s date detection - it reads dates from photo metadata automatically',
      'Sort Nest photos by date to work through them chronologically',
      'You can hatch the same photo into multiple memories if it tells different stories',
      'Delete obvious duplicates or blurry photos while in the Nest to declutter',
      'The Nest is perfect for "someday projects" - photos are safe until you\'re ready',
    ],

    faqs: [
      {
        question: 'How many photos can I upload at once?',
        answer: 'As many as your plan allows! Free plans can store 500 photos in the Nest, paid plans have higher limits. There\'s no limit on how many you upload at once - batches of 1000+ work great.',
      },
      {
        question: 'What happens if I never hatch a photo?',
        answer: 'It stays in the Nest forever, backed up and safe. The Nest is permanent storage - you can hatch photos years later if you want.',
      },
      {
        question: 'Can I delete photos from the Nest?',
        answer: 'Yes! Select any photo and click delete. This permanently removes it. Use this for duplicates or photos you don\'t want to keep.',
      },
      {
        question: 'Do photos in the Nest count toward my storage limit?',
        answer: 'Yes, Nest photos count toward your total storage. But they\'re often smaller than memory photos since you haven\'t added stories yet.',
      },
      {
        question: 'Can family members see photos in my Nest?',
        answer: 'No, the Nest is always private. Only you can see it. Photos only become visible to others after you hatch them into shared branches.',
      },
    ],

    relatedGuides: [
      'adding-photos-to-memories',
      'memory-editing-enhancement',
      'storage-limits-management',
    ],
  },

  'inviting-family-members': {
    slug: 'inviting-family-members',
    title: 'Inviting Family Members',
    subtitle: 'Bring your family into the Grove',
    icon: '🤝',
    category: 'SHARING',

    overview: `Firefly Grove is better together. Invite parents, siblings, cousins, children - anyone who should be part of preserving and adding to your family's story. Each person can contribute memories, react to stories, and help build the legacy.`,

    howItWorks: [
      {
        title: 'Open Sharing Settings',
        content: 'Go to your Tree Settings and click "Invite Family Members". You\'ll see options to invite by email or generate a shareable link.',
      },
      {
        title: 'Send Invitations',
        content: 'Enter email addresses for family members you want to invite. They\'ll receive an invitation email with a link to join your tree. You can add a personal message.',
      },
      {
        title: 'They Create an Account',
        content: 'When they click the invitation link, they\'ll create their own Firefly Grove account (or sign in if they already have one), then automatically join your tree.',
      },
      {
        title: 'Set Their Permissions',
        content: 'Choose what each person can do: View only, Add memories, Edit anything, or Admin. You can change permissions anytime.',
      },
    ],

    useCases: [
      'Inviting aging parents to share their stories before memories fade',
      'Getting siblings to contribute their perspectives on shared childhood',
      'Letting adult children add their own family memories to the tree',
      'Including extended family for holidays and reunions',
      'Inviting a family historian or genealogist to help organize',
      'Bringing in a trusted friend who\'s "like family"',
    ],

    tips: [
      'Start with close family first - don\'t invite everyone at once',
      'Send a personal message explaining why you\'re building this legacy',
      'Give most people "Add memories" permission - trust them to contribute',
      'Create private branches for sensitive topics before inviting everyone',
      'Schedule a family video call to introduce Firefly Grove together',
      'Share an example memory to show them what you\'re building',
    ],

    faqs: [
      {
        question: 'Can I remove someone if they\'re not participating?',
        answer: 'Yes, you can remove any member anytime from Tree Settings. Their contributions stay in the tree, but they lose access.',
      },
      {
        question: 'What if someone accidentally deletes a memory?',
        answer: 'Only admins can delete memories by default. If you\'re worried, keep admin permissions limited. Deleted memories can be recovered for 30 days.',
      },
      {
        question: 'Can invited members invite more people?',
        answer: 'Only if you give them admin permissions. Regular members can only view and contribute, not invite others.',
      },
      {
        question: 'Do family members need to pay for their own account?',
        answer: 'No! Your paid plan covers everyone you invite to your tree. They get full access for free.',
      },
      {
        question: 'Can the same person be in multiple trees?',
        answer: 'Yes! Your sister might be in your parents\' tree, your tree, and her own tree. Each tree is separate.',
      },
    ],

    relatedGuides: [
      'branch-permissions-access-control',
      'approval-workflow-review-contributions',
      'member-removal-managing-collaborators',
    ],
  },

  'choosing-your-keepers': {
    slug: 'choosing-your-keepers',
    title: 'Choosing Your Keepers (Heirs)',
    subtitle: 'Select who will preserve your legacy',
    icon: '🕯️',
    category: 'LEGACY',

    overview: `Keepers (also called Heirs) are the people you trust to receive full ownership of your Firefly Grove memories if something happens to you. This ensures your legacy never disappears and your stories pass to the next generation safely.`,

    howItWorks: [
      {
        title: 'Designate Your Keepers',
        content: 'In Settings > Legacy Planning, you can designate 1-3 people as your Keepers. Enter their names and email addresses.',
      },
      {
        title: 'Choose Transfer Conditions',
        content: 'Decide when Keepers receive access: after your death (verified by death certificate), after a period of inactivity (6 months, 1 year, etc.), or immediately as co-owners.',
      },
      {
        title: 'Keepers Receive Notification',
        content: 'Your designated Keepers receive an email letting them know they\'ve been chosen. They don\'t get access yet - just notification of their future role.',
      },
      {
        title: 'Automatic Transfer When Needed',
        content: 'If the transfer conditions are met (inactivity or death verification), your Keepers automatically receive full ownership. They become admins and can preserve, share, or pass on the legacy.',
      },
    ],

    useCases: [
      'Ensuring your children inherit your life story and family history',
      'Passing memories to grandchildren who will value them someday',
      'Designating a sibling to preserve shared family memories',
      'Choosing a trusted cousin to be family historian',
      'Ensuring a dear friend receives personal memories meant for them',
    ],

    tips: [
      'Choose people younger than you who will outlive you',
      'Pick someone who cares about family history and stories',
      'Consider designating 2-3 Keepers for redundancy',
      'Have a conversation with your Keepers about your wishes',
      'Update your Keepers if relationships change',
      'Include instructions for Keepers in a special memory',
    ],

    faqs: [
      {
        question: 'Can I change my Keepers later?',
        answer: 'Yes, anytime! Just go to Legacy Planning and update your choices. There\'s no limit to how often you change.',
      },
      {
        question: 'Do my Keepers know they\'ve been chosen?',
        answer: 'Yes, they receive an email notification. But they don\'t get access to your memories until the transfer conditions are met.',
      },
      {
        question: 'What if all my Keepers predecease me?',
        answer: 'You should update your Keepers if this happens. If you haven\'t, Firefly Grove will contact any remaining family members on your tree.',
      },
      {
        question: 'Can Keepers fight over who gets the memories?',
        answer: 'No - you can designate multiple Keepers who ALL receive full access. They become co-owners and share equally.',
      },
      {
        question: 'What if I don\'t choose any Keepers?',
        answer: 'Your tree will stay active but frozen. Family members on your tree will retain their current access but can\'t make changes.',
      },
    ],

    relatedGuides: [
      'heir-conditions-release-timing',
      'multiple-heirs-redundancy-planning',
      'legacy-transfer-immediate-handoff',
    ],
  },

  'firefly-bursts-memory-rediscovery': {
    slug: 'firefly-bursts-memory-rediscovery',
    title: 'Firefly Bursts: Rediscover Your Memories',
    subtitle: 'Get reminded of memories at the perfect time',
    icon: '🌟',
    category: 'CORE_FEATURES',

    overview: `Firefly Bursts automatically resurface your old memories at meaningful moments - anniversaries, seasons, or randomly when you need a smile. Like fireflies lighting up at dusk, your memories glow again at just the right time.`,

    howItWorks: [
      {
        title: 'Automatic Memory Reminders',
        content: 'Firefly Bursts runs in the background, checking your memories for meaningful dates, seasonal connections, or memories that deserve rediscovery.',
      },
      {
        title: 'Smart Timing',
        content: 'You receive a notification or email with the memory on its anniversary ("3 years ago today..."), during the same season, or after enough time has passed that rediscovering it feels special.',
      },
      {
        title: 'Open and Relive',
        content: 'Click the notification to read, watch, or listen to the memory again. Add a reply to reflect on how things have changed, or just smile at the reminder.',
      },
      {
        title: 'Customize Frequency',
        content: 'Choose how often you want Firefly Bursts: daily, weekly, monthly, or only on exact anniversaries. You control the pace of rediscovery.',
      },
    ],

    useCases: [
      'Remembering loved ones on their birthday or anniversary',
      'Rediscovering vacation memories during the same season',
      'Getting reminded of childhood stories you\'d forgotten',
      'Celebrating milestones ("You started gardening 5 years ago today!")',
      'Finding comfort in old memories during difficult times',
      'Keeping family history alive through regular reminders',
    ],

    tips: [
      'Set Firefly Bursts to weekly for a nice Sunday tradition',
      'When a burst arrives, take time to add a reflection or reply',
      'Share bursts with family - forward the email or screenshot it',
      'Use bursts as journaling prompts to update old memories',
      'Turn off bursts for sensitive memories you\'re not ready to revisit',
      'Bursts work best when you\'ve been adding memories for 6+ months',
    ],

    faqs: [
      {
        question: 'Can I control which memories become bursts?',
        answer: 'Yes! You can mark memories as "Never burst" if they\'re too sensitive. Or tag memories as "Burst-worthy" to prioritize them.',
      },
      {
        question: 'How does Firefly Bursts choose which memory to show?',
        answer: 'It looks for anniversaries first (exact dates), then seasonal matches, then memories you haven\'t revisited in a while. The algorithm learns what you engage with.',
      },
      {
        question: 'Do family members get the same bursts I do?',
        answer: 'No, each person gets personalized bursts based on their own memories and preferences. But you can share a burst with family if you want.',
      },
      {
        question: 'Can I turn off Firefly Bursts completely?',
        answer: 'Yes, go to Settings > Notifications and disable Firefly Bursts. You can always turn them back on later.',
      },
      {
        question: 'What if I don\'t have time to read every burst?',
        answer: 'That\'s okay! Bursts are gentle reminders, not obligations. Skip them when busy, enjoy them when you have time.',
      },
    ],

    relatedGuides: [
      'memory-scheduling-future-release',
      'glowing-memories-reactions',
      'memory-threading-replies',
    ],
  },

  'memory-threading-replies': {
    slug: 'memory-threading-replies',
    title: 'Memory Threading: Join the Conversation',
    subtitle: 'Reply and build on family stories',
    icon: '🧵',
    category: 'CORE_FEATURES',

    overview: `Memory Threading lets family members reply to memories, adding their own perspective, photos, or stories. Like a conversation thread, memories become richer when everyone contributes their version of events.`,

    howItWorks: [
      {
        title: 'View a Memory',
        content: 'When browsing memories, you\'ll see a "Reply" or "Add Your Memory" button at the bottom of any memory you have access to.',
      },
      {
        title: 'Write Your Reply',
        content: 'Click Reply and share your perspective: "I remember that day differently..." or "Here\'s what happened next..." Add photos, audio, or just text.',
      },
      {
        title: 'Thread Appears Below',
        content: 'Your reply appears as a thread beneath the original memory. Others can read both versions and see how different people experienced the same moment.',
      },
      {
        title: 'Threads Can Branch',
        content: 'People can reply to your reply, creating conversation chains. Threads can also become their own standalone memories if they grow large enough.',
      },
    ],

    useCases: [
      'Adding your version of a shared childhood story',
      'Correcting details ("Actually, that was 1987, not 1986...")',
      'Expanding on what happened after the original memory',
      'Adding photos from your own camera roll of the same event',
      'Sharing how a memory makes you feel now, years later',
      'Connecting memories across different branches of the family tree',
    ],

    tips: [
      'Don\'t be shy about correcting or expanding - everyone\'s perspective matters',
      'Use threads to ask questions: "Mom, what happened next?"',
      'Add "hidden" photos you have from the same event',
      'Thread replies are great for updates: "Update: We visited that place again in 2024!"',
      'Respect the original memory - keep replies constructive and kind',
      'Threads make memories interactive - encourage family to reply!',
    ],

    faqs: [
      {
        question: 'Can I delete someone else\'s reply to my memory?',
        answer: 'As the memory creator or tree admin, yes. But consider discussing it first - everyone\'s perspective is valuable.',
      },
      {
        question: 'Do threaded replies count as separate memories?',
        answer: 'No, they\'re part of the parent memory. But you can "promote" a thread to its own memory if it grows large enough.',
      },
      {
        question: 'Can I reply to a private memory?',
        answer: 'Only if the creator shared that memory with you. You can\'t see or reply to memories you don\'t have access to.',
      },
      {
        question: 'What if two people remember the same event totally differently?',
        answer: 'That\'s beautiful! Both perspectives live side-by-side in the thread. Truth is often somewhere in between.',
      },
      {
        question: 'Can I move a thread to a different branch?',
        answer: 'Threads stay with their parent memory. But you can copy a thread and create a new standalone memory in a different branch.',
      },
    ],

    relatedGuides: [
      'memory-editing-enhancement',
      'inviting-family-members',
      'co-authoring-joint-memories',
    ],
  },

  'story-sparks-writing-prompts': {
    slug: 'story-sparks-writing-prompts',
    title: 'Story Sparks: Writing Prompts',
    subtitle: 'Get inspired to share your stories',
    icon: '💭',
    category: 'CORE_FEATURES',

    overview: `Story Sparks are thoughtful writing prompts that help you remember and share stories you might otherwise forget. Instead of staring at a blank page, you get a specific question that unlocks memories.`,

    howItWorks: [
      {
        title: 'Browse Story Sparks',
        content: 'Visit the Story Sparks section to see hundreds of prompts organized by theme: Childhood, Family, Career, Adventures, Everyday Life, and more.',
      },
      {
        title: 'Choose a Prompt',
        content: 'Pick a prompt that resonates: "What smell instantly brings you back to childhood?" or "Tell about a time you were proud of yourself." Click to start writing.',
      },
      {
        title: 'Write Your Response',
        content: 'The prompt appears at the top. Write, record audio, or add photos. The prompt helps focus your memory without being restrictive.',
      },
      {
        title: 'Save to Your Tree',
        content: 'When done, save the memory to any branch. The prompt becomes the title/context, and your story is preserved forever.',
      },
    ],

    useCases: [
      'Overcoming writer\'s block when you want to journal',
      'Capturing stories before you forget them',
      'Creating a weekly memory-writing practice',
      'Interviewing older relatives using prompts as guides',
      'Building a comprehensive life story, one prompt at a time',
      'Teaching kids to document their own lives',
    ],

    tips: [
      'Do one Story Spark per week as a Sunday evening ritual',
      'Use voice recording if writing feels too slow',
      'Share prompts with aging parents - interview them using sparks',
      'Don\'t overthink it - rough drafts are better than no memory at all',
      'Create custom prompts for your family\'s unique experiences',
      'Seasonal prompts are great for capturing yearly traditions',
    ],

    faqs: [
      {
        question: 'Can I create my own custom prompts?',
        answer: 'Yes! Go to Story Sparks > Create Custom Prompt. Write a question, save it, and it joins your personal collection.',
      },
      {
        question: 'Do I have to answer prompts exactly as written?',
        answer: 'No! Prompts are springboards. If they trigger a different memory, follow that thread. The prompt just gets you started.',
      },
      {
        question: 'Can family members see which prompts I\'ve answered?',
        answer: 'They can see the memories you create, but not your full list of prompts. Unanswered prompts are private.',
      },
      {
        question: 'How often do new prompts get added?',
        answer: 'We add new seasonal prompts monthly and special occasion prompts for holidays. Plus you can create unlimited custom prompts.',
      },
      {
        question: 'Can I use prompts to interview my grandmother?',
        answer: 'Absolutely! That\'s one of the best uses. Read her a prompt, record her answer (audio or video), and save it as her memory.',
      },
    ],

    relatedGuides: [
      'audio-sparks-quick-capture',
      'recording-voice-memories',
      'memory-editing-enhancement',
    ],
  },

  'glowing-memories-reactions': {
    slug: 'glowing-memories-reactions',
    title: 'Glowing Memories: React to Stories',
    subtitle: 'Show love with reactions and emojis',
    icon: '💚',
    category: 'CORE_FEATURES',

    overview: `Glowing Memories let you react to family stories with emojis and heartfelt responses - like social media reactions, but for memories that matter. Show love, laugh together, or shed tears over shared stories.`,

    howItWorks: [
      {
        title: 'Read a Memory',
        content: 'While reading any memory (yours or a family member\'s), look for the reaction buttons at the bottom: heart, laugh, cry, hug, wow, etc.',
      },
      {
        title: 'Choose Your Reaction',
        content: 'Click the emoji that matches your feeling. You can add multiple reactions, and change them anytime. Your reaction is saved with your name.',
      },
      {
        title: 'See Who Reacted',
        content: 'Hover over reaction counts to see who felt what: "Mom ❤️", "Dad 😂", "Sister 🥺". It shows your family is reading and connecting.',
      },
      {
        title: 'Get Notified',
        content: 'When someone reacts to your memory, you get a gentle notification: "3 people loved your memory about Grandpa\'s garden."',
      },
    ],

    useCases: [
      'Showing you read someone\'s memory without writing a full reply',
      'Letting an aging parent know their stories are cherished',
      'Laughing together at funny childhood memories',
      'Providing comfort after someone shares a difficult memory',
      'Celebrating milestones when family members can\'t comment in person',
      'Building engagement so people keep sharing',
    ],

    tips: [
      'React generously - every reaction encourages more sharing',
      'Use specific emojis: 😂 for funny, 🥺 for touching, 💪 for inspiring',
      'Combine reactions with brief replies for deeper connection',
      'React to old memories to show they still matter years later',
      'Check the "Most Reacted" filter to find family favorites',
      'Custom reactions coming soon - request your favorite emojis!',
    ],

    faqs: [
      {
        question: 'Can I see who reacted to my memories?',
        answer: 'Yes! Click the reaction count to see everyone\'s name and which emoji they chose. It\'s not anonymous.',
      },
      {
        question: 'Can I remove my reaction if I change my mind?',
        answer: 'Yes, click the same emoji again to un-react, or click a different emoji to change your reaction.',
      },
      {
        question: 'Do private memories show reactions?',
        answer: 'Yes, but only people who can see the memory can react. Reactions respect the same privacy settings as the memory itself.',
      },
      {
        question: 'What if someone reacts inappropriately?',
        answer: 'Memory creators and admins can remove individual reactions. Most families never need this - reactions tend to be supportive.',
      },
      {
        question: 'Can I disable reactions on my memories?',
        answer: 'Yes, when creating or editing a memory, you can turn off reactions if you prefer. Or disable them tree-wide in settings.',
      },
    ],

    relatedGuides: [
      'memory-threading-replies',
      'inviting-family-members',
      'firefly-bursts-memory-rediscovery',
    ],
  },

  'memory-editing-enhancement': {
    slug: 'memory-editing-enhancement',
    title: 'Memory Editing: Enrich Your Stories',
    subtitle: 'Add photos, audio, and rich formatting',
    icon: '✏️',
    category: 'CORE_FEATURES',

    overview: `Memories aren't static - they evolve. Edit any memory anytime to add details, photos, voice recordings, dates, locations, or tags. Make your memories richer and more complete over time.`,

    howItWorks: [
      {
        title: 'Open Any Memory',
        content: 'Navigate to a memory you created (or have edit permission for) and click the "Edit" button in the top corner.',
      },
      {
        title: 'Make Your Changes',
        content: 'Edit the text, add or remove photos, attach audio recordings, update the date or location, add tags, or change privacy settings.',
      },
      {
        title: 'Rich Text Formatting',
        content: 'Use bold, italics, bullet points, quotes, and headings to make your memory more readable. Format like a blog post or keep it simple.',
      },
      {
        title: 'Save Automatically',
        content: 'Changes save automatically as you type. Click "Done" when finished. The memory shows an "Edited" timestamp so everyone knows it was updated.',
      },
    ],

    useCases: [
      'Adding photos you forgot during the initial creation',
      'Fixing typos or grammar after posting',
      'Expanding a quick memory with more detail later',
      'Adding audio of you reading the memory aloud',
      'Updating old memories with current context ("Update: that house sold in 2023")',
      'Improving formatting for better readability',
    ],

    tips: [
      'Edit memories when you find old photos that belong with them',
      'Add voice recordings to text memories - hearing your voice adds warmth',
      'Use headings to organize long memories into sections',
      'Tag memories thoroughly for easier searching later',
      'Update privacy settings if your comfort level changes',
      'Version history coming soon - all edits will be tracked',
    ],

    faqs: [
      {
        question: 'Can I see the edit history of a memory?',
        answer: 'Currently no, but we\'re adding full version history soon. You\'ll be able to see all past versions and who edited what.',
      },
      {
        question: 'Can someone else edit my memory?',
        answer: 'Only if you give them permission, or if they\'re a tree admin. Regular members can only edit their own memories.',
      },
      {
        question: 'What if someone accidentally deletes part of my memory?',
        answer: 'Once version history launches, you can restore any previous version. For now, contact support and we can help recover it.',
      },
      {
        question: 'Is there a limit to how many photos I can add?',
        answer: 'Your plan\'s storage limit applies, but there\'s no per-memory photo limit. Add as many as the story needs.',
      },
      {
        question: 'Can I edit memories on mobile?',
        answer: 'Yes! The mobile app has full editing capabilities, though formatting is easier on desktop.',
      },
    ],

    relatedGuides: [
      'adding-photos-to-memories',
      'recording-voice-memories',
      'memory-visibility-privacy',
    ],
  },

  'memory-visibility-privacy': {
    slug: 'memory-visibility-privacy',
    title: 'Memory Visibility: Private vs Shared',
    subtitle: 'Control who sees each memory',
    icon: '👁️',
    category: 'CORE_FEATURES',

    overview: `Not all memories are for everyone. Control exactly who can see each memory: keep some private, share some with close family only, or make some visible to your entire tree. Privacy is flexible and changeable.`,

    howItWorks: [
      {
        title: 'Choose Visibility When Creating',
        content: 'When creating a memory, select visibility: "Only me" (private), "Branch members" (shared with branch), or "Entire tree" (everyone).',
      },
      {
        title: 'Private Memories Stay Hidden',
        content: 'Private memories only you can see. They appear with a lock icon. Perfect for journaling, sensitive topics, or memories you\'re not ready to share.',
      },
      {
        title: 'Branch Sharing',
        content: 'Memories visible to branch members are seen by anyone with access to that branch. Good for targeted sharing (just siblings, just parents, etc.).',
      },
      {
        title: 'Change Anytime',
        content: 'Edit any memory to change its visibility. Make private memories public when you\'re ready, or make shared memories private if you change your mind.',
      },
    ],

    useCases: [
      'Keeping sensitive health memories private',
      'Sharing childhood stories only with siblings',
      'Journaling privately before deciding what to share',
      'Making fun memories public for the whole family',
      'Protecting vulnerable moments until you\'re ready',
      'Creating private memoirs to release as your legacy',
    ],

    tips: [
      'Start private, share later - it\'s easier than regretting oversharing',
      'Use branch permissions to create "adults only" or "immediate family" spaces',
      'Private memories still back up - they\'re not lost if you pass away',
      'Mark rough drafts as private until you polish them',
      'You can schedule private memories to become public later',
      'Private doesn\'t mean deleted - they\'re still in your tree, just hidden',
    ],

    faqs: [
      {
        question: 'Can anyone see my private memories?',
        answer: 'No one. Not even tree admins or Firefly Grove staff. Only you, unless you explicitly grant access.',
      },
      {
        question: 'What happens to private memories when I die?',
        answer: 'Your designated Keepers receive access to ALL memories, including private ones. You can mark specific memories "Delete upon death" if needed.',
      },
      {
        question: 'Can I make an entire branch private?',
        answer: 'Yes! Branch settings let you restrict who can see that whole branch. All memories in it inherit the privacy.',
      },
      {
        question: 'If I share a memory, can I un-share it later?',
        answer: 'Yes, edit the memory and change visibility back to private. Family who saw it before can no longer see it.',
      },
      {
        question: 'Can people see that private memories exist?',
        answer: 'No. Private memories are completely invisible to others. They won\'t even see a count or hint that they exist.',
      },
    ],

    relatedGuides: [
      'branch-permissions-access-control',
      'memory-scheduling-future-release',
      'choosing-your-keepers',
    ],
  },

  'memory-scheduling-future-release': {
    slug: 'memory-scheduling-future-release',
    title: 'Memory Scheduling: Time-Released Stories',
    subtitle: 'Schedule memories for the future',
    icon: '⏰',
    category: 'CORE_FEATURES',

    overview: `Write memories today and schedule them to appear later - on a specific date, on someone's 18th birthday, or after you pass away. Time-released memories are your voice reaching across time.`,

    howItWorks: [
      {
        title: 'Create a Memory',
        content: 'Write your memory as usual, but before saving, click "Schedule for Later" instead of publishing immediately.',
      },
      {
        title: 'Choose Release Timing',
        content: 'Set a specific date ("Christmas 2030"), a person\'s milestone ("When grandson turns 18"), or a trigger event ("Upon my passing").',
      },
      {
        title: 'Memory Stays Hidden',
        content: 'The scheduled memory is invisible to everyone (even admins) until the release conditions are met. You can edit or cancel it anytime before release.',
      },
      {
        title: 'Automatic Release',
        content: 'On the scheduled date or event, the memory automatically appears in your tree. Recipients get a notification: "You have a new memory from [name]."',
      },
    ],

    useCases: [
      'Writing birthday messages for your children to open on future birthdays',
      'Creating graduation letters for grandchildren not yet born',
      'Scheduling memories to appear after you\'re gone',
      'Time-capsule memories ("Open this on our 50th anniversary")',
      'Seasonal stories that appear automatically each year',
      'Advice letters for milestone ages (13th birthday, 21st, etc.)',
    ],

    tips: [
      'Schedule birthday messages years in advance - your future self will thank you',
      'Write letters to young grandchildren to open when they\'re older',
      'Create scheduled memories on important anniversaries',
      'Include "how to open in case I forget" instructions',
      'Schedule fun surprises, not just heavy/emotional ones',
      'Test with a 1-day scheduled memory first to see how it works',
    ],

    faqs: [
      {
        question: 'Can I cancel a scheduled memory before it releases?',
        answer: 'Yes! Go to your scheduled memories list and click "Cancel Release" or "Edit" to change the timing.',
      },
      {
        question: 'What if I die before the scheduled release date?',
        answer: 'The memory still releases on schedule. Your Keepers can manage scheduled memories but can\'t see their content until release.',
      },
      {
        question: 'Can I schedule a memory for someone who isn\'t in the tree yet?',
        answer: 'Yes! Use conditional scheduling: "When a grandchild is born" or "When [person] joins the tree."',
      },
      {
        question: 'What happens if I forget I scheduled something?',
        answer: 'You\'ll get an email reminder 1 week before release. You can cancel or edit at that point.',
      },
      {
        question: 'Can scheduled memories include photos and audio?',
        answer: 'Yes! Full multimedia support. The whole memory is frozen and released exactly as you created it.',
      },
    ],

    relatedGuides: [
      'memory-visibility-privacy',
      'choosing-your-keepers',
      'firefly-bursts-memory-rediscovery',
    ],
  },

  'recording-voice-memories': {
    slug: 'recording-voice-memories',
    title: 'Recording Voice Memories',
    subtitle: 'Preserve the sound of your voice',
    icon: '🎙️',
    category: 'VOICE_AUDIO',

    overview: `Your voice carries emotion, tone, and personality that text can't capture. Record voice memories directly in Firefly Grove - tell stories out loud, interview family members, or narrate photo albums with your voice.`,

    howItWorks: [
      {
        title: 'Start Recording',
        content: 'Create a new memory and click the microphone icon. Grant browser permission to use your microphone (one-time setup).',
      },
      {
        title: 'Talk Naturally',
        content: 'Speak like you\'re talking to family - no need to be formal or scripted. Pause, laugh, start over if needed. It\'s your authentic voice that matters.',
      },
      {
        title: 'Auto-Transcription',
        content: 'Your voice is automatically transcribed to text so people can read or listen. The transcript is editable if the AI misses something.',
      },
      {
        title: 'Both Formats Saved',
        content: 'The audio file AND the text are both saved. Future generations can hear your voice or just read the words - their choice.',
      },
    ],

    useCases: [
      'Recording grandma\'s stories in her own voice',
      'Narrating old photo albums with context and emotion',
      'Creating audio letters for children to hear after you\'re gone',
      'Capturing accents and speech patterns that get lost in text',
      'Recording family recipes with verbal instructions',
      'Preserving the sound of laughter, tears, and emotion',
    ],

    tips: [
      'Use headphones or earbuds with a mic for better audio quality',
      'Record in a quiet room - background noise distracts from your voice',
      'Speak clearly but don\'t overthink it - natural beats perfect',
      'Start with short 1-2 minute recordings before attempting longer ones',
      'Edit the transcription to add names, dates, or context',
      'Mobile recording works great - record anywhere inspiration hits',
    ],

    faqs: [
      {
        question: 'What audio format is used? Will it last forever?',
        answer: 'We use standard formats (MP3/M4A) that will remain playable for decades. Plus we have migration plans for when formats change.',
      },
      {
        question: 'How long can a voice recording be?',
        answer: 'Up to 30 minutes per recording. For longer stories, break them into chapters as separate memories.',
      },
      {
        question: 'What if the transcription gets my words wrong?',
        answer: 'Edit the text after recording. The original audio stays perfect - you\'re just fixing the transcript for readability.',
      },
      {
        question: 'Can I record someone else (like interviewing grandpa)?',
        answer: 'Yes! With their permission. Record the interview, save it to their branch, and tag them as the speaker.',
      },
      {
        question: 'Does voice recording work on mobile?',
        answer: 'Yes! In fact, mobile is ideal for voice memories. The app makes it easy to record on the go.',
      },
    ],

    relatedGuides: [
      'audio-sparks-quick-capture',
      'story-sparks-writing-prompts',
      'memory-editing-enhancement',
    ],
  },

  'adding-photos-to-memories': {
    slug: 'adding-photos-to-memories',
    title: 'Adding Photos to Memories',
    subtitle: 'Enrich your stories with images',
    icon: '🖼️',
    category: 'PHOTOS_MEDIA',

    overview: `Photos bring memories to life. Add single photos, photo albums, or entire slideshows to any memory. Upload from your computer, phone, or hatch from your Nest. Photos + story = powerful legacy.`,

    howItWorks: [
      {
        title: 'Create or Edit a Memory',
        content: 'When writing a memory, click the photo icon to add images. You can upload from your device, choose from your Nest, or take a photo with your phone camera.',
      },
      {
        title: 'Upload Multiple Photos',
        content: 'Select one photo or dozens at once. They upload in the background while you keep writing. Drag to reorder photos in your preferred sequence.',
      },
      {
        title: 'Add Captions',
        content: 'Click any photo to add captions, identify people in the photo (facial tagging coming soon), or note the location and date.',
      },
      {
        title: 'Photos Display Beautifully',
        content: 'Single photos display large. Multiple photos become a carousel or gallery. Viewers can click to enlarge, zoom, or download.',
      },
    ],

    useCases: [
      'Adding photos to text stories for visual context',
      'Creating photo-only memories (pictures speak for themselves)',
      'Building photo albums of vacations, weddings, or family gatherings',
      'Digitizing old printed photos with written context',
      'Adding found photos to existing memories years later',
      'Creating visual timelines of kids growing up',
    ],

    tips: [
      'Add photos AFTER writing the story - easier to focus on one thing at a time',
      'Use the Nest to bulk-upload photos, then add them to memories',
      'Scan old photos at 300 DPI or higher for best preservation',
      'Include at least one photo per memory when possible - visual + text is powerful',
      'Tag photos with people\'s names in captions for future searchability',
      'Original quality photos are stored - we don\'t compress or degrade them',
    ],

    faqs: [
      {
        question: 'What photo formats are supported?',
        answer: 'JPG, PNG, HEIC (iPhone), GIF, and most common formats. RAW files too, though they\'re large.',
      },
      {
        question: 'Is there a limit to photos per memory?',
        answer: 'No per-memory limit. Your plan\'s overall storage limit applies, but you can add hundreds of photos to a single memory if needed.',
      },
      {
        question: 'What happens to photo quality? Do you compress them?',
        answer: 'We store originals at full quality. We create smaller versions for fast browsing, but originals are always available.',
      },
      {
        question: 'Can I download photos from memories later?',
        answer: 'Yes! Click any photo and select "Download Original". Or export entire memories with photos via Forever Kit.',
      },
      {
        question: 'What if I have photos but don\'t know the story behind them?',
        answer: 'Upload them anyway! Ask family to add context via replies. Better to preserve the photo now than lose it.',
      },
    ],

    relatedGuides: [
      'the-nest-bulk-photo-uploads',
      'memory-editing-enhancement',
      'mobile-photo-upload-camera-integration',
    ],
  },

}

/**
 * Get a knowledge article by slug
 */
export function getKnowledgeArticle(slug: string): KnowledgeArticle | null {
  return knowledgeArticles[slug] || null
}

/**
 * Get all knowledge article slugs
 */
export function getAllKnowledgeSlugs(): string[] {
  return Object.keys(knowledgeArticles)
}
