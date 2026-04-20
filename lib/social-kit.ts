export type SocialSlide = {
  eyebrow: string;
  title: string;
  body: string;
  footer?: string;
  imageSrc?: string;
  tone?: "brand" | "calm" | "warm" | "spotlight";
};

export type SocialPost = {
  slug: string;
  title: string;
  focus: string;
  caption: string;
  slides: SocialSlide[];
};

export const instagramHandle = "@theguidinglightconnect";

export const instagramPosts: SocialPost[] = [
  {
    slug: "welcome-to-guiding-light",
    title: "Welcome to Guiding Light",
    focus: "Brand introduction",
    caption:
      "Welcome to Guiding Light. We created this space for autistic people, parents, caregivers, and support teams who need real-life help that feels calm, clear, and connected. Here you can find trusted resources, inclusive events, honest community conversations, and support that meets you where you are. If you have been looking for a gentler place to begin, we hope this feels like a good first step. Visit theguidinglight.com to explore more. #GuidingLight #AutismSupport #AutismCommunity #Neurodiversity #ParentSupport #ActuallyAutistic",
    slides: [
      {
        eyebrow: "Guiding Light",
        title: "Where every journey connects.",
        body: "A calm support space for autistic people, families, caregivers, and trusted professionals.",
        footer: "@theguidinglightconnect",
        imageSrc: "/family/founder-mother-son-1.jpeg",
        tone: "brand",
      },
      {
        eyebrow: "What you will find",
        title: "Resources that feel easier to use.",
        body: "Browse therapy, education, outings, sensory support, grooming help, and everyday tools in one place.",
        tone: "calm",
      },
      {
        eyebrow: "Community",
        title: "Questions, wins, and real conversation belong here.",
        body: "Families and self-advocates can share support, ask for ideas, and feel less alone.",
        tone: "spotlight",
      },
      {
        eyebrow: "Trusted guidance",
        title: "Professional insight can sit beside lived experience.",
        body: "Guiding Light makes room for therapists, educators, and community voices together.",
        tone: "warm",
      },
      {
        eyebrow: "Start here",
        title: "Visit theguidinglight.com",
        body: "Explore resources, events, global voices, and everyday guidance designed to feel welcoming and useful.",
        footer: "Where Every Journey Connects",
        tone: "brand",
      },
    ],
  },
  {
    slug: "start-here-for-families",
    title: "Start Here for Families",
    focus: "Practical beginner path",
    caption:
      "If you are at the beginning of your autism journey, you do not have to figure out everything all at once. Start with the next right step: learn what support exists, save the resources that match your family, and keep coming back to what feels most helpful. Guiding Light was built to make that process feel calmer, not more overwhelming. Save this post for later and share it with someone who may need a softer place to begin. #AutismParenting #AutismResources #SpecialNeedsParenting #ABA #IEP #Homeschooling",
    slides: [
      {
        eyebrow: "Start here",
        title: "You do not have to do this all at once.",
        body: "One step at a time is still progress.",
        imageSrc: "/family/founder-mother-son-2.jpeg",
        tone: "warm",
      },
      {
        eyebrow: "Step 1",
        title: "Create a profile and name your priorities.",
        body: "Save what matters most now, whether that is school support, communication, sensory needs, or outings.",
        tone: "brand",
      },
      {
        eyebrow: "Step 2",
        title: "Open the guides that match daily life.",
        body: "Use the California guide, outings guide, and quick filters to move faster toward the support you need.",
        tone: "calm",
      },
      {
        eyebrow: "Step 3",
        title: "Lean on community, not just information.",
        body: "You deserve encouragement, lived experience, and people who understand the weight of the everyday.",
        tone: "spotlight",
      },
      {
        eyebrow: "Keep this close",
        title: "Come back when you need the next right step.",
        body: "Guiding Light is designed to be a guide, not one more overwhelming tab.",
        footer: "theguidinglight.com/resources",
        tone: "brand",
      },
    ],
  },
  {
    slug: "global-voices-and-belonging",
    title: "Global Voices and Belonging",
    focus: "Representation and inclusion",
    caption:
      "Autism does not look, sound, or get understood the same way everywhere. Guiding Light makes room for global voices, queer autistic communities, and creators whose lives help widen what support and belonging can look like. Representation matters because recognition matters. When more people are seen clearly, more people get supported sooner. Visit our Global Voices section to keep learning. #GlobalVoices #AutisticAdults #LGBTQIA #QueerAutistic #NeurodiversityAffirming #ActuallyAutistic",
    slides: [
      {
        eyebrow: "Global voices",
        title: "Autism is spoken about in many languages, but dignity is a shared need.",
        body: "Guiding Light highlights how the spectrum is named, understood, and supported across communities.",
        tone: "brand",
      },
      {
        eyebrow: "Queer and LGBTQIA+",
        title: "Belonging should not require leaving any part of yourself behind.",
        body: "Autistic queer communities deserve recognition, safety, and support that feels whole.",
        tone: "spotlight",
      },
      {
        eyebrow: "Creator perspectives",
        title: "Community voices help expand what support can look like.",
        body: "Creators and advocates bring language, visibility, humor, and lived experience that many families need to hear.",
        tone: "calm",
      },
      {
        eyebrow: "Why this matters",
        title: "Representation helps people get seen sooner and more fully.",
        body: "The more stories we honor, the less likely people are to feel invisible in their own journey.",
        tone: "warm",
      },
      {
        eyebrow: "Explore more",
        title: "Open Global Voices on Guiding Light.",
        body: "Learn from perspectives that center identity, care, and connection across the spectrum.",
        footer: "theguidinglight.com/global-voices",
        tone: "brand",
      },
    ],
  },
  {
    slug: "calmer-outings-and-everyday-support",
    title: "Calmer Outings and Everyday Support",
    focus: "Useful resource spotlight",
    caption:
      "Support is not only about school or therapy. It is also about haircuts, outings, nursing rooms, quiet spaces, sensory-friendly play, and tools that make everyday life feel more manageable. Guiding Light gathers those real-world helps in one place so families can spend less time searching and more time preparing for success. Save this if everyday support is what you need most right now. #SensoryFriendly #AutismOutings #DisabilityAccess #InclusivePlay #AutismTools #FamilySupport",
    slides: [
      {
        eyebrow: "Real life support",
        title: "The small everyday details matter too.",
        body: "Haircuts, play spaces, quiet rooms, and outing plans can change a whole day.",
        tone: "warm",
      },
      {
        eyebrow: "Theme parks and outings",
        title: "Access passes and quieter support should be easier to find.",
        body: "Guiding Light brings together Disneyland DAS, LEGOLAND support, maps, and calmer outing planning.",
        tone: "brand",
      },
      {
        eyebrow: "Haircuts and grooming",
        title: "Sensory-friendly grooming support belongs in the conversation.",
        body: "Families can find haircut guides, sensory-safe salons, and nearby grooming support links faster.",
        tone: "calm",
      },
      {
        eyebrow: "Tools that help",
        title: "AAC, fidgets, swings, visual supports, and play tools all have a place.",
        body: "Support can look like communication, regulation, movement, rest, or connection.",
        tone: "spotlight",
      },
      {
        eyebrow: "Open resources",
        title: "Find the links that help daily life feel more manageable.",
        body: "Use the quick filters on Guiding Light to get where you need to go faster.",
        footer: "theguidinglight.com/resources",
        tone: "brand",
      },
    ],
  },
  {
    slug: "community-events-and-trusted-guidance",
    title: "Community, Events, and Trusted Guidance",
    focus: "Why the platform matters",
    caption:
      "Guiding Light is not only a resource list. It is meant to be a place where support feels human. Families can find events, ask honest questions, hear from trusted professionals, and return to the resources they want to keep close. We want this to feel like guidance you can grow with. Follow along at @theguidinglightconnect and visit theguidinglight.com to explore the full space. #AutismEvents #AutismCommunity #ParentCommunity #SpecialEducation #TherapistSupport #GuidingLight",
    slides: [
      {
        eyebrow: "Community",
        title: "Questions and real-life advice deserve a caring place to land.",
        body: "Guiding Light gives families and self-advocates room to connect without the noise.",
        tone: "brand",
      },
      {
        eyebrow: "Events",
        title: "Helpful workshops and gatherings should be easier to spot.",
        body: "Find webinars, support groups, and autism-centered events without digging through scattered links.",
        tone: "calm",
      },
      {
        eyebrow: "Trusted professionals",
        title: "Guidance feels stronger when lived experience and professional support both matter.",
        body: "Verified professionals sit alongside families and autistic voices, not above them.",
        tone: "spotlight",
      },
      {
        eyebrow: "Safer spaces",
        title: "Privacy, reporting, and moderation help support stay respectful.",
        body: "Community care works best when people feel protected as well as welcomed.",
        tone: "warm",
      },
      {
        eyebrow: "Follow along",
        title: "Keep up with new resources and community highlights.",
        body: "Follow Guiding Light on Instagram and explore more on the site.",
        footer: "@theguidinglightconnect",
        tone: "brand",
      },
    ],
  },
];
