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
  regionTags: string[];
}> = [
  {
    id: "taca-newly-diagnosed-autism-initiative",
    title: "TACA Newly Diagnosed Autism Initiative",
    summary:
      "A practical starting point for families preparing for early intervention, treatments, and next-step support after a new diagnosis.",
    collectionName: "Family Start Here",
    category: "New diagnosis",
    audience: "Parents and caregivers",
    ageGroup: "early-years",
    tags: ["early-support", "caregiver-wellness"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "The Autism Community in Action",
    href: "https://tacanow.org/resource/newly-diagnosed-autism-initiative/",
    regionTags: ["nationwide"],
  },
  {
    id: "autism-speaks-first-concern-to-action",
    title: "Autism Speaks First Concern to Action Tool Kit",
    summary:
      "A step-by-step guide for families who are worried about development and want help moving from concern to evaluation and action.",
    collectionName: "Family Start Here",
    category: "Planning",
    audience: "Parents and caregivers",
    ageGroup: "early-years",
    tags: ["early-support", "education"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autism Speaks",
    href: "https://www.autismspeaks.org/tool-kit/first-concern-action-tool-kit",
    regionTags: ["nationwide"],
  },
  {
    id: "autism-speaks-100-day-school-age-kit",
    title: "Autism Speaks 100 Day Kit for School Age Children",
    summary:
      "A guide for families of school-age children who want a clearer plan for school support, services, and what to do next.",
    collectionName: "School and Learning",
    category: "Education",
    audience: "Parents, caregivers, and educators",
    ageGroup: "school-age",
    tags: ["education", "caregiver-wellness", "early-support"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autism Speaks",
    href: "https://docs.autismspeaks.org/100-day-kit-school-age-children/introduction",
    regionTags: ["nationwide"],
  },
  {
    id: "family-focus-resource-center",
    title: "Family Focus Resource Center",
    summary:
      "Parent mentoring, IEP education, advocacy support, workshops, and family resource navigation for families across the Antelope Valley and surrounding communities.",
    collectionName: "School and Learning",
    category: "Family support",
    audience: "Parents, caregivers, and educators",
    ageGroup: "caregiver",
    tags: ["education", "caregiver-wellness", "social-growth"],
    locationScope: "Antelope Valley, San Fernando Valley, and Santa Clarita",
    verified: true,
    organization: "CSUN Family Focus Resource Center",
    href: "https://engage.csun.edu/colleges/education/fund-detail-family-focus-resource-center-",
    regionTags: [
      "antelope-valley",
      "los-angeles-county",
      "southern-california",
      "california",
    ],
  },
  {
    id: "nlacrc-partners-and-advocacy-groups",
    title: "NLACRC Partners and Advocacy Groups",
    summary:
      "A regional directory of support groups, advocacy organizations, and family connections hosted through North Los Angeles County Regional Center.",
    collectionName: "Family and Caregivers",
    category: "Community",
    audience: "Families, self-advocates, and caregivers",
    ageGroup: "all",
    tags: ["social-growth", "caregiver-wellness", "independent-living"],
    locationScope: "North Los Angeles County and Antelope Valley",
    verified: true,
    organization: "North Los Angeles County Regional Center",
    href: "https://www.nlacrc.org/get-involved/advocacy/partners-advocacy-groups/",
    regionTags: [
      "antelope-valley",
      "los-angeles-county",
      "southern-california",
      "california",
    ],
  },
  {
    id: "easterseals-southern-california-autism-services",
    title: "Easterseals Southern California Autism Services",
    summary:
      "Regional autism services that include family support, developmental services, and help connecting with programs across Southern California.",
    collectionName: "Family Start Here",
    category: "Therapies",
    audience: "Children, adults, and families",
    ageGroup: "all",
    tags: ["early-support", "sensory-support", "caregiver-wellness"],
    locationScope: "Southern California",
    verified: true,
    organization: "Easterseals Southern California",
    href: "https://www.easterseals.com/southerncal/support-and-education/autism/index-1.html",
    regionTags: ["southern-california", "orange-county", "california"],
  },
  {
    id: "autism-speaks-resource-guide",
    title: "Autism Speaks Resource Guide",
    summary:
      "A searchable directory for services, supports, and autism-related organizations by ZIP code, state, and service type.",
    collectionName: "Family and Caregivers",
    category: "Directory",
    audience: "Families, self-advocates, and professionals",
    ageGroup: "all",
    tags: ["early-support", "education", "social-growth", "independent-living"],
    locationScope: "Nationwide with local search",
    verified: true,
    organization: "Autism Speaks",
    href: "https://www.autismspeaks.org/resource-guide",
    regionTags: ["nationwide"],
  },
  {
    id: "autism-speaks-transition-tool-kit",
    title: "Autism Speaks Transition to Adulthood Tool Kit",
    summary:
      "Transition planning support for self-advocacy, employment, education, housing, healthcare, and community living.",
    collectionName: "Teen and Transition",
    category: "Transition planning",
    audience: "Teens, young adults, and families",
    ageGroup: "teen",
    tags: ["education", "employment", "independent-living", "social-growth"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autism Speaks",
    href: "https://www.autismspeaks.org/toolkit/transition-tool-kit",
    regionTags: ["nationwide"],
  },
  {
    id: "autism-speaks-employment-tool-kit",
    title: "Autism Speaks Employment Tool Kit",
    summary:
      "Employment planning support with guidance on career options, resumes, interviews, accommodations, and workplace rights.",
    collectionName: "Adult Independence",
    category: "Employment",
    audience: "Autistic adults and job seekers",
    ageGroup: "adult",
    tags: ["employment", "independent-living", "social-growth"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autism Speaks",
    href: "https://www.autismspeaks.org/tool-kit/employment-tool-kit",
    regionTags: ["nationwide"],
  },
  {
    id: "adult-autism-diagnosis-tool-kit",
    title: "Adult Autism Diagnosis Tool Kit",
    summary:
      "A guide created with autistic adults to help with diagnosis questions, next steps, legal rights, and supports in adulthood.",
    collectionName: "Adult Independence",
    category: "Adult support",
    audience: "Autistic adults and families",
    ageGroup: "adult",
    tags: ["independent-living", "social-growth", "employment"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autism Speaks",
    href: "https://www.autismspeaks.org/tool-kit/adult-autism-diagnosis-tool-kit",
    regionTags: ["nationwide"],
  },
  {
    id: "asan-autism-safety-toolkit",
    title: "ASAN Autism & Safety Toolkit",
    summary:
      "A self-advocate-created resource covering safety, community inclusion, autonomy, bullying, mental health, and support for families.",
    collectionName: "Adult Independence",
    category: "Self-advocacy",
    audience: "Autistic people, families, and supporters",
    ageGroup: "adult",
    tags: ["independent-living", "social-growth", "caregiver-wellness"],
    locationScope: "Available nationwide",
    verified: true,
    organization: "Autistic Self Advocacy Network",
    href: "https://autisticadvocacy.org/policy/toolkits/safety/",
    regionTags: ["nationwide"],
  },
];

export const eventSeeds = [
  {
    id: "jump-4-autism-2026",
    title: "Jump 4 Autism",
    detail:
      "A Southern California family event with jumping, climbing, arts and crafts, and time to connect with other autism families.",
    audience: "Parents, caregivers, and children",
    format: "In person",
    eventDate: "2026-04-18T09:00:00-07:00",
    hostName: "The Autism Community in Action",
    location: "Sky Zone, Santa Ana, California",
    href: "https://tacanow.org/what-we-do/socal-outreach/",
    regionTags: ["orange-county", "southern-california", "california"],
  },
  {
    id: "taca-virtual-support-teens-and-adults-2026",
    title: "Virtual Support Event - Teens and Adults",
    detail:
      "A one-hour Zoom support event for parents and caregivers of teens or adults with autism who want guidance, shared problem-solving, and community.",
    audience: "Parents and caregivers of teens and adults",
    format: "Virtual",
    eventDate: "2026-04-29T16:00:00-07:00",
    hostName: "The Autism Community in Action",
    location: "Online via Zoom",
    href: "https://tacanow.org/monthly-learning-series-gi-issues/",
    regionTags: ["virtual", "nationwide"],
  },
  {
    id: "seesaw-connect-2026",
    title: "Seesaw Connect",
    detail:
      "A casual coffee meet-up for parents and caregivers to swap resources, share stories, and build local encouragement.",
    audience: "Parents and caregivers",
    format: "In person",
    eventDate: "2026-04-30T10:00:00-07:00",
    hostName: "The Autism Community in Action",
    location: "Seesaw Beans and Coffee, Buena Park, California",
    href: "https://tacanow.org/event/seesaw-connect-013024/",
    regionTags: ["orange-county", "southern-california", "california"],
  },
  {
    id: "nlacrc-self-determination-orientation-2026",
    title: "Self-Determination Orientation",
    detail:
      "An orientation for people who want to learn more about California's Self-Determination Program and how it can support more individualized planning.",
    audience: "Adults, families, and self-advocates",
    format: "Virtual",
    eventDate: "2026-05-04T13:00:00-07:00",
    hostName: "North Los Angeles County Regional Center",
    location: "Online",
    href: "https://www.nlacrc.org/calendar/self-determination-orientation-18/",
    regionTags: ["virtual", "antelope-valley", "los-angeles-county", "california"],
  },
  {
    id: "nlacrc-rainbow-connection-2026",
    title: "Rainbow Connection Social Group",
    detail:
      "A recurring Zoom social group listed by NLACRC for connection, conversation, and community building.",
    audience: "Autistic adults and community members",
    format: "Virtual",
    eventDate: "2026-05-19T18:30:00-07:00",
    hostName: "North Los Angeles County Regional Center",
    location: "Online",
    href: "https://www.nlacrc.org/calendar/rainbow-connection-social-group-12/2026-08-18/",
    regionTags: ["virtual", "los-angeles-county", "california"],
  },
  {
    id: "community-navigator-meet-and-greet",
    title: "Community Navigator Meet and Greet",
    detail:
      "Meet regional community navigators and get help with IHSS, Medi-Cal, regional center services, and local resources in the Antelope Valley.",
    audience: "Families and caregivers",
    format: "In person",
    eventDate: "2026-09-11T10:00:00-07:00",
    hostName: "Family Focus Resource Center and NLACRC",
    location: "Ohana Center, Palmdale, California",
    href: "https://www.nlacrc.org/calendar/%F0%9F%8C%9F-community-navigator-meet-greet-%F0%9F%8C%9F-hosted-by-family-focus-resource-center/",
    regionTags: ["antelope-valley", "los-angeles-county", "southern-california", "california"],
  },
];

export const professionalSeeds: ProfessionalRecord[] = [
  {
    id: "family-focus-resource-center-provider",
    name: "Family Focus Resource Center",
    title: "Family resource and empowerment center",
    focus: "Parent mentoring, IEP support, family workshops, and navigation",
    organization: "CSUN Family Focus Resource Center",
    location: "Antelope Valley, San Fernando Valley, and Santa Clarita, California",
    summary:
      "Supports families with special education guidance, workshops, support groups, and practical navigation help across several Los Angeles County regions.",
    acceptingNewFamilies: true,
    verified: true,
    href: "https://www.californiafamilyempowermentcenters.org/spotlight-FamilyFocus.html",
    regionTags: [
      "antelope-valley",
      "los-angeles-county",
      "southern-california",
      "california",
    ],
  },
  {
    id: "easterseals-socal-provider",
    name: "Easterseals Southern California Autism Services",
    title: "Regional autism service provider",
    focus: "Family services, developmental supports, and autism programming",
    organization: "Easterseals Southern California",
    location: "Southern California",
    summary:
      "Provides autism-related services, family support, and broader disability programs across Southern California.",
    acceptingNewFamilies: true,
    verified: true,
    href: "https://www.easterseals.com/southerncal/support-and-education/autism/index-1.html",
    regionTags: ["southern-california", "orange-county", "california"],
  },
  {
    id: "nlacrc-community-support-provider",
    name: "North Los Angeles County Regional Center",
    title: "Regional center support and advocacy hub",
    focus: "Support groups, community partnerships, and service navigation",
    organization: "North Los Angeles County Regional Center",
    location: "North Los Angeles County and Antelope Valley, California",
    summary:
      "Helps families and self-advocates connect with support groups, advocacy partners, and regional service pathways.",
    acceptingNewFamilies: true,
    verified: true,
    href: "https://www.nlacrc.org/get-involved/advocacy/partners-advocacy-groups/",
    regionTags: [
      "antelope-valley",
      "los-angeles-county",
      "southern-california",
      "california",
    ],
  },
  {
    id: "autism-speaks-art-provider",
    name: "Autism Speaks Autism Response Team",
    title: "National information and navigation support",
    focus: "Resource matching, tool kits, and next-step guidance",
    organization: "Autism Speaks",
    location: "Nationwide",
    summary:
      "Connects autistic people, families, and caregivers with information, resources, and support options across the United States.",
    acceptingNewFamilies: true,
    verified: true,
    href: "https://www.autismspeaks.org/family-services",
    regionTags: ["nationwide"],
  },
  {
    id: "taca-family-support-provider",
    name: "The Autism Community in Action",
    title: "Parent support and education network",
    focus: "Parent mentorship, support events, and practical autism education",
    organization: "The Autism Community in Action",
    location: "Nationwide with Southern California events",
    summary:
      "Offers family support events, webinars, and parent-focused resources designed to reduce isolation and strengthen confidence.",
    acceptingNewFamilies: true,
    verified: true,
    href: "https://tacanow.org/way-to-help/be-a-member/",
    regionTags: ["nationwide", "southern-california", "california"],
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
