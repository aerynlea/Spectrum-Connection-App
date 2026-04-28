import type {
  AgeGroup,
  AppUser,
  CommunityPostRecord,
  EventRecord,
  GoalKey,
  ProfessionalRecord,
  ResourceRecord,
  UserRole,
} from "@/lib/app-types";
import { formatAgeGroup, formatGoal, formatRole } from "@/lib/formatters";
import { isRegionalMatch, matchesUserLocation } from "@/lib/location";

export type GuidedPathwayStep = {
  id: string;
  title: string;
  detail: string;
};

export type GuidedPathway = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  intro: string;
  audienceLabel: string;
  goals: GoalKey[];
  ageGroups: AgeGroup[];
  roles: UserRole[];
  keywordSet: string[];
  collectionHints: string[];
  helpfulWhen: string[];
  whatToPrepare: string[];
  questionsToAsk: string[];
  steps: GuidedPathwayStep[];
};

export type GuidedPathwayMatchBundle = {
  resources: ResourceRecord[];
  events: EventRecord[];
  professionals: ProfessionalRecord[];
  communityPosts: CommunityPostRecord[];
};

const GUIDED_PATHWAYS: GuidedPathway[] = [
  {
    slug: "new-diagnosis",
    eyebrow: "Start here",
    title: "We just got a diagnosis",
    summary:
      "A calmer first path for families figuring out evaluations, early support, school questions, and what to do next without carrying it all alone.",
    intro:
      "This pathway is built for the early days after a diagnosis or while you are moving from concern to action. It helps you ground yourself, gather what matters, and open the first few links that can actually move things forward.",
    audienceLabel: "Parents and caregivers in the first stage of support planning",
    goals: ["early-support", "caregiver-wellness", "education"],
    ageGroups: ["early-years", "school-age", "caregiver"],
    roles: ["parent-caregiver"],
    keywordSet: ["diagnosis", "early", "evaluation", "assessment", "family", "planning", "first steps"],
    collectionHints: ["Family Start Here", "School and Learning", "Family and Caregivers"],
    helpfulWhen: [
      "You just received a diagnosis and do not know what to do first.",
      "You are waiting on evaluations, therapy referrals, or next-step guidance.",
      "You need a calmer plan for early support and school questions.",
    ],
    whatToPrepare: [
      "Any diagnosis or evaluation paperwork you already have",
      "A short list of your biggest daily-life concerns right now",
      "Insurance information, referral notes, or provider names",
      "One notebook or note app for questions you do not want to lose",
    ],
    questionsToAsk: [
      "What support should happen now, and what can wait?",
      "Which evaluations, services, or referrals matter most first?",
      "What can we start doing at home while we wait?",
      "How should we prepare for school or early-intervention conversations?",
    ],
    steps: [
      {
        id: "ground",
        title: "Ground the first week",
        detail:
          "Choose one place to keep your diagnosis notes, key questions, and next steps so the information stops living in scattered tabs and texts.",
      },
      {
        id: "choose",
        title: "Open only the first few trusted links",
        detail:
          "Start with diagnosis and early-support resources that explain what happens next, rather than trying to read everything at once.",
      },
      {
        id: "reach-out",
        title: "Make one support connection",
        detail:
          "Pick one parent support, professional connection, or regional center resource to contact so support becomes real and not only theoretical.",
      },
    ],
  },
  {
    slug: "school-and-iep-support",
    eyebrow: "School support",
    title: "We need help with school or IEP support",
    summary:
      "A step-by-step path for families preparing for school meetings, IEPs, evaluations, accommodations, and a clearer school-home support picture.",
    intro:
      "This pathway helps when school support feels confusing, reactive, or too hard to prepare for. It brings together what to gather, what to ask, and which trusted resources to open first.",
    audienceLabel: "Families and support teams preparing for school meetings, IEPs, or accommodations",
    goals: ["education", "caregiver-wellness", "early-support"],
    ageGroups: ["school-age", "teen", "caregiver"],
    roles: ["parent-caregiver", "professional"],
    keywordSet: ["school", "iep", "education", "teacher", "classroom", "accommodation", "advocacy"],
    collectionHints: ["School and Learning", "Family and Caregivers", "Teen and Transition"],
    helpfulWhen: [
      "You need to prepare for an IEP or school evaluation meeting.",
      "You are trying to get clearer accommodations or communication from school.",
      "You want school support to feel more organized and less reactive.",
    ],
    whatToPrepare: [
      "Past evaluations, IEPs, or school reports",
      "Examples of the support needs you are seeing at home or school",
      "A short list of your highest-priority accommodations or questions",
      "Any emails or communication logs you may want to reference",
    ],
    questionsToAsk: [
      "What support can be documented clearly and measured over time?",
      "Which accommodations will be used daily, and who is responsible for them?",
      "How will progress be tracked and shared with us?",
      "What can we do at home to support the same goals?",
    ],
    steps: [
      {
        id: "gather",
        title: "Gather your school picture in one place",
        detail:
          "Pull evaluations, reports, work samples, and your own notes together so you can walk into meetings with a clearer picture and less pressure.",
      },
      {
        id: "prioritize",
        title: "Choose the top 2 or 3 school needs",
        detail:
          "Focus first on the supports that will make daily school life feel more manageable, rather than trying to solve every issue in one meeting.",
      },
      {
        id: "follow-up",
        title: "Plan your follow-through",
        detail:
          "Use this path to open advocacy support, family mentoring, and the next steps that help school communication stay easier after the meeting ends.",
      },
    ],
  },
  {
    slug: "daily-life-sensory-support",
    eyebrow: "Daily life",
    title: "We need sensory and daily-life support",
    summary:
      "A practical path for the small but important parts of life: regulation, communication tools, outings, haircuts, routines, and calmer everyday planning.",
    intro:
      "This pathway is for the support families often end up piecing together on their own. It keeps the focus on what makes everyday life feel more manageable, not just what sounds good on paper.",
    audienceLabel: "Families, self-advocates, and caregivers looking for everyday support that feels usable",
    goals: ["sensory-support", "social-growth", "caregiver-wellness"],
    ageGroups: ["early-years", "school-age", "teen", "adult", "caregiver"],
    roles: ["parent-caregiver", "self-advocate", "professional"],
    keywordSet: ["sensory", "regulation", "routine", "aac", "haircut", "outings", "support tools"],
    collectionHints: [
      "Daily Life and Sensory Support",
      "Haircuts and Grooming",
      "Communication, Play, and Learning",
      "Outings and Inclusive Fun",
    ],
    helpfulWhen: [
      "Transitions, routines, or regulation are making daily life feel heavier.",
      "You need tools for communication, sensory support, or outings.",
      "You want practical help for things like haircuts, grooming, or everyday planning.",
    ],
    whatToPrepare: [
      "A quick note about what is hardest right now",
      "What already helps, even a little",
      "Any communication tools, sensory tools, or routines you are already using",
      "One real-life situation you want to make easier this week",
    ],
    questionsToAsk: [
      "What helps regulate before the hard moment starts?",
      "Which tools are realistic for home, school, or outings?",
      "How can we make one daily task easier first?",
      "What support feels practical enough to keep using next week too?",
    ],
    steps: [
      {
        id: "name-it",
        title: "Name the one daily-life pressure point first",
        detail:
          "Choose the routine, outing, sensory need, or communication challenge that is taking the most energy right now.",
      },
      {
        id: "open-tools",
        title: "Open support tools that match real life",
        detail:
          "Use the path to pull forward sensory tools, communication supports, outing help, and haircut resources that are practical enough to actually use.",
      },
      {
        id: "test-one",
        title: "Test one calmer change this week",
        detail:
          "Try one tool, one routine shift, or one outing support plan instead of trying to rebuild the whole week all at once.",
      },
    ],
  },
  {
    slug: "caregiver-support-and-reset",
    eyebrow: "Caregiver care",
    title: "I need caregiver support right now",
    summary:
      "A gentler path for caregivers who need reassurance, community, practical relief, and support that remembers the caregiver matters too.",
    intro:
      "This pathway is for the moments when the caregiver needs support too. It gathers community reassurance, reset-worthy tools, and practical next steps so you do not have to push through alone.",
    audienceLabel: "Parents and caregivers who need support, steadier planning, and a place to land",
    goals: ["caregiver-wellness", "social-growth", "early-support"],
    ageGroups: ["caregiver", "early-years", "school-age", "teen", "adult"],
    roles: ["parent-caregiver"],
    keywordSet: ["caregiver", "family", "wellness", "support", "parent", "mentoring", "community"],
    collectionHints: ["Family and Caregivers", "Family Start Here", "Online Play and Community"],
    helpfulWhen: [
      "You feel like you are carrying too much alone.",
      "You need reassurance, community, or a more organized next step.",
      "You want support that remembers the caregiver matters too.",
    ],
    whatToPrepare: [
      "One honest note about what feels heaviest right now",
      "Any deadlines or appointments adding pressure this week",
      "A short list of the support you wish someone would help you hold",
      "An openness to choosing one small next step instead of fixing everything today",
    ],
    questionsToAsk: [
      "What support would lower the pressure most this week?",
      "Where can I hear from people who understand this stage?",
      "What can I stop carrying by myself?",
      "What does a more sustainable next week look like?",
    ],
    steps: [
      {
        id: "pause",
        title: "Pause long enough to name the real pressure",
        detail:
          "Start by naming what feels heaviest right now so the support you look for actually matches your life.",
      },
      {
        id: "connect",
        title: "Open one support that holds the caregiver too",
        detail:
          "Choose a parent resource, community conversation, or practical family support link that feels grounding, not just informative.",
      },
      {
        id: "lighten",
        title: "Pick one next step that lightens the load",
        detail:
          "Choose one action that helps the coming week feel easier, whether that is saving resources, planning one call, or opening caregiver support.",
      },
    ],
  },
];

function normalize(value: string) {
  return value.toLowerCase();
}

function getTextFromProfessional(professional: ProfessionalRecord) {
  return normalize(
    [
      professional.name,
      professional.title,
      professional.focus,
      professional.summary,
      professional.organization,
      professional.location,
    ].join(" "),
  );
}

function getTextFromEvent(event: EventRecord) {
  return normalize(
    [event.title, event.detail, event.audience, event.hostName, event.location].join(" "),
  );
}

function getTextFromResource(resource: ResourceRecord) {
  return normalize(
    [
      resource.title,
      resource.summary,
      resource.collectionName,
      resource.category,
      resource.audience,
      resource.organization,
    ].join(" "),
  );
}

function getTextFromCommunityPost(post: CommunityPostRecord) {
  return normalize([post.title, post.body, post.topic, post.tag, post.authorRole].join(" "));
}

function scorePathwayForUser(pathway: GuidedPathway, user: AppUser) {
  let score = 0;

  pathway.goals.forEach((goal) => {
    if (user.goals.includes(goal)) {
      score += 4;
    }
  });

  if (pathway.ageGroups.includes(user.ageGroup)) {
    score += 3;
  }

  if (pathway.roles.includes(user.role)) {
    score += 2;
  }

  return score;
}

function scoreKeywordMatch(pathway: GuidedPathway, text: string) {
  return pathway.keywordSet.reduce((score, keyword) => {
    return text.includes(keyword) ? score + 2 : score;
  }, 0);
}

function scoreCollectionHintMatch(pathway: GuidedPathway, value: string) {
  const text = normalize(value);
  return pathway.collectionHints.reduce((score, hint) => {
    return text.includes(normalize(hint)) ? score + 3 : score;
  }, 0);
}

export function listGuidedPathways() {
  return GUIDED_PATHWAYS;
}

export function getGuidedPathwayBySlug(slug: string) {
  return GUIDED_PATHWAYS.find((pathway) => pathway.slug === slug) ?? null;
}

export function getFeaturedGuidedPathways(user?: AppUser | null, limit = 3) {
  if (!user) {
    return GUIDED_PATHWAYS.slice(0, limit);
  }

  return [...GUIDED_PATHWAYS]
    .sort((left, right) => scorePathwayForUser(right, user) - scorePathwayForUser(left, user))
    .slice(0, limit);
}

export function buildGuidedPathwayAudienceSummary(pathway: GuidedPathway) {
  const roles = pathway.roles.map((role) => formatRole(role));
  const ageGroups = pathway.ageGroups.slice(0, 3).map((ageGroup) => formatAgeGroup(ageGroup));
  const goals = pathway.goals.slice(0, 3).map((goal) => formatGoal(goal));

  return {
    ageGroups,
    goals,
    roles,
  };
}

export function buildGuidedPathwayMatches(
  pathway: GuidedPathway,
  input: {
    communityPosts: CommunityPostRecord[];
    events: EventRecord[];
    professionals: ProfessionalRecord[];
    resources: ResourceRecord[];
    user?: AppUser | null;
  },
): GuidedPathwayMatchBundle {
  const { communityPosts, events, professionals, resources, user } = input;

  const rankedResources = resources
    .map((resource) => {
      let score = 0;
      const text = getTextFromResource(resource);

      score += scoreKeywordMatch(pathway, text);
      score += scoreCollectionHintMatch(
        pathway,
        `${resource.collectionName} ${resource.category}`,
      );

      resource.tags.forEach((goal) => {
        if (pathway.goals.includes(goal)) {
          score += 3;
        }
      });

      if (pathway.ageGroups.includes(resource.ageGroup as AgeGroup) || resource.ageGroup === "all") {
        score += 2;
      }

      if (resource.verified) {
        score += 1;
      }

      if (user) {
        if (isRegionalMatch(user.location, resource.regionTags)) {
          score += 3;
        } else if (matchesUserLocation(user.location, resource.regionTags)) {
          score += 1;
        }
      }

      return { resource, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item) => item.resource);

  const rankedEvents = events
    .map((event) => {
      let score = 0;
      const text = getTextFromEvent(event);
      score += scoreKeywordMatch(pathway, text);

      pathway.goals.forEach((goal) => {
        if (text.includes(goal.replace("-", " "))) {
          score += 2;
        }
      });

      if (user) {
        if (isRegionalMatch(user.location, event.regionTags)) {
          score += 3;
        } else if (matchesUserLocation(user.location, event.regionTags)) {
          score += 1;
        }
      }

      if (normalize(event.audience).includes("caregiver") && pathway.roles.includes("parent-caregiver")) {
        score += 2;
      }

      return { event, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.event);

  const rankedProfessionals = professionals
    .filter((professional) => !professional.isHidden)
    .map((professional) => {
      let score = 0;
      const text = getTextFromProfessional(professional);
      score += scoreKeywordMatch(pathway, text);

      pathway.goals.forEach((goal) => {
        if (text.includes(goal.replace("-", " "))) {
          score += 2;
        }
      });

      if (professional.acceptingNewFamilies) {
        score += 2;
      }

      if (professional.verificationStatus === "verified") {
        score += 2;
      }

      if (user) {
        if (isRegionalMatch(user.location, professional.regionTags)) {
          score += 3;
        } else if (matchesUserLocation(user.location, professional.regionTags)) {
          score += 1;
        }
      }

      return { professional, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.professional);

  const rankedCommunityPosts = communityPosts
    .filter((post) => !post.isHidden)
    .map((post) => {
      const text = getTextFromCommunityPost(post);
      let score = scoreKeywordMatch(pathway, text);

      pathway.goals.forEach((goal) => {
        if (text.includes(goal.replace("-", " "))) {
          score += 2;
        }
      });

      if (pathway.roles.includes("parent-caregiver") && normalize(post.authorRole).includes("parent")) {
        score += 2;
      }

      if (pathway.roles.includes("self-advocate") && normalize(post.authorRole).includes("self")) {
        score += 2;
      }

      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => item.post);

  return {
    communityPosts: rankedCommunityPosts,
    events: rankedEvents,
    professionals: rankedProfessionals,
    resources: rankedResources,
  };
}
