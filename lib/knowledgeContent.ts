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

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  'greeting-cards-memory-sharing': {
    slug: 'greeting-cards-memory-sharing',
    title: 'Greeting Cards: Share Memories Beautifully',
    subtitle: 'Turn memories into physical keepsakes',
    icon: '💌',
    category: 'PRODUCTS',

    overview: `Transform your favorite Firefly Grove memories into beautiful physical greeting cards. Perfect for birthdays, holidays, sympathy, or "just because" - share your family stories as tangible keepsakes that recipients can hold and treasure.`,

    howItWorks: [
      {
        title: 'Choose a Memory',
        content: 'Browse your tree and select a memory you want to share. Could be a photo memory, a written story, or a voice recording with an image.',
      },
      {
        title: 'Design Your Card',
        content: 'Choose from elegant card templates. The memory\'s photo becomes the front, your text becomes the inside message. Customize fonts, colors, and layout.',
      },
      {
        title: 'Add Personal Touch',
        content: 'Write a personal note, add a QR code linking to the digital memory, or include multiple photos as a collage. Preview before ordering.',
      },
      {
        title: 'Send Physical Card',
        content: 'We print on premium cardstock and mail directly to your recipient. Or have it shipped to you for hand-delivery. Includes envelope.',
      },
    ],

    useCases: [
      'Birthday cards featuring memories of the birthday person',
      'Sympathy cards with photos and stories of the deceased',
      'Holiday cards showcasing family memories from the year',
      'Thank you cards with meaningful family photos',
      'Anniversary cards with memories from your relationship',
      'Sharing grandparent stories with grandchildren via mail',
    ],

    tips: [
      'Use high-resolution photos (300+ DPI) for best print quality',
      'Keep text concise - cards have limited space',
      'Order a few days early for time-sensitive occasions',
      'Include QR code so recipients can see the full digital memory',
      'Batch order multiple cards for holidays to save on shipping',
      'Preview on mobile AND desktop before ordering',
    ],

    faqs: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping is 5-7 business days within the US. Rush shipping (2-3 days) available for additional cost. International shipping varies.',
      },
      {
        question: 'What size are the cards?',
        answer: 'Standard greeting card size: 5x7 inches folded. Premium cardstock, includes white envelope. Larger sizes available for special occasions.',
      },
      {
        question: 'Can I preview before the card ships?',
        answer: 'Yes! You\'ll see a digital proof and can make changes before we print. We won\'t print until you approve the final design.',
      },
      {
        question: 'What if the recipient doesn\'t have Firefly Grove?',
        answer: 'That\'s perfect! Cards work standalone. The QR code (optional) lets them view the digital memory without creating an account.',
      },
      {
        question: 'Can I order in bulk for holidays?',
        answer: 'Yes! Discounts available for 10+ cards. Great for sending year-end family updates or memorial service programs.',
      },
    ],

    relatedGuides: [
      'adding-photos-to-memories',
      'memory-book-pdf-compilation',
      'soundart-audio-wave-art',
    ],
  },

  'soundart-audio-wave-art': {
    slug: 'soundart-audio-wave-art',
    title: 'SoundArt: Turn Voice into Visual Beauty',
    subtitle: 'Transform audio memories into wall art',
    icon: '🎨',
    category: 'PRODUCTS',

    overview: `Turn voice recordings into stunning visual art. SoundArt creates beautiful waveform prints of your audio memories - see "I love you," a child\'s laugh, or grandma\'s voice as elegant artwork you can frame and display.`,

    howItWorks: [
      {
        title: 'Select an Audio Memory',
        content: 'Choose any memory with voice recording: an Audio Spark, voice memory, or audio from a video. Short clips (5-30 seconds) work best for visual clarity.',
      },
      {
        title: 'Customize the Design',
        content: 'Pick colors, background style, and layout. Add text overlay (like "Mom\'s Laugh" or the quote itself). Preview shows exactly how it will look.',
      },
      {
        title: 'Choose Size & Material',
        content: 'Available as canvas prints, framed posters, or metal prints. Sizes from 8x10 to 24x36. Select finish: matte, glossy, or metallic.',
      },
      {
        title: 'Order & Display',
        content: 'We print museum-quality artwork and ship ready to hang. Includes QR code you can scan to hear the original audio.',
      },
    ],

    useCases: [
      'Printing a loved one\'s voice who passed away',
      'Baby\'s first laugh or first words as nursery art',
      'Wedding vows turned into anniversary gift',
      '"I love you" from grandparent for grandchild\'s room',
      'Favorite song lyric sung by family member',
      'Memorial service keepsake with deceased\'s voice',
    ],

    tips: [
      'Shorter clips make cleaner, more striking waveforms',
      'Choose audio with clear emotional peaks (laughter, emphasis)',
      'Black and white designs are timeless and elegant',
      'Order a small print first to test before committing to large',
      'The QR code is subtle - great for scannable memories',
      'Clean up background noise before creating SoundArt',
    ],

    faqs: [
      {
        question: 'What if my audio has background noise?',
        answer: 'Some noise is fine - it becomes part of the waveform texture. For cleaner results, use our audio cleanup tool before creating SoundArt.',
      },
      {
        question: 'How do people hear the audio from the print?',
        answer: 'Each print includes a small QR code. Scan with any smartphone to hear the original audio. Code is discreet but accessible.',
      },
      {
        question: 'Can I use music or copyrighted audio?',
        answer: 'Only if you own rights or it\'s personal (family singing). No commercial music due to copyright. Original recordings work best anyway.',
      },
      {
        question: 'What\'s the difference between canvas and metal?',
        answer: 'Canvas is classic, warm, textured. Metal is modern, vibrant, durable. Both museum-quality. Canvas for traditional, metal for contemporary.',
      },
      {
        question: 'Can I edit the audio clip before making SoundArt?',
        answer: 'Yes! Trim to the perfect 10 seconds, adjust volume, or isolate just the laugh/quote you want visualized.',
      },
    ],

    relatedGuides: [
      'recording-voice-memories',
      'audio-sparks-quick-capture',
      'greeting-cards-memory-sharing',
    ],
  },

  'forever-kit-export-backup': {
    slug: 'forever-kit-export-backup',
    title: 'Forever Kit: Own Your Memories',
    subtitle: 'Export and backup everything you create',
    icon: '📦',
    category: 'PRODUCTS',

    overview: `Forever Kit gives you complete ownership. Export your entire tree - every memory, photo, audio, video - as downloadable files you can store anywhere. Your legacy, your data, forever accessible even without Firefly Grove.`,

    howItWorks: [
      {
        title: 'Request Your Forever Kit',
        content: 'Go to Settings > Forever Kit and click "Create Export". Choose full tree export or specific branches/date ranges.',
      },
      {
        title: 'We Package Everything',
        content: 'We compile all your memories into organized folders: photos in one folder, audio in another, PDFs of stories, etc. Can take a few hours for large trees.',
      },
      {
        title: 'Download Your Archive',
        content: 'Receive a download link (via email) to a ZIP file containing everything. Files organized logically, with index HTML for easy browsing.',
      },
      {
        title: 'Store Anywhere Forever',
        content: 'Save to external hard drive, cloud storage (Google Drive, Dropbox), or burn to DVD. Your memories are now portable and permanent.',
      },
    ],

    useCases: [
      'Creating local backups of your entire family history',
      'Giving copies to adult children as inheritance',
      'Migrating to a different platform in the future',
      'Ensuring memories survive even if Firefly Grove shuts down',
      'Archiving for estate planning and legal purposes',
      'Sharing complete family history with distant relatives',
    ],

    tips: [
      'Schedule annual Forever Kit exports as year-end ritual',
      'Store on multiple drives (3-2-1 backup rule)',
      'Include the Forever Kit in your will as digital asset',
      'Test opening the files before storing long-term',
      'Forever Kits include readable HTML - no special software needed',
      'Export before major life events (marriage, moving, etc.)',
    ],

    faqs: [
      {
        question: 'How big is the download? Will it fit on a flash drive?',
        answer: 'Depends on photos/videos. Average tree: 2-5GB. Large trees with videos: 20-50GB. We\'ll tell you size before you download.',
      },
      {
        question: 'What format are the files?',
        answer: 'Standard formats: JPG for photos, MP3/M4A for audio, MP4 for video, PDF for text. Plus HTML index you can open in any browser.',
      },
      {
        question: 'Can I re-import a Forever Kit into Firefly Grove later?',
        answer: 'Not currently, but coming soon. For now, Forever Kit is for backup/ownership, not migration between accounts.',
      },
      {
        question: 'Do private memories get included?',
        answer: 'Only YOUR private memories. You can\'t export other people\'s private content, even if you\'re admin.',
      },
      {
        question: 'How often should I create a Forever Kit?',
        answer: 'Annually is good. After major family events (reunions, deaths, births) is smart. We keep copies on our servers too, but redundancy is wise.',
      },
    ],

    relatedGuides: [
      'storage-limits-management',
      'import-features-migration',
      'choosing-your-keepers',
    ],
  },

  'memory-book-pdf-compilation': {
    slug: 'memory-book-pdf-compilation',
    title: 'Memory Book: Beautiful Printed Stories',
    subtitle: 'Compile memories into physical books',
    icon: '📖',
    category: 'PRODUCTS',

    overview: `Transform your digital memories into a beautiful printed book. Memory Books compile selected memories, photos, and stories into professionally bound keepsakes perfect for coffee tables, gifts, or preserving your complete family history.`,

    howItWorks: [
      {
        title: 'Select Memories to Include',
        content: 'Choose memories by branch, date range, or manually pick favorites. Can include text, photos, audio transcripts - everything becomes print-ready.',
      },
      {
        title: 'Customize Layout & Style',
        content: 'Choose book size (8x10, 11x14, etc.), cover design, paper quality, and layout style. Preview shows exactly how pages will look.',
      },
      {
        title: 'Review & Edit',
        content: 'We generate a PDF proof. Review every page, adjust photo placement, edit text. Make unlimited changes before printing.',
      },
      {
        title: 'Print & Bind',
        content: 'Professional printing on archival paper. Hardcover or softcover binding. Shipped in protective packaging. Additional copies available at discount.',
      },
    ],

    useCases: [
      'Creating family history books for each child',
      'Memorial books after a loved one passes',
      'Anniversary gifts compiling relationship memories',
      'Grandparent life story books for grandchildren',
      'Year-in-review books as annual tradition',
      'Legacy books to include in estate planning',
    ],

    tips: [
      'Start with 50-100 memories for a good-sized book',
      'Mix photo-heavy and text-heavy pages for variety',
      'Order multiple copies when printing - much cheaper than re-ordering',
      'Hardcover for heirlooms, softcover for personal copies',
      'Include a table of contents and index for navigation',
      'Test with a small book (25 memories) before committing to huge project',
    ],

    faqs: [
      {
        question: 'How many memories can fit in one book?',
        answer: 'Unlimited, but sweet spot is 50-200 memories. Fewer than 50 feels thin, more than 200 gets unwieldy. We can split into volumes.',
      },
      {
        question: 'Can I edit memories just for the book without changing the digital version?',
        answer: 'Yes! The book is a snapshot. Edit the book version without affecting your live Firefly Grove memories.',
      },
      {
        question: 'What if I have video or audio memories?',
        answer: 'Videos become photo stills with captions. Audio gets transcribed to text. QR codes can link to online versions.',
      },
      {
        question: 'How long does printing take?',
        answer: '2-3 weeks for standard printing. Rush service available (1 week) for extra cost. Proof review adds a few days.',
      },
      {
        question: 'Can I order more copies later?',
        answer: 'Yes, but re-printing is more expensive than ordering multiple copies initially. Order extras for siblings/cousins upfront.',
      },
    ],

    relatedGuides: [
      'forever-kit-export-backup',
      'greeting-cards-memory-sharing',
      'adding-photos-to-memories',
    ],
  },

  'spark-collections-prompt-organization': {
    slug: 'spark-collections-prompt-organization',
    title: 'Spark Collections: Organize Your Journey',
    subtitle: 'Curate themed writing prompts',
    icon: '✨',
    category: 'PRODUCTS',

    overview: `Spark Collections are themed sets of writing prompts organized around specific topics or life phases. Instead of random prompts, work through curated collections like "Childhood Memories," "Career Journey," or "Travel Stories" to systematically capture your life.`,

    howItWorks: [
      {
        title: 'Browse Collections',
        content: 'Explore pre-made collections like "First Year of Parenthood" or "Grandmother\'s Recipe Stories". Each collection has 10-50 related prompts.',
      },
      {
        title: 'Start a Collection',
        content: 'Begin any collection and work through prompts at your pace. Save progress - come back anytime. Collections track which prompts you\'ve completed.',
      },
      {
        title: 'Answer Prompts',
        content: 'Each prompt becomes a memory when you answer it. Write, record audio, or add photos. Prompts guide you through comprehensive storytelling.',
      },
      {
        title: 'Complete & Celebrate',
        content: 'Finishing a collection unlocks a completion certificate and creates a special "Collection Complete" memory showing all your stories together.',
      },
    ],

    useCases: [
      'Working through "Childhood Memories" collection with aging parent',
      'Completing "Our Love Story" collection for anniversary gift',
      'Using "Military Service" collection to document veteran experience',
      'Following "New Parent" collection as baby journal',
      'Tackling "Career Highlights" collection before retirement',
      'Creating custom collection for unique family tradition',
    ],

    tips: [
      'Do one prompt per week for sustainable progress',
      'Share collection progress with family for accountability',
      'Create custom collections for your family\'s unique experiences',
      'Gift a collection to family members ("Mom, do the Grandmother collection!")',
      'Some collections work great as interview guides',
      'Completed collections make excellent Memory Books',
    ],

    faqs: [
      {
        question: 'Can I create my own Spark Collections?',
        answer: 'Yes! Premium feature. Curate your own themed prompt sets for personal use or share with family.',
      },
      {
        question: 'Do I have to complete prompts in order?',
        answer: 'No! Skip around, cherry-pick favorites, or go sequentially. Whatever works for your creative process.',
      },
      {
        question: 'What happens if I abandon a collection halfway?',
        answer: 'Nothing! Progress saves automatically. Come back months later and pick up where you left off. No pressure.',
      },
      {
        question: 'Can multiple people work on the same collection?',
        answer: 'Yes! Great for families. Everyone answers the same prompts from their perspective. Creates rich multi-voice narratives.',
      },
      {
        question: 'How many collections should I work on at once?',
        answer: 'One or two max. Trying to juggle many creates overwhelm. Finish one, celebrate, then start another.',
      },
    ],

    relatedGuides: [
      'story-sparks-writing-prompts',
      'memory-book-pdf-compilation',
      'compass-intention-setting',
    ],
  },

  'treasure-chest-milestones': {
    slug: 'treasure-chest-milestones',
    title: 'Treasure Chest: Celebrate Milestones',
    subtitle: 'Track your memory preservation journey',
    icon: '🏆',
    category: 'PRODUCTS',

    overview: `Treasure Chest gamifies memory creation. Earn badges, unlock achievements, and reach milestones as you preserve your family's story. Turn the important work of legacy-building into a rewarding journey with visible progress.`,

    howItWorks: [
      {
        title: 'Complete Memory Activities',
        content: 'Every action earns points: creating memories, adding photos, inviting family, answering prompts. Points accumulate toward milestones.',
      },
      {
        title: 'Unlock Achievements',
        content: 'Hit milestones like "10 Memories Created," "First Audio Recording," "Invited Family Member." Each unlocks a badge and celebration.',
      },
      {
        title: 'Track Progress',
        content: 'Visit Treasure Chest to see all achievements, current streaks (days in a row creating memories), and progress toward next milestone.',
      },
      {
        title: 'Celebrate & Share',
        content: 'When you hit big milestones (100 memories!), we create a special memory commemorating it. Share achievements with family.',
      },
    ],

    useCases: [
      'Motivating yourself to build consistent memory-creation habit',
      'Gamifying memory preservation for kids/teens',
      'Celebrating progress milestones with family',
      'Setting goals ("I want to hit 50 memories by Dad\'s birthday")',
      'Tracking streaks for accountability',
      'Making memory work feel more like play',
    ],

    tips: [
      'Don\'t obsess over badges - focus on meaningful memories',
      'Use streak tracking for habit-building, not guilt',
      'Share milestone achievements in family group chats',
      'Set personal goals based on milestones',
      'Treasure Chest works great for New Year\'s resolutions',
      'Kids love badges - get them involved in family memory-making',
    ],

    faqs: [
      {
        question: 'What counts as a "memory" for milestones?',
        answer: 'Any saved entry: text memory, photo memory, audio spark, reply to another memory. Quality matters more than quantity.',
      },
      {
        question: 'If I break a streak, do I lose my progress?',
        answer: 'Streaks reset, but lifetime achievements stay forever. Breaking a 30-day streak doesn\'t erase those 30 memories.',
      },
      {
        question: 'Can I turn off Treasure Chest if I find it distracting?',
        answer: 'Yes! Settings > Treasure Chest > Disable. Some people love gamification, others prefer quiet focus. Both valid.',
      },
      {
        question: 'Do private memories count toward achievements?',
        answer: 'Yes! All memories count, public or private. Your achievements are personal.',
      },
      {
        question: 'Is there a leaderboard or competition?',
        answer: 'No. Treasure Chest is personal, not competitive. Family stories aren\'t a race.',
      },
    ],

    relatedGuides: [
      'spark-collections-prompt-organization',
      'compass-intention-setting',
      'audio-sparks-quick-capture',
    ],
  },

  'compass-intention-setting': {
    slug: 'compass-intention-setting',
    title: 'Compass: Set Your Memory Intentions',
    subtitle: 'Define your legacy goals and focus',
    icon: '🧭',
    category: 'PRODUCTS',

    overview: `Compass helps you set intentions for what you want to preserve and why. Instead of random memory-capturing, define your purpose: preserving grandparent stories, documenting a specific life phase, building a complete family history. Compass keeps you focused.`,

    howItWorks: [
      {
        title: 'Define Your Intention',
        content: 'Answer reflection questions: What stories matter most? Who are you preserving for? What themes want to capture? This creates your North Star.',
      },
      {
        title: 'Set Concrete Goals',
        content: 'Turn intentions into actionable goals: "Record 20 of Mom\'s childhood stories" or "Document our first year as parents." Specific beats vague.',
      },
      {
        title: 'Get Guided Prompts',
        content: 'Compass generates custom prompts aligned with your goals. Instead of generic prompts, you get suggestions that serve your specific intention.',
      },
      {
        title: 'Track Alignment',
        content: 'Compass shows which memories align with your intention. Stay on course or adjust your north star as life changes.',
      },
    ],

    useCases: [
      'Focusing on capturing a dying relative\'s stories before it\'s too late',
      'Documenting a specific life chapter (career, parenthood, illness)',
      'Building comprehensive family tree with intentional research',
      'Preserving specific traditions before they\'re lost',
      'Creating legacy for unborn grandchildren',
      'Processing grief through intentional remembrance',
    ],

    tips: [
      'Start with one clear intention, not five vague ones',
      'Revisit Compass quarterly - intentions evolve',
      'Share your intention with family - they can help',
      'Use Compass to avoid "analysis paralysis" - it cuts through decision fatigue',
      'Compass is especially powerful during major life transitions',
      'Pair Compass with Spark Collections for focused work',
    ],

    faqs: [
      {
        question: 'Can I have multiple intentions at once?',
        answer: 'Yes, but limit to 2-3. Too many creates scattered effort. Complete one intention before adding more.',
      },
      {
        question: 'What if my intention changes?',
        answer: 'Great! Edit your Compass anytime. Life changes, priorities shift. Your Compass should reflect current reality.',
      },
      {
        question: 'Is Compass required to use Firefly Grove?',
        answer: 'No! It\'s optional. Some people love intentional focus, others prefer organic capturing. Both approaches work.',
      },
      {
        question: 'Can family members see my Compass?',
        answer: 'Only if you share it. Compass is private by default. But sharing can help family contribute to your goals.',
      },
      {
        question: 'How is Compass different from Spark Collections?',
        answer: 'Compass = why and what (intention). Spark Collections = how (prompts). Use together: set intention, then use collections to execute.',
      },
    ],

    relatedGuides: [
      'spark-collections-prompt-organization',
      'story-sparks-writing-prompts',
      'treasure-chest-milestones',
    ],
  },

  // ============================================================================
  // ORGANIZATION FEATURES
  // ============================================================================

  'multiple-trees-organization': {
    slug: 'multiple-trees-organization',
    title: 'Multiple Trees: Organize by Life',
    subtitle: 'Create separate trees for different purposes',
    icon: '🌳',
    category: 'ORGANIZATION',

    overview: `Most families need just one tree. But sometimes separate trees make sense: one for birth family, one for married family, one for a deceased relative\'s legacy. Multiple trees keep different life spheres organized without mixing memories.`,

    howItWorks: [
      {
        title: 'Create a New Tree',
        content: 'Go to Grove > New Tree. Name it clearly ("Mom\'s Side," "Our Marriage," "Grandpa\'s WWII Stories"). Each tree is independent.',
      },
      {
        title: 'Add Members to Each Tree',
        content: 'Different people in different trees. Your spouse in marriage tree, siblings in birth family tree. Same person can be in multiple trees.',
      },
      {
        title: 'Switch Between Trees',
        content: 'Tree selector in header lets you switch contexts instantly. Each tree has its own branches, memories, and members.',
      },
      {
        title: 'Manage Separately',
        content: 'Each tree has independent settings, privacy rules, and heir designations. Keeps different purposes cleanly separated.',
      },
    ],

    useCases: [
      'Separating birth family from married family memories',
      'Creating dedicated tree for deceased parent as memorial',
      'Organizing by geography (US family vs overseas family)',
      'Keeping work/military service separate from personal life',
      'Building community trees for neighborhood or friend groups',
      'Maintaining multiple family lines without confusion',
    ],

    tips: [
      'Most people overestimate need for multiple trees - start with one',
      'Name trees clearly to avoid confusion when switching',
      'Use branches within one tree before creating second tree',
      'Multiple trees are great for co-parenting situations',
      'Consider privacy: some memories belong in separate trees',
      'You can transplant memories between trees later if needed',
    ],

    faqs: [
      {
        question: 'Is there a limit to how many trees I can create?',
        answer: 'Free: 1 tree. Paid plans: unlimited trees. Most families use 1-3 trees total.',
      },
      {
        question: 'Can I copy a memory from one tree to another?',
        answer: 'Yes! Duplicate any memory to different tree. Original stays put, copy appears in new tree. Edit independently.',
      },
      {
        question: 'Do all trees count toward my storage limit?',
        answer: 'Yes, storage limit is account-wide across all trees. But you can allocate differently per tree.',
      },
      {
        question: 'Can different trees have different Keepers/Heirs?',
        answer: 'Yes! Each tree has independent heir designation. Perfect for ensuring the right people get the right trees.',
      },
      {
        question: 'What if I regret creating multiple trees?',
        answer: 'You can merge trees by transplanting all memories/branches from one to another, then deleting the empty tree.',
      },
    ],

    relatedGuides: [
      'understanding-trees-and-branches',
      'transplanting-trees-grove-transfer',
      'branches-organization-strategies',
    ],
  },

  'branches-organization-strategies': {
    slug: 'branches-organization-strategies',
    title: 'Branch Organization: Structure Your Stories',
    subtitle: 'Best practices for organizing branches',
    icon: '🌿',
    category: 'ORGANIZATION',

    overview: `Branches organize your memories, but how should you structure them? By person? By theme? By time period? This guide shares proven strategies for organizing branches so your family can navigate memories easily, now and for generations.`,

    howItWorks: [
      {
        title: 'Choose Organization Strategy',
        content: 'Decide primary structure: by person (Mom, Dad, Kids), by theme (Holidays, Travel, Daily Life), by time (Decades, Life Phases), or hybrid.',
      },
      {
        title: 'Create Top-Level Branches',
        content: 'Start with 3-7 main branches matching your strategy. Don\'t over-organize initially - you can always add sub-branches later.',
      },
      {
        title: 'Add Sub-Branches as Needed',
        content: 'As memories accumulate, create sub-branches. "Travel" becomes "Beach Vacations" and "Mountain Trips." Let structure emerge organically.',
      },
      {
        title: 'Use Consistent Naming',
        content: 'Name branches clearly and consistently. "Childhood (1950-1960)" not just "Childhood." Future family will thank you.',
      },
    ],

    useCases: [
      'Organizing by person for multi-generational family trees',
      'Structuring by theme for topic-focused preservation',
      'Grouping by decade for chronological life stories',
      'Creating hybrid structures (Person > Theme > Time)',
      'Reorganizing existing chaotic branch structure',
      'Planning branch structure before inviting family',
    ],

    tips: [
      'Start simple - perfect is the enemy of done',
      'Mirror real-life relationships in branch structure',
      'Use branch descriptions to explain organization system',
      'Create "Unsorted" branch for quick captures, organize later',
      'Consistent structure across branches reduces confusion',
      'Ask family for input before finalizing structure',
    ],

    faqs: [
      {
        question: 'Can I change branch organization later?',
        answer: 'Yes! Move memories between branches, rename branches, restructure anytime. Nothing is permanent.',
      },
      {
        question: 'What\'s the "best" way to organize branches?',
        answer: 'Depends on your family. Small families: by theme. Large families: by person. No universal "best." What makes sense to YOUR family?',
      },
      {
        question: 'How deep should branch hierarchies go?',
        answer: '3 levels max is ideal. More than that becomes confusing to navigate. Broader is better than deeper.',
      },
      {
        question: 'Should I create a branch for each grandchild?',
        answer: 'Depends on family size. 3-5 grandkids: yes, individual branches. 15 grandkids: probably not. Use tags instead.',
      },
      {
        question: 'What if family disagrees on organization?',
        answer: 'Tree admin decides. Or use branch permissions to let different people organize their own branches their way.',
      },
    ],

    relatedGuides: [
      'understanding-trees-and-branches',
      'moving-memories-reorganization',
      'multiple-trees-organization',
    ],
  },

  'moving-memories-reorganization': {
    slug: 'moving-memories-reorganization',
    title: 'Moving Memories: Reorganize as You Grow',
    subtitle: 'Restructure without losing content',
    icon: '↔️',
    category: 'ORGANIZATION',

    overview: `As your tree grows, you\'ll want to reorganize. Move memories to better branches, merge branches, split large branches. Moving memories is safe and reversible - your content stays intact while structure improves.`,

    howItWorks: [
      {
        title: 'Select Memories to Move',
        content: 'From any branch, select one or multiple memories. Checkbox appears next to each memory. Select as many as needed.',
      },
      {
        title: 'Choose Destination',
        content: 'Click "Move" and select target branch. Can move to existing branch or create new branch during move process.',
      },
      {
        title: 'Memories Transfer',
        content: 'Memories disappear from old branch, appear in new branch. All comments, reactions, and metadata transfer intact.',
      },
      {
        title: 'History Preserved',
        content: 'Memories show "Moved from [old branch]" note for transparency. Everyone can see reorganization history.',
      },
    ],

    useCases: [
      'Reorganizing after tree structure evolves',
      'Moving all beach vacation photos from "Photos" to new "Beach Trips" branch',
      'Consolidating scattered memories about one person into dedicated branch',
      'Splitting an overcrowded "Memories" branch into themed sub-branches',
      'Fixing initial organization mistakes without starting over',
      'Preparing tree for new family members by reorganizing for clarity',
    ],

    tips: [
      'Move memories in batches to save time',
      'Tell family before major reorganizations so they aren\'t confused',
      'Use "Unsorted" branch as staging area during reorganization',
      'Preview destination branch before moving to avoid mistakes',
      'Moving doesn\'t break threaded replies - they stay connected',
      'Can\'t move someone else\'s memory without permission (unless admin)',
    ],

    faqs: [
      {
        question: 'Can I undo a move if I make a mistake?',
        answer: 'Yes! Move it back to original branch. The "moved from" history helps you track changes.',
      },
      {
        question: 'What happens to comments/reactions when moving?',
        answer: 'Everything stays attached to the memory. Moving changes location but preserves all content, engagement, and metadata.',
      },
      {
        question: 'Can I move someone else\'s memories?',
        answer: 'Only if you\'re tree admin or branch admin. Regular members can only move their own memories.',
      },
      {
        question: 'Does moving affect privacy settings?',
        answer: 'Memories inherit new branch\'s default privacy, but you can override. Check privacy after moving to new branch.',
      },
      {
        question: 'Can I move memories to a different tree?',
        answer: 'Use "transplanting" feature instead. Moving is within-tree only. Transplanting is cross-tree.',
      },
    ],

    relatedGuides: [
      'branches-organization-strategies',
      'transplanting-trees-grove-transfer',
      'branch-permissions-access-control',
    ],
  },

  'transplanting-trees-grove-transfer': {
    slug: 'transplanting-trees-grove-transfer',
    title: 'Transplanting Trees: Transfer Between Groves',
    subtitle: 'Move entire trees to different accounts',
    icon: '🚚',
    category: 'ORGANIZATION',

    overview: `Transplanting moves an entire tree from one account to another. Perfect for transferring deceased parent\'s tree to adult child, gifting a tree to grown kids, or consolidating multiple accounts. The tree moves completely, including all memories and members.`,

    howItWorks: [
      {
        title: 'Initiate Transplant',
        content: 'Go to Tree Settings > Transfer Tree. Enter recipient\'s email. They must have a Firefly Grove account (or will create one).',
      },
      {
        title: 'Recipient Accepts',
        content: 'Recipient receives email with transfer link. They review what\'s being transferred and accept or decline. No surprise transfers.',
      },
      {
        title: 'Tree Moves',
        content: 'Accepted transplant moves entire tree - memories, branches, members, settings - to recipient\'s account. Original owner loses access.',
      },
      {
        title: 'Permissions Adjust',
        content: 'Recipient becomes tree owner/admin. Previous owner becomes regular member (unless removed). All other members retain access.',
      },
    ],

    useCases: [
      'Transferring deceased parent\'s tree to adult child',
      'Giving children their childhood tree when they turn 18',
      'Consolidating multiple accounts into one',
      'Transferring ownership before moving to nursing home',
      'Gifting a curated tree to family member',
      'Estate planning: ensuring tree goes to right person',
    ],

    tips: [
      'Communicate with family before transplanting - it affects everyone',
      'Recipient should have storage capacity for the tree',
      'You can stay as member after transplanting if recipient allows',
      'Consider copying instead of moving if you want to keep access',
      'Transplanting triggers Keeper/Heir notifications',
      'Test with small tree before transplanting precious family history',
    ],

    faqs: [
      {
        question: 'Can I get the tree back if I change my mind?',
        answer: 'Only if new owner transplants it back to you. Transfers aren\'t automatically reversible. Choose wisely.',
      },
      {
        question: 'What happens to my subscription if I transfer my only tree?',
        answer: 'You keep your paid plan. Can create new trees or receive transplants. Or downgrade if you no longer need paid features.',
      },
      {
        question: 'Do all members transfer with the tree?',
        answer: 'Yes, all members retain access. Their relationship to tree stays same, just the owner changes.',
      },
      {
        question: 'Can I transfer just part of a tree?',
        answer: 'No. Transplanting is all-or-nothing. To move partial content, use memory copying or create new tree with selected content.',
      },
      {
        question: 'What about scheduled/private memories?',
        answer: 'Everything transfers including private and scheduled memories. New owner gets full access to all content.',
      },
    ],

    relatedGuides: [
      'multiple-trees-organization',
      'choosing-your-keepers',
      'legacy-transfer-immediate-handoff',
    ],
  },

  'rooting-trees-family-connections': {
    slug: 'rooting-trees-family-connections',
    title: 'Rooting Trees: Connect Family Heritage',
    subtitle: 'Link trees to show family relationships',
    icon: '🌲',
    category: 'ORGANIZATION',

    overview: `Rooting connects separate trees to show family relationships. Your tree, your parent\'s tree, your sibling\'s tree - all independent but visually connected. Build a forest that shows how individual family lines relate to the broader family history.`,

    howItWorks: [
      {
        title: 'Identify Connected Trees',
        content: 'Determine which trees should connect. Your tree connects to parent\'s tree (you\'re their child). Your tree connects to sibling\'s (shared parents).',
      },
      {
        title: 'Send Root Connection',
        content: 'From Tree Settings, click "Connect to Another Tree." Enter relationship type (parent, child, sibling) and select/invite the other tree.',
      },
      {
        title: 'Other Tree Accepts',
        content: 'Owner of other tree receives connection request. They can accept (connection forms) or decline (remains separate).',
      },
      {
        title: 'Navigate Between Trees',
        content: 'Connected trees show visual links. Click to jump between related trees. Helpful for seeing broader family context.',
      },
    ],

    useCases: [
      'Connecting your tree to parents\' tree showing family lineage',
      'Linking siblings\' independent trees under parents',
      'Building multi-generational family forest',
      'Showing adopted/blended family connections',
      'Creating visual family tree across multiple accounts',
      'Preserving extended family relationships for future generations',
    ],

    tips: [
      'Trees stay independent - rooting just shows relationships',
      'Connection requests need acceptance - respect boundaries',
      'Rooting doesn\'t share content, only shows how trees relate',
      'Great for complex family structures (divorce, remarriage, adoption)',
      'Visual representation helps kids understand family connections',
      'Rooting is metadata - doesn\'t affect privacy or access',
    ],

    faqs: [
      {
        question: 'Does rooting give the connected tree access to my memories?',
        answer: 'No! Rooting is visual only. Trees stay completely separate. No content sharing unless you explicitly invite them.',
      },
      {
        question: 'Can I disconnect trees later?',
        answer: 'Yes, either owner can break the connection anytime. Trees revert to independent, no content lost.',
      },
      {
        question: 'What if I root to someone who later deletes their tree?',
        answer: 'The connection disappears but your tree is unaffected. Rooting is non-destructive.',
      },
      {
        question: 'Can one tree have multiple roots (complex families)?',
        answer: 'Yes! Connect to biological parents, adoptive parents, step-parents. Rooting handles complex modern families.',
      },
      {
        question: 'Is rooting required to use Firefly Grove?',
        answer: 'No! It\'s optional. Useful for seeing big picture but not necessary. Single independent trees work great.',
      },
    ],

    relatedGuides: [
      'multiple-trees-organization',
      'transplanting-trees-grove-transfer',
      'inviting-family-members',
    ],
  },

  'open-grove-public-memorials': {
    slug: 'open-grove-public-memorials',
    title: 'Open Grove: Public Memorial Space',
    subtitle: 'Create public memorials anyone can view',
    icon: '🕊️',
    category: 'ORGANIZATION',

    overview: `Open Grove is for public memorials. Unlike private family trees, Open Grove memorials are searchable and viewable by anyone. Perfect for honoring public figures, community members, or creating memorial pages you want the world to see.`,

    howItWorks: [
      {
        title: 'Create Open Grove Memorial',
        content: 'Choose "Create Public Memorial" instead of private tree. These live in Open Grove, separate from private family trees.',
      },
      {
        title: 'Add Memorial Content',
        content: 'Add memories, photos, videos about the deceased. Write obituary, share stories, upload service information. Anyone can contribute (with moderation).',
      },
      {
        title: 'Memorial is Searchable',
        content: 'Open Grove memorials appear in search engines and Firefly Grove public directory. Anyone can find and view them.',
      },
      {
        title: 'Manage Contributions',
        content: 'As memorial creator, you moderate contributions. Approve/reject memories others submit. Keep memorial respectful and accurate.',
      },
    ],

    useCases: [
      'Creating public memorial for deceased loved one',
      'Honoring community members (teachers, coaches, veterans)',
      'Memorial pages for public figures',
      'Funeral home memorial pages',
      'Scholarship fund memorial pages',
      'Public remembrance for tragic events',
    ],

    tips: [
      'Open Grove for public tributes, private trees for family intimacy',
      'Moderate contributions carefully - public means anyone can see',
      'Link Open Grove memorial from obituary/funeral program',
      'Can have both: public Open Grove memorial AND private family tree',
      'Set contribution rules clearly in memorial description',
      'Open Grove is permanent - plan for long-term maintenance',
    ],

    faqs: [
      {
        question: 'Can I make an Open Grove memorial private later?',
        answer: 'Yes, but it\'s complicated. Easier to start private. Only make Open Grove if you\'re sure you want public visibility.',
      },
      {
        question: 'Who can add to Open Grove memorials?',
        answer: 'Anyone, but contributions go to moderation queue. You approve before they appear publicly. Prevents spam/abuse.',
      },
      {
        question: 'What if someone posts inappropriate content?',
        answer: 'You can reject it. Repeat offenders get blocked. We also monitor for ToS violations and remove abusive content.',
      },
      {
        question: 'Can Open Grove memorials have multiple admins?',
        answer: 'Yes! Useful for large memorials. Share moderation responsibilities with trusted family members.',
      },
      {
        question: 'Are Open Grove memorials free?',
        answer: 'Basic memorials yes. Premium features (unlimited photos, videos, custom domain) require paid plan.',
      },
    ],

    relatedGuides: [
      'memory-visibility-privacy',
      'approval-workflow-review-contributions',
      'inviting-family-members',
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
