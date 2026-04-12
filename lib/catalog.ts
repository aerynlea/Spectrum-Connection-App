import type {
  AgeGroup,
  GoalKey,
  ProfessionalRecord,
  UserRole,
} from "@/lib/app-types";

export const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "parent-caregiver", label: "Parent or caregiver" },
  { value: "self-advocate", label: "Autistic self-advocate" },
  { value: "professional", label: "Professional" },
];

export const ageGroupOptions: Array<{ value: AgeGroup; label: string }> = [
  { value: "early-years", label: "Early years (0-5)" },
  { value: "school-age", label: "School age (6-12)" },
  { value: "teen", label: "Teen years (13-17)" },
  { value: "adult", label: "Adult life (18+)" },
  { value: "caregiver", label: "Family and caregiver support" },
];

export const goalOptions: Array<{ value: GoalKey; label: string }> = [
  { value: "early-support", label: "Early support" },
  { value: "education", label: "Education and school planning" },
  { value: "sensory-support", label: "Sensory support" },
  { value: "social-growth", label: "Social growth and connection" },
  { value: "employment", label: "Employment" },
  { value: "independent-living", label: "Independent living" },
  { value: "caregiver-wellness", label: "Caregiver wellness" },
];

export const communityTopicOptions = [
  "Parent Support",
  "Self-Advocacy",
  "School and Therapy",
  "Sensory and Lifestyle",
  "Adult Independence",
] as const;

export const resourceSeeds: Array<{
  id: string;
  title: string;
  summary: string;
  collectionName: string;
  category: string;
  audience: string;
  ageGroup: AgeGroup | "all";
  tags: GoalKey[];
  locationScope: string;
  verified: boolean;
  organization: string;
  href: string;
}> = [
  {
    id: "early-intervention-finder",
    title: "Early Intervention Finder",
    summary:
      "Search speech, occupational, behavioral, and developmental support programs by distance, insurance, and wait time.",
    collectionName: "Family Start Here",
    category: "Therapies",
    audience: "Parents and caregivers",
    ageGroup: "early-years",
    tags: ["early-support", "sensory-support"],
    locationScope: "Local and regional",
    verified: true,
    organization: "Guiding Light Directory",
    href: "/resources",
  },
  {
    id: "first-90-days-roadmap",
    title: "First 90 Days Roadmap",
    summary:
      "A calming checklist for appointments, screening follow-ups, paperwork, and next-step planning after a new diagnosis.",
    collectionName: "Family Start Here",
    category: "Planning",
    audience: "Parents and caregivers",
    ageGroup: "early-years",
    tags: ["early-support", "caregiver-wellness"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Guiding Light Care Team",
    href: "/resources",
  },
  {
    id: "iep-prep-workspace",
    title: "IEP Prep Workspace",
    summary:
      "Store meeting notes, goals, and question prompts so school planning feels more organized and less overwhelming.",
    collectionName: "School and Learning",
    category: "Education",
    audience: "Parents, caregivers, and educators",
    ageGroup: "school-age",
    tags: ["education", "caregiver-wellness"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "School Success Lab",
    href: "/resources",
  },
  {
    id: "sensory-classroom-toolkit",
    title: "Sensory-Friendly Classroom Toolkit",
    summary:
      "Browse lighting, movement, seating, and regulation strategies contributed by therapists and experienced educators.",
    collectionName: "School and Learning",
    category: "Sensory",
    audience: "Families and educators",
    ageGroup: "school-age",
    tags: ["education", "sensory-support"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Inclusive Learning Collaborative",
    href: "/resources",
  },
  {
    id: "social-connection-guides",
    title: "Interest-Led Social Connection Guides",
    summary:
      "Find conversation-friendly activities, low-pressure meetups, and club ideas that center shared interests over performance.",
    collectionName: "Teen and Transition",
    category: "Community",
    audience: "Teens and young adults",
    ageGroup: "teen",
    tags: ["social-growth", "sensory-support"],
    locationScope: "Local and virtual",
    verified: false,
    organization: "Community Contributors",
    href: "/community",
  },
  {
    id: "self-advocacy-kit",
    title: "Self-Advocacy Kit",
    summary:
      "Use scripts, templates, and examples for school, healthcare, and everyday accommodation conversations.",
    collectionName: "Teen and Transition",
    category: "Advocacy",
    audience: "Teens and adults on the spectrum",
    ageGroup: "teen",
    tags: ["social-growth", "education", "employment"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autistic Voices Network",
    href: "/community",
  },
  {
    id: "career-support-hub",
    title: "Career Support Hub",
    summary:
      "Explore vocational coaching, interview prep, workplace accommodation ideas, and neuroinclusive employers.",
    collectionName: "Adult Independence",
    category: "Employment",
    audience: "Adults on the spectrum",
    ageGroup: "adult",
    tags: ["employment", "independent-living"],
    locationScope: "National with local partners",
    verified: true,
    organization: "Workplace Inclusion Project",
    href: "/professionals",
  },
  {
    id: "independent-living-toolkit",
    title: "Independent Living Toolkit",
    summary:
      "Practical guides for budgeting, meals, transportation, routines, and household organization.",
    collectionName: "Adult Independence",
    category: "Life skills",
    audience: "Adults on the spectrum",
    ageGroup: "adult",
    tags: ["independent-living", "sensory-support"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Guiding Light Adult Pathways",
    href: "/events",
  },
  {
    id: "caregiver-reset-plan",
    title: "Caregiver Reset Plan",
    summary:
      "Respite ideas, burnout check-ins, and planning tools that help caregivers protect their own wellbeing.",
    collectionName: "Family and Caregivers",
    category: "Wellbeing",
    audience: "Parents and caregivers",
    ageGroup: "caregiver",
    tags: ["caregiver-wellness", "social-growth"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Family Support Studio",
    href: "/community",
  },
  {
    id: "daily-routines-library",
    title: "Daily Routines Library",
    summary:
      "Downloadable visual schedules, transitions supports, bedtime ideas, and calm-start routines for home life.",
    collectionName: "Family Start Here",
    category: "Daily living",
    audience: "Families across age groups",
    ageGroup: "all",
    tags: ["early-support", "sensory-support", "caregiver-wellness"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Guiding Light Resource Library",
    href: "/resources",
  },
];

export const eventSeeds = [
  {
    id: "family-sensory-routines",
    title: "Family Workshop: Building Sensory-Friendly Routines",
    detail:
      "An evening session with a therapist and parent mentor focused on reducing overload at home and during transitions.",
    audience: "Parents and caregivers",
    format: "Hybrid",
    eventDate: "2026-04-18T18:00:00.000Z",
    hostName: "Guiding Light Care Team",
    location: "Portland, OR + online",
  },
  {
    id: "teen-social-lab",
    title: "Teen Social Lab: Interest-Led Conversation Club",
    detail:
      "A low-pressure meetup centered on games, shared interests, and confidence-building with neurodiversity-affirming facilitation.",
    audience: "Teens",
    format: "In person",
    eventDate: "2026-04-24T16:30:00.000Z",
    hostName: "Spectrum Youth Collective",
    location: "Seattle, WA",
  },
  {
    id: "adult-employment-webinar",
    title: "Adult Pathways Webinar: Employment and Accommodations",
    detail:
      "Learn how to approach interviews, request workplace support, and identify employers building inclusive career paths.",
    audience: "Adults on the spectrum",
    format: "Virtual",
    eventDate: "2026-05-02T19:00:00.000Z",
    hostName: "Workplace Inclusion Project",
    location: "Online",
  },
  {
    id: "educator-roundtable",
    title: "Community Roundtable for Educators and Therapists",
    detail:
      "Share trusted resources, coordinate referrals, and hear what families most need from their local support systems.",
    audience: "Professionals",
    format: "Virtual",
    eventDate: "2026-05-10T17:00:00.000Z",
    hostName: "Guiding Light Professional Network",
    location: "Online",
  },
];

export const professionalSeeds: ProfessionalRecord[] = [
  {
    id: "alicia-garner",
    name: "Alicia Garner",
    title: "Occupational Therapist",
    focus: "Regulation routines and sensory planning",
    organization: "Bright Path OT",
    location: "San Diego, CA",
    summary:
      "Supports children, teens, and caregivers with home routines, school transitions, and sensory-friendly strategies.",
    acceptingNewFamilies: true,
    verified: true,
  },
  {
    id: "cameron-lee",
    name: "Cameron Lee",
    title: "Transition and Employment Coach",
    focus: "Work readiness and independent living",
    organization: "Forward Together Coaching",
    location: "Remote + California",
    summary:
      "Helps autistic teens and adults build confidence around job exploration, interview practice, and daily-life planning.",
    acceptingNewFamilies: true,
    verified: true,
  },
  {
    id: "dr-maria-santos",
    name: "Dr. Maria Santos",
    title: "School Psychologist",
    focus: "IEP support and collaborative school planning",
    organization: "Inclusive Learning Collaborative",
    location: "Phoenix, AZ",
    summary:
      "Works with families and educators to create school supports that are practical, affirming, and easier to carry forward.",
    acceptingNewFamilies: false,
    verified: true,
  },
];

export const communityPostSeeds = [
  {
    id: "seed-post-1",
    authorName: "Ryan S.",
    authorRole: "Parent of a 9-year-old",
    topic: "Sensory and Lifestyle",
    tag: "Helpful Tips",
    title: "Does anyone have advice for managing sensory overload in tennis?",
    body:
      "We want to keep the activity joyful, but the noise and transitions are getting tough. Would love strategies that helped your family.",
    createdAt: "2026-04-12T17:00:00.000Z",
  },
  {
    id: "seed-post-2",
    authorName: "Maya L.",
    authorRole: "Autistic college student",
    topic: "Self-Advocacy",
    tag: "Self-Advocacy",
    title: "Best ways to explain accommodation needs to a new professor",
    body:
      "I want to advocate for myself clearly without feeling like I have to over-disclose. Curious what language has worked for others.",
    createdAt: "2026-04-12T13:30:00.000Z",
  },
  {
    id: "seed-post-3",
    authorName: "Jordan K.",
    authorRole: "Occupational therapist",
    topic: "School and Therapy",
    tag: "Verified Guidance",
    title: "Small environment shifts that can lower after-school stress",
    body:
      "A few calming transitions can make evenings easier. Sharing routines families have reported as especially practical and sustainable.",
    createdAt: "2026-04-11T18:15:00.000Z",
  },
];
