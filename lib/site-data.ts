export type FeatureCard = {
  label: string;
  title: string;
  description: string;
};

export type AgeTrack = {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
};

export type ResourceCollection = {
  title: string;
  summary: string;
  badges: string[];
  items: {
    title: string;
    detail: string;
  }[];
};

export type CommunityTopic = {
  title: string;
  description: string;
  moderators: string;
};

export type ThreadPreview = {
  author: string;
  role: string;
  time: string;
  title: string;
  excerpt: string;
  tag: string;
};

export type EventCard = {
  month: string;
  day: string;
  title: string;
  format: string;
  audience: string;
  detail: string;
};

export type ProfessionalRole = {
  title: string;
  focus: string;
  description: string;
};

export type ProfileQuote = {
  quote: string;
  author: string;
  role: string;
  href: string;
  sourceLabel: string;
};

export const founderStoryHighlights = [
  "Single motherhood and co-parenting",
  "Diagnosed at age 2 and a half",
  "Homeschooling journey",
  "ABA support early on",
  "A village of intentional therapists",
  "Connection and community",
];

export const audienceGroups = [
  "Parents and caregivers",
  "Self-advocates",
  "Teens and young adults",
  "Educators and therapists",
  "Community organizations",
];

export const featureCards: FeatureCard[] = [
  {
    label: "By Stage of Life",
    title: "Support can grow with your family.",
    description:
      "Find early support, school help, transition guidance, adult resources, and caregiver encouragement without sorting through what does not fit.",
  },
  {
    label: "Made for Your Needs",
    title: "Support feels easier to find when it fits real life.",
    description:
      "Search by age, goals, location, and day-to-day needs to find therapies, educational programs, and sensory-friendly options that feel relevant right now.",
  },
  {
    label: "Community Care",
    title: "Connection is part of every step.",
    description:
      "Topic-specific forums, local circles, and guided discussion prompts help families and self-advocates swap advice, celebrate wins, and reduce isolation.",
  },
  {
    label: "Events Near You",
    title: "Helpful gatherings are easier to spot.",
    description:
      "A location-aware event feed highlights webinars, support groups, therapy workshops, and inclusive community gatherings across every age group.",
  },
  {
    label: "Trusted Professional Guidance",
    title: "Expert support can sit beside lived experience.",
    description:
      "Therapists, educators, coaches, and providers are clearly identified so families know when advice comes from licensed or professional support.",
  },
  {
    label: "A Respectful Space",
    title: "Kindness and privacy stay at the center.",
    description:
      "Community guidelines, privacy choices, and clear moderation help people participate at a pace that feels comfortable and safe.",
  },
];

export const ageTracks: AgeTrack[] = [
  {
    title: "Early Years",
    subtitle: "Ages 0-5",
    description:
      "Find early intervention programs, communication support ideas, and family coaching without losing sight of joy and play.",
    highlights: ["Developmental screenings", "Therapy directories", "Daily routine ideas"],
  },
  {
    title: "School Age",
    subtitle: "Ages 6-12",
    description:
      "Keep IEP planning, classroom tools, sensory strategies, and inclusive extracurricular options in one calm, accessible place.",
    highlights: ["IEP preparation", "Sensory supports", "Social skill resources"],
  },
  {
    title: "Teen Years",
    subtitle: "Ages 13-17",
    description:
      "Support identity, friendships, self-advocacy, and transition planning with resources that speak to growing independence.",
    highlights: ["Self-advocacy tips", "Transition planning", "Peer group spaces"],
  },
  {
    title: "Adult Life",
    subtitle: "Ages 18+",
    description:
      "Access employment support, independent living resources, relationship guidance, and community opportunities that respect autonomy.",
    highlights: ["Career pathways", "Independent living", "Community programs"],
  },
  {
    title: "Family and Caregivers",
    subtitle: "Every stage",
    description:
      "Caregivers can find respite ideas, emotional support, and practical planning tools that make the long journey feel less lonely.",
    highlights: ["Support circles", "Respite planning", "Caregiver wellness"],
  },
];

export const resourceCollections: ResourceCollection[] = [
  {
    title: "Family Start Here",
    summary:
      "A gentle onboarding path for families who are newly exploring diagnosis, therapies, and school support.",
    badges: ["Early support", "Parent guides", "Local search"],
    items: [
      {
        title: "Early intervention finder",
        detail: "Search speech, occupational, behavioral, and developmental programs by distance, insurance, and wait time.",
      },
      {
        title: "First 90 days roadmap",
        detail: "A calming checklist that turns the first wave of appointments, forms, and follow-ups into manageable steps.",
      },
      {
        title: "Home routine library",
        detail: "Downloadable visual schedules, bedtime supports, meal-time ideas, and transition tools for daily life.",
      },
    ],
  },
  {
    title: "School and Learning",
    summary:
      "Tools that support classroom success, communication with educators, and inclusive learning experiences.",
    badges: ["Education", "Advocacy", "Executive function"],
    items: [
      {
        title: "IEP prep workspace",
        detail: "Store meeting notes, shared goals, and question prompts before parent-teacher meetings or eligibility reviews.",
      },
      {
        title: "Sensory-friendly classroom ideas",
        detail: "Explore seating, movement, lighting, and regulation strategies contributed by families and educators.",
      },
      {
        title: "After-school inclusion map",
        detail: "Browse clubs, arts programs, sports, and community spaces that welcome neurodivergent learners.",
      },
    ],
  },
  {
    title: "Teen and Transition",
    summary:
      "A dedicated path for social growth, identity, and the bridge into adulthood.",
    badges: ["Teens", "Transition", "Confidence"],
    items: [
      {
        title: "Self-advocacy kit",
        detail: "Conversation starters, accommodation request templates, and scripts for navigating school or healthcare settings.",
      },
      {
        title: "Social connection guides",
        detail: "Interest-led group recommendations and conversation-friendly activities that reduce pressure and build belonging.",
      },
      {
        title: "Transition planner",
        detail: "Track readiness for employment, college, transportation, and life-skills goals in one place.",
      },
    ],
  },
  {
    title: "Adult Independence",
    summary:
      "Resources centered on autonomy, dignity, and long-term support instead of one-size-fits-all advice.",
    badges: ["Adults", "Employment", "Housing"],
    items: [
      {
        title: "Career support hub",
        detail: "Find vocational coaching, interview preparation, workplace accommodation ideas, and inclusive employers.",
      },
      {
        title: "Independent living toolkit",
        detail: "Explore budgeting, transportation, meal planning, safety, and household routines through practical guides.",
      },
      {
        title: "Community life guide",
        detail: "Locate social clubs, volunteer openings, recreation spaces, and support programs built for adults on the spectrum.",
      },
    ],
  },
];

export const communityTopics: CommunityTopic[] = [
  {
    title: "Parent Support Forum",
    description:
      "Ask questions, share progress, and swap day-to-day strategies with families who understand the emotional reality behind the logistics.",
    moderators: "Guided by peer mentors and caregiver ambassadors",
  },
  {
    title: "Self-Advocate Voices",
    description:
      "A space where autistic teens and adults can discuss independence, identity, work, relationships, and everyday life on their own terms.",
    moderators: "Held with autistic community leaders",
  },
  {
    title: "Therapy and Education Exchange",
    description:
      "Compare programs, discuss school supports, and gather practical questions to bring into meetings with professionals.",
    moderators: "Supported by trusted therapists and educators",
  },
  {
    title: "Sensory and Lifestyle Tips",
    description:
      "Share routines, calming setups, product ideas, food strategies, and sensory-friendly activities that have made home life easier.",
    moderators: "Community-led with gentle moderation",
  },
];

export const threadPreviews: ThreadPreview[] = [
  {
    author: "Ryan S.",
    role: "Parent of a 9-year-old",
    time: "Today at 5:00 PM",
    title: "Does anyone have advice for managing sensory overload in tennis?",
    excerpt:
      "We want to keep the activity joyful, but the noise and transitions are getting tough. Would love strategies that helped your family.",
    tag: "Helpful Tips",
  },
  {
    author: "Maya L.",
    role: "Autistic college student",
    time: "Today at 1:30 PM",
    title: "Best ways to explain accommodation needs to a new professor",
    excerpt:
      "I want to advocate for myself clearly without feeling like I have to over-disclose. Curious what language has worked for others.",
    tag: "Self-Advocacy",
  },
  {
    author: "Jordan K.",
    role: "Occupational therapist",
    time: "Yesterday",
    title: "Small environment shifts that can lower after-school stress",
    excerpt:
      "A few calming transitions can make evenings easier. Sharing routines families have reported as especially practical and sustainable.",
    tag: "Verified Guidance",
  },
];

export const events: EventCard[] = [
  {
    month: "APR",
    day: "18",
    title: "Family Workshop: Building Sensory-Friendly Routines",
    format: "Hybrid",
    audience: "Parents and caregivers",
    detail:
      "An evening session with a therapist and parent mentor focused on reducing overload at home, during transitions, and in community settings.",
  },
  {
    month: "APR",
    day: "24",
    title: "Teen Social Lab: Interest-Led Conversation Club",
    format: "In person",
    audience: "Teens",
    detail:
      "A low-pressure meetup centered on games, shared interests, and confidence-building with neurodiversity-affirming facilitation.",
  },
  {
    month: "MAY",
    day: "02",
    title: "Adult Pathways Webinar: Employment and Accommodations",
    format: "Virtual",
    audience: "Adults on the spectrum",
    detail:
      "Learn how to approach interviews, request workplace support, and identify employers creating inclusive career pathways.",
  },
  {
    month: "MAY",
    day: "10",
    title: "Community Roundtable for Educators and Therapists",
    format: "Virtual",
    audience: "Professionals",
    detail:
      "A collaborative space to share trusted resources, coordinate referrals, and learn what families most need from service networks.",
  },
];

export const professionalRoles: ProfessionalRole[] = [
  {
    title: "Therapists",
    focus: "Intervention and regulation support",
    description:
      "Speech-language pathologists, occupational therapists, counselors, and behavior specialists can share practical guidance, workshops, and family-facing resources shaped by real practice.",
  },
  {
    title: "Educators",
    focus: "School success and inclusion",
    description:
      "Teachers, school psychologists, transition coordinators, and learning specialists can share classroom strategies, parent guidance, and school support that families can actually use.",
  },
  {
    title: "Coaches and mentors",
    focus: "Life skills, transition, and confidence",
    description:
      "Employment coaches, peer mentors, and community advocates can offer encouragement, practical guidance, and confidence-building support for teens and adults.",
  },
  {
    title: "Organizations",
    focus: "Programs and trusted referrals",
    description:
      "Clinics, nonprofits, and local service providers can share events, trusted referrals, and community support for families looking for their next step.",
  },
];

export const verificationSteps = [
  "Professionals share their credentials, specialties, and service areas.",
  "Listings that are still being checked are clearly marked so families know when review is still in progress.",
  "Guiding Light reviews licenses, affiliations, and public information before adding a verification badge.",
  "Verified professionals are clearly labeled so families know when guidance comes from a licensed provider.",
];

export const profileQuotes: ProfileQuote[] = [
  {
    quote: '"Autism is part of who I am."',
    author: "Temple Grandin",
    role: "Author and autism advocate",
    href: "https://www.autismspeaks.org/life-spectrum/autism-quotes",
    sourceLabel: "Source: Autism Speaks",
  },
  {
    quote:
      "\"If you’ve met one individual with autism, you’ve met one individual with autism.\"",
    author: "Stephen Shore",
    role: "Professor and autism advocate",
    href: "https://www.autismspeaks.org/life-spectrum/autism-quotes",
    sourceLabel: "Source: Autism Speaks",
  },
  {
    quote: "\"Autism can't define me. I define autism.\"",
    author: "Kerry Magro",
    role: "Autistic speaker and author",
    href: "https://www.autismspeaks.org/life-spectrum/autism-quotes",
    sourceLabel: "Source: Autism Speaks",
  },
];

export const safetyCommitments = [
  "Privacy-first profiles let users choose how much to share.",
  "Community agreements set expectations for respect, identity safety, and practical support.",
  "Clear reporting options make it easy to flag misinformation or harmful interactions.",
  "Verified guidance is clearly labeled so users can distinguish clinical advice from lived experience.",
];

export const reportReasonOptions = [
  "Misinformation or unsafe advice",
  "Unkind or harmful interaction",
  "Spam or self-promotion",
  "Privacy concern",
  "Something else",
] as const;
