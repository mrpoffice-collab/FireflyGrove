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
