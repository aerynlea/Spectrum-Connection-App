from __future__ import annotations

from csv import DictWriter
from pathlib import Path
from typing import Dict, List
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = PROJECT_ROOT / "deliverables" / "instagram-launch-kit"
POSTS_ROOT = OUTPUT_ROOT / "posts"
HIGHLIGHTS_ROOT = OUTPUT_ROOT / "story-highlights"
REELS_ROOT = OUTPUT_ROOT / "reel-covers"
CALENDAR_ROOT = OUTPUT_ROOT / "launch-calendar"
PUBLIC_ROOT = PROJECT_ROOT / "public"
INSTAGRAM_HANDLE = "@theguidinglightconnect"
SITE_URL = "theguidinglight.com"

TITLE_FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
BODY_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"

WIDTH = 1080
HEIGHT = 1350
VERTICAL_WIDTH = 1080
VERTICAL_HEIGHT = 1920

POSTS: List[Dict] = [
    {
        "slug": "post-01-welcome-to-guiding-light",
        "title": "Welcome to Guiding Light",
        "caption": "Welcome to Guiding Light. We created this space for autistic people, parents, caregivers, and support teams who need real-life help that feels calm, clear, and connected. Here you can find trusted resources, inclusive events, honest community conversations, and support that meets you where you are. If you have been looking for a gentler place to begin, we hope this feels like a good first step. Visit theguidinglight.com to explore more. #GuidingLight #AutismSupport #AutismCommunity #Neurodiversity #ParentSupport #ActuallyAutistic",
        "slides": [
            {
                "eyebrow": "Guiding Light",
                "title": "Where every journey connects.",
                "body": "A calm support space for autistic people, families, caregivers, and trusted professionals.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-1.jpeg",
                "tone": "brand",
            },
            {
                "eyebrow": "What you will find",
                "title": "Resources that feel easier to use.",
                "body": "Browse therapy, education, outings, sensory support, grooming help, and everyday tools in one place.",
                "tone": "calm",
            },
            {
                "eyebrow": "Community",
                "title": "Questions, wins, and real conversation belong here.",
                "body": "Families and self-advocates can share support, ask for ideas, and feel less alone.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Trusted guidance",
                "title": "Professional insight can sit beside lived experience.",
                "body": "Guiding Light makes room for therapists, educators, and community voices together.",
                "tone": "warm",
            },
            {
                "eyebrow": "Start here",
                "title": "Visit theguidinglight.com",
                "body": "Explore resources, events, global voices, and everyday guidance designed to feel welcoming and useful.",
                "footer": "Where Every Journey Connects",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-02-start-here-for-families",
        "title": "Start Here for Families",
        "caption": "If you are at the beginning of your autism journey, you do not have to figure out everything all at once. Start with the next right step: learn what support exists, save the resources that match your family, and keep coming back to what feels most helpful. Guiding Light was built to make that process feel calmer, not more overwhelming. Save this post for later and share it with someone who may need a softer place to begin. #AutismParenting #AutismResources #SpecialNeedsParenting #ABA #IEP #Homeschooling",
        "slides": [
            {
                "eyebrow": "Start here",
                "title": "You do not have to do this all at once.",
                "body": "One step at a time is still progress.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-2.jpeg",
                "tone": "warm",
            },
            {
                "eyebrow": "Step 1",
                "title": "Create a profile and name your priorities.",
                "body": "Save what matters most now, whether that is school support, communication, sensory needs, or outings.",
                "tone": "brand",
            },
            {
                "eyebrow": "Step 2",
                "title": "Open the guides that match daily life.",
                "body": "Use the California guide, outings guide, and quick filters to move faster toward the support you need.",
                "tone": "calm",
            },
            {
                "eyebrow": "Step 3",
                "title": "Lean on community, not just information.",
                "body": "You deserve encouragement, lived experience, and people who understand the weight of the everyday.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Keep this close",
                "title": "Come back when you need the next right step.",
                "body": "Guiding Light is designed to be a guide, not one more overwhelming tab.",
                "footer": "theguidinglight.com/resources",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-03-global-voices-and-belonging",
        "title": "Global Voices and Belonging",
        "caption": "Autism does not look, sound, or get understood the same way everywhere. Guiding Light makes room for global voices, queer autistic communities, and creators whose lives help widen what support and belonging can look like. Representation matters because recognition matters. When more people are seen clearly, more people get supported sooner. Visit our Global Voices section to keep learning. #GlobalVoices #AutisticAdults #LGBTQIA #QueerAutistic #NeurodiversityAffirming #ActuallyAutistic",
        "slides": [
            {
                "eyebrow": "Global voices",
                "title": "Autism is spoken about in many languages, but dignity is a shared need.",
                "body": "Guiding Light highlights how the spectrum is named, understood, and supported across communities.",
                "tone": "brand",
            },
            {
                "eyebrow": "Queer and LGBTQIA+",
                "title": "Belonging should not require leaving any part of yourself behind.",
                "body": "Autistic queer communities deserve recognition, safety, and support that feels whole.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Creator perspectives",
                "title": "Community voices help expand what support can look like.",
                "body": "Creators and advocates bring language, visibility, humor, and lived experience that many families need to hear.",
                "tone": "calm",
            },
            {
                "eyebrow": "Why this matters",
                "title": "Representation helps people get seen sooner and more fully.",
                "body": "The more stories we honor, the less likely people are to feel invisible in their own journey.",
                "tone": "warm",
            },
            {
                "eyebrow": "Explore more",
                "title": "Open Global Voices on Guiding Light.",
                "body": "Learn from perspectives that center identity, care, and connection across the spectrum.",
                "footer": "theguidinglight.com/global-voices",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-04-calmer-outings-and-everyday-support",
        "title": "Calmer Outings and Everyday Support",
        "caption": "Support is not only about school or therapy. It is also about haircuts, outings, nursing rooms, quiet spaces, sensory-friendly play, and tools that make everyday life feel more manageable. Guiding Light gathers those real-world helps in one place so families can spend less time searching and more time preparing for success. Save this if everyday support is what you need most right now. #SensoryFriendly #AutismOutings #DisabilityAccess #InclusivePlay #AutismTools #FamilySupport",
        "slides": [
            {
                "eyebrow": "Real life support",
                "title": "The small everyday details matter too.",
                "body": "Haircuts, play spaces, quiet rooms, and outing plans can change a whole day.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-son-portrait-1.jpeg",
                "tone": "warm",
            },
            {
                "eyebrow": "Theme parks and outings",
                "title": "Access passes and quieter support should be easier to find.",
                "body": "Guiding Light brings together Disneyland DAS, LEGOLAND support, maps, and calmer outing planning.",
                "tone": "brand",
            },
            {
                "eyebrow": "Haircuts and grooming",
                "title": "Sensory-friendly grooming support belongs in the conversation.",
                "body": "Families can find haircut guides, sensory-safe salons, and nearby grooming support links faster.",
                "tone": "calm",
            },
            {
                "eyebrow": "Tools that help",
                "title": "AAC, fidgets, swings, visual supports, and play tools all have a place.",
                "body": "Support can look like communication, regulation, movement, rest, or connection.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Open resources",
                "title": "Find the links that help daily life feel more manageable.",
                "body": "Use the quick filters on Guiding Light to get where you need to go faster.",
                "footer": "theguidinglight.com/resources",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-05-community-events-and-trusted-guidance",
        "title": "Community, Events, and Trusted Guidance",
        "caption": "Guiding Light is not only a resource list. It is meant to be a place where support feels human. Families can find events, ask honest questions, hear from trusted professionals, and return to the resources they want to keep close. We want this to feel like guidance you can grow with. Follow along at @theguidinglightconnect and visit theguidinglight.com to explore the full space. #AutismEvents #AutismCommunity #ParentCommunity #SpecialEducation #TherapistSupport #GuidingLight",
        "slides": [
            {
                "eyebrow": "Community",
                "title": "Questions and real-life advice deserve a caring place to land.",
                "body": "Guiding Light gives families and self-advocates room to connect without the noise.",
                "tone": "brand",
            },
            {
                "eyebrow": "Events",
                "title": "Helpful workshops and gatherings should be easier to spot.",
                "body": "Find webinars, support groups, and autism-centered events without digging through scattered links.",
                "tone": "calm",
            },
            {
                "eyebrow": "Trusted professionals",
                "title": "Guidance feels stronger when lived experience and professional support both matter.",
                "body": "Verified professionals sit alongside families and autistic voices, not above them.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Safer spaces",
                "title": "Privacy, reporting, and moderation help support stay respectful.",
                "body": "Community care works best when people feel protected as well as welcomed.",
                "tone": "warm",
            },
            {
                "eyebrow": "Follow along",
                "title": "Keep up with new resources and community highlights.",
                "body": "Follow Guiding Light on Instagram and explore more on the site.",
                "footer": INSTAGRAM_HANDLE,
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-06-california-parent-guide-and-iep-support",
        "title": "California Parent Guide and IEP Support",
        "caption": "If you are trying to understand evaluations, school support, or how to advocate for services in California, you are not alone. Guiding Light brings the California parent guide together in a calmer way so families can understand school evaluations, insurance pathways, and next steps without starting from scratch every time. Save this for when you need to come back to it. #CaliforniaParents #IEP #AutismSupport #SpecialEducation #ParentAdvocacy #GuidingLight",
        "slides": [
            {
                "eyebrow": "California guide",
                "title": "School support can feel clearer with a calmer starting point.",
                "body": "Guiding Light gathers California-specific help for evaluations, parent rights, and next steps.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-1.jpeg",
                "tone": "calm",
            },
            {
                "eyebrow": "IEP support",
                "title": "School evaluations and medical evaluations are not the same path.",
                "body": "Families often need both sets of information to understand what support is available.",
                "tone": "brand",
            },
            {
                "eyebrow": "Parent rights",
                "title": "You deserve language that feels usable, not overwhelming.",
                "body": "A guide should help you prepare for meetings, not leave you more confused than before.",
                "tone": "warm",
            },
            {
                "eyebrow": "Next step",
                "title": "Save the links that match the stage your family is in.",
                "body": "Whether you are asking for an evaluation or preparing for a meeting, one clear page can help.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Open the guide",
                "title": "Visit the California Parent Guide.",
                "body": "Use the app when you need to revisit school support, rights, and state-specific resources.",
                "footer": "theguidinglight.com/california-guide",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-07-communication-sensory-and-play-tools",
        "title": "Communication, Sensory, and Play Tools",
        "caption": "Support can look like communication tools, movement, visual structure, regulation support, and play that feels safe and engaging. Guiding Light brings these everyday tools together because speech, sensory needs, and play deserve just as much attention as any formal service. #AAC #SensorySupport #AutismTools #PlayBasedLearning #NeurodiversityAffirming #GuidingLight",
        "slides": [
            {
                "eyebrow": "Support tools",
                "title": "Communication and regulation are daily life supports.",
                "body": "AAC apps, visual supports, fidgets, swings, and softer play tools can make everyday life feel more workable.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-son-portrait-2.jpeg",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Communication",
                "title": "AAC belongs in the conversation early.",
                "body": "Speech support is not only about talking. It is about giving people more ways to express themselves.",
                "tone": "brand",
            },
            {
                "eyebrow": "Sensory needs",
                "title": "Stimming, movement, rest, and pressure all matter.",
                "body": "What helps one person regulate may look different from what helps another, and that is okay.",
                "tone": "calm",
            },
            {
                "eyebrow": "Play support",
                "title": "Play can be a bridge to connection, not another demand.",
                "body": "The right environment or tool can help play feel safer and more enjoyable for everyone.",
                "tone": "warm",
            },
            {
                "eyebrow": "Browse tools",
                "title": "Open the support tools section on Guiding Light.",
                "body": "Save the communication, sensory, and play resources you want close by.",
                "footer": "theguidinglight.com/resources",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-08-queer-and-lgbtqia-autistic-belonging",
        "title": "Queer and LGBTQIA+ Autistic Belonging",
        "caption": "Queer and LGBTQIA+ autistic people deserve support that sees their full lives, not a smaller version of them. Guiding Light includes space for queer autistic belonging because visibility, dignity, and safety should never feel optional. #QueerAutistic #LGBTQIA #AutisticAdults #Neurodiversity #GlobalVoices #GuidingLight",
        "slides": [
            {
                "eyebrow": "Belonging",
                "title": "Autistic queer lives deserve full recognition and care.",
                "body": "Support should not ask people to separate identity from the rest of their lived experience.",
                "footer": INSTAGRAM_HANDLE,
                "tone": "warm",
            },
            {
                "eyebrow": "Why it matters",
                "title": "Recognition changes who gets understood sooner.",
                "body": "When more people are represented clearly, fewer people are left to explain themselves alone.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Safer support",
                "title": "The goal is not tolerance. It is safety, dignity, and belonging.",
                "body": "Families and autistic people need spaces that feel truly affirming, not just neutral.",
                "tone": "calm",
            },
            {
                "eyebrow": "Community voices",
                "title": "Creators and advocates help widen what support can look like.",
                "body": "Lived experience brings language and visibility that many people need to see reflected.",
                "tone": "brand",
            },
            {
                "eyebrow": "Keep learning",
                "title": "Visit Global Voices for more inclusive perspectives.",
                "body": "Use Guiding Light to explore voices that make the spectrum feel more fully seen.",
                "footer": "theguidinglight.com/global-voices",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-09-questions-to-ask-your-support-team",
        "title": "Questions to Ask Your Support Team",
        "caption": "Sometimes the hardest part is not knowing what to ask. Whether you are meeting with a therapist, school team, doctor, or provider, a few steady questions can help you feel more grounded. This post is a reminder that you are allowed to ask for clarity, collaboration, and support that fits real life. #ParentAdvocacy #AutismSupport #TherapySupport #SpecialEducation #GuidingLight",
        "slides": [
            {
                "eyebrow": "Support team",
                "title": "You are allowed to ask clear questions.",
                "body": "Meetings feel easier when you go in knowing what matters most to your family right now.",
                "footer": INSTAGRAM_HANDLE,
                "tone": "brand",
            },
            {
                "eyebrow": "Ask this",
                "title": "What does support look like in everyday life, not only on paper?",
                "body": "A plan matters more when it reflects home, school, routines, and real regulation needs.",
                "tone": "warm",
            },
            {
                "eyebrow": "Ask this",
                "title": "How will we know whether this is helping?",
                "body": "Families deserve goals that are understandable, meaningful, and easy to revisit over time.",
                "tone": "calm",
            },
            {
                "eyebrow": "Ask this",
                "title": "What happens if this plan is not working?",
                "body": "You deserve room to adjust, ask for change, and name what is not sustainable.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Save this",
                "title": "Keep these questions handy before your next meeting.",
                "body": "Guiding Light is meant to help you feel more prepared, not more overwhelmed.",
                "footer": SITE_URL,
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-10-seeing-black-and-brown-families-more-clearly",
        "title": "Seeing Black and Brown Families More Clearly",
        "caption": "Black and brown autistic people and their families are too often recognized later, supported later, or left to navigate more barriers alone. Guiding Light names that reality because families deserve earlier recognition, better access, and resources that feel culturally aware and human. #AutismInBlack #AutismSupport #RepresentationMatters #ParentSupport #GuidingLight",
        "slides": [
            {
                "eyebrow": "Representation",
                "title": "Families of color deserve to be seen sooner and supported better.",
                "body": "Recognition should not depend on how much information, access, or advocacy a family already has.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-2.jpeg",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Reality",
                "title": "Late recognition can ripple through school, services, and everyday support.",
                "body": "When families have to fight harder to be taken seriously, the burden grows heavier than it should.",
                "tone": "warm",
            },
            {
                "eyebrow": "Why we name it",
                "title": "Care should feel more equitable, not more confusing.",
                "body": "A guide should make access easier and honor the communities most often overlooked.",
                "tone": "calm",
            },
            {
                "eyebrow": "Community matters",
                "title": "Seeing yourself reflected changes what support can feel like.",
                "body": "Families deserve language, stories, and resources that feel personal and possible.",
                "tone": "brand",
            },
            {
                "eyebrow": "Keep going",
                "title": "Use Guiding Light to find resources that honor the whole family journey.",
                "body": "Support should feel grounded in dignity, not gatekeeping.",
                "footer": SITE_URL,
                "tone": "brand",
            },
        ],
    },
]

HIGHLIGHTS: List[Dict] = [
    {"slug": "start-here", "label": "Start Here", "tone": "brand"},
    {"slug": "resources", "label": "Resources", "tone": "calm"},
    {"slug": "events", "label": "Events", "tone": "warm"},
    {"slug": "community", "label": "Community", "tone": "spotlight"},
    {"slug": "voices", "label": "Global Voices", "tone": "brand"},
    {"slug": "outings", "label": "Outings", "tone": "calm"},
    {"slug": "guides", "label": "Guides", "tone": "warm"},
    {"slug": "tools", "label": "Tools", "tone": "spotlight"},
]

REELS: List[Dict] = [
    {
        "slug": "reel-01-welcome",
        "title": "Welcome to Guiding Light",
        "subtitle": "A calm first look at the space and what families can find here.",
        "tone": "brand",
    },
    {
        "slug": "reel-02-start-here",
        "title": "Start Here for Families",
        "subtitle": "A short guide to the first steps families can take inside the app.",
        "tone": "warm",
    },
    {
        "slug": "reel-03-global-voices",
        "title": "Global Voices and Belonging",
        "subtitle": "Why representation, queer inclusion, and creator voices matter.",
        "tone": "spotlight",
    },
    {
        "slug": "reel-04-daily-support",
        "title": "Daily Support that Helps",
        "subtitle": "Haircuts, outings, tools, sensory support, and calmer everyday planning.",
        "tone": "calm",
    },
    {
        "slug": "reel-05-california-guide",
        "title": "California Guide and IEP Help",
        "subtitle": "A simpler way to point families toward school and support information.",
        "tone": "brand",
    },
]

CALENDAR_ROWS: List[Dict[str, str]] = [
    {
        "date": "2026-04-21",
        "asset_type": "Feed carousel",
        "asset_slug": "post-01-welcome-to-guiding-light",
        "title": "Welcome to Guiding Light",
        "goal": "Introduce the brand and invite first follows.",
        "notes": "Pin this post after publishing.",
    },
    {
        "date": "2026-04-22",
        "asset_type": "Story highlights",
        "asset_slug": "all-highlight-covers",
        "title": "Publish story highlight covers",
        "goal": "Set up profile structure before the first week ends.",
        "notes": "Add Start Here, Resources, Events, Community, Voices, Outings, Guides, Tools.",
    },
    {
        "date": "2026-04-23",
        "asset_type": "Feed carousel",
        "asset_slug": "post-02-start-here-for-families",
        "title": "Start Here for Families",
        "goal": "Give new visitors an immediate practical entry point.",
        "notes": "Use a story reminder the next morning.",
    },
    {
        "date": "2026-04-25",
        "asset_type": "Reel cover",
        "asset_slug": "reel-01-welcome",
        "title": "Welcome reel",
        "goal": "Reach new people through a short introductory reel.",
        "notes": "Post with voiceover or simple screen-record walk-through.",
    },
    {
        "date": "2026-04-28",
        "asset_type": "Feed carousel",
        "asset_slug": "post-03-global-voices-and-belonging",
        "title": "Global Voices and Belonging",
        "goal": "Show the heart and values of the platform.",
        "notes": "Pair with a story poll about representation.",
    },
    {
        "date": "2026-04-30",
        "asset_type": "Feed carousel",
        "asset_slug": "post-04-calmer-outings-and-everyday-support",
        "title": "Calmer Outings and Everyday Support",
        "goal": "Spotlight one of the most practical resource categories.",
        "notes": "Add a comment with a favorite outing tip.",
    },
    {
        "date": "2026-05-02",
        "asset_type": "Reel cover",
        "asset_slug": "reel-02-start-here",
        "title": "Start Here reel",
        "goal": "Guide viewers toward the most useful first pages.",
        "notes": "Use screen recording from the site.",
    },
    {
        "date": "2026-05-05",
        "asset_type": "Feed carousel",
        "asset_slug": "post-05-community-events-and-trusted-guidance",
        "title": "Community, Events, and Trusted Guidance",
        "goal": "Emphasize the human connection behind the platform.",
        "notes": "Invite followers to share what support they wish was easier to find.",
    },
    {
        "date": "2026-05-07",
        "asset_type": "Feed carousel",
        "asset_slug": "post-06-california-parent-guide-and-iep-support",
        "title": "California Parent Guide and IEP Support",
        "goal": "Reach families needing state-specific school support.",
        "notes": "Mention that school and medical evaluations are separate paths.",
    },
    {
        "date": "2026-05-09",
        "asset_type": "Reel cover",
        "asset_slug": "reel-03-global-voices",
        "title": "Global Voices reel",
        "goal": "Extend reach through values-driven content.",
        "notes": "Use quick text overlays and calm music.",
    },
    {
        "date": "2026-05-12",
        "asset_type": "Feed carousel",
        "asset_slug": "post-07-communication-sensory-and-play-tools",
        "title": "Communication, Sensory, and Play Tools",
        "goal": "Highlight daily-life tools people can save and revisit.",
        "notes": "Pair with a question box in stories.",
    },
    {
        "date": "2026-05-14",
        "asset_type": "Feed carousel",
        "asset_slug": "post-08-queer-and-lgbtqia-autistic-belonging",
        "title": "Queer and LGBTQIA+ Autistic Belonging",
        "goal": "Continue making inclusion and belonging visible on the grid.",
        "notes": "Share to stories with a reminder that all families deserve dignity and safety.",
    },
    {
        "date": "2026-05-16",
        "asset_type": "Reel cover",
        "asset_slug": "reel-04-daily-support",
        "title": "Daily support reel",
        "goal": "Drive interest in practical support categories.",
        "notes": "Use quick clips of resource pages and text prompts.",
    },
    {
        "date": "2026-05-19",
        "asset_type": "Feed carousel",
        "asset_slug": "post-09-questions-to-ask-your-support-team",
        "title": "Questions to Ask Your Support Team",
        "goal": "Offer highly savable advocacy content.",
        "notes": "This is a strong candidate for a pinned post later.",
    },
    {
        "date": "2026-05-21",
        "asset_type": "Feed carousel",
        "asset_slug": "post-10-seeing-black-and-brown-families-more-clearly",
        "title": "Seeing Black and Brown Families More Clearly",
        "goal": "Center access, visibility, and earlier recognition.",
        "notes": "Follow with story discussion prompts.",
    },
    {
        "date": "2026-05-23",
        "asset_type": "Reel cover",
        "asset_slug": "reel-05-california-guide",
        "title": "California guide reel",
        "goal": "Wrap the launch period with a practical resource reel.",
        "notes": "Link back to the guide in stories.",
    },
]

TONE_BG = {
    "brand": ("#445bc4", "#6c63d9", "#ff9c73"),
    "calm": ("#274866", "#3d74a6", "#69b8c9"),
    "warm": ("#704f69", "#d16f8e", "#ffb27f"),
    "spotlight": ("#1f2a4f", "#4d5fd1", "#8c7bea"),
}


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def hex_to_rgb(value: str):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def make_gradient(colors, width: int, height: int) -> Image.Image:
    base = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(base)
    top, mid, bottom = [hex_to_rgb(color) for color in colors]
    for y in range(height):
        t = y / max(height - 1, 1)
        if t < 0.55:
            ratio = t / 0.55
            color = tuple(int(top[i] + (mid[i] - top[i]) * ratio) for i in range(3))
        else:
            ratio = (t - 0.55) / 0.45
            color = tuple(int(mid[i] + (bottom[i] - mid[i]) * ratio) for i in range(3))
        draw.line([(0, y), (width, y)], fill=(*color, 255))
    return base


def add_photo(base: Image.Image, photo_path: Path) -> None:
    width, height = base.size
    photo = Image.open(photo_path).convert("RGBA")
    photo_ratio = photo.width / photo.height
    canvas_ratio = width / height

    if photo_ratio > canvas_ratio:
        new_height = height
        new_width = int(new_height * photo_ratio)
    else:
        new_width = width
        new_height = int(new_width / photo_ratio)

    photo = photo.resize((new_width, new_height))
    left = (new_width - width) // 2
    top = (new_height - height) // 2
    photo = photo.crop((left, top, left + width, top + height))
    base.alpha_composite(photo)

    overlay = Image.new("RGBA", (width, height), (10, 16, 28, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for y in range(height):
        alpha = int(35 + (y / height) * 150)
        overlay_draw.line([(0, y), (width, y)], fill=(10, 16, 28, alpha))
    base.alpha_composite(overlay)


def draw_brand_mark(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0) -> None:
    arc1 = (x + int(4 * scale), y + int(36 * scale), x + int(196 * scale), y + int(164 * scale))
    arc2 = (x + int(18 * scale), y + int(92 * scale), x + int(252 * scale), y + int(234 * scale))
    draw.arc(arc1, start=22, end=162, fill="#73BAFF", width=max(4, int(16 * scale)))
    draw.arc(arc2, start=22, end=158, fill="#4D61C8", width=max(4, int(16 * scale)))
    draw.line(
        (
            x + int(86 * scale),
            y + int(100 * scale),
            x + int(144 * scale),
            y + int(86 * scale),
            x + int(214 * scale),
            y + int(112 * scale),
            x + int(280 * scale),
            y + int(64 * scale),
        ),
        fill="white",
        width=max(3, int(7 * scale)),
    )
    for cx, cy, radius in [(86, 100, 18), (144, 86, 13), (214, 112, 15)]:
        scaled_radius = max(6, int(radius * scale))
        actual_x = x + int(cx * scale)
        actual_y = y + int(cy * scale)
        draw.ellipse(
            (
                actual_x - scaled_radius,
                actual_y - scaled_radius,
                actual_x + scaled_radius,
                actual_y + scaled_radius,
            ),
            fill="white",
        )
    draw.text((x, y), "GUIDING LIGHT", font=load_font(TITLE_FONT, max(14, int(28 * scale))), fill=(255, 255, 255, 235))


def wrap_paragraph(text: str, font: ImageFont.FreeTypeFont, max_width: int, max_lines: int | None = None):
    words = text.split()
    lines: List[str] = []
    current = ""
    temp = Image.new("RGBA", (10, 10))
    draw = ImageDraw.Draw(temp)

    for word in words:
        candidate = f"{current} {word}".strip()
        width = draw.textbbox((0, 0), candidate, font=font)[2]
        if width <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word

    if current:
        lines.append(current)

    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip("., ") + "..."

    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, x: int, y: int, lines: List[str], font, fill, line_height: int):
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=font, fill=fill)


def build_slide(slide: Dict, slide_index: int, total_slides: int) -> Image.Image:
    canvas = make_gradient(TONE_BG[slide.get("tone", "brand")], WIDTH, HEIGHT)

    if slide.get("imageSrc"):
        add_photo(canvas, PUBLIC_ROOT / slide["imageSrc"])

    draw = ImageDraw.Draw(canvas)
    title_font = load_font(TITLE_FONT, 82)
    body_font = load_font(TITLE_FONT, 34)
    eyebrow_font = load_font(TITLE_FONT, 28)
    footer_font = load_font(TITLE_FONT, 30)
    footer_sub_font = load_font(BODY_FONT, 22)
    pill_font = load_font(TITLE_FONT, 26)

    draw_brand_mark(draw, 70, 84)

    pill_bbox = (812, 86, 994, 146)
    draw.rounded_rectangle(pill_bbox, radius=26, fill=(255, 255, 255, 38))
    pill_text = f"{slide_index + 1}/{total_slides}"
    pill_w = draw.textbbox((0, 0), pill_text, font=pill_font)[2]
    draw.text((pill_bbox[0] + (pill_bbox[2] - pill_bbox[0] - pill_w) / 2, 101), pill_text, font=pill_font, fill="white")

    draw.text((88, 306), slide["eyebrow"].upper(), font=eyebrow_font, fill=(255, 255, 255, 220))

    title_lines = wrap_paragraph(slide["title"], title_font, 860, 4)
    draw_text_block(draw, 88, 372, title_lines, title_font, "white", 94)

    body_start = 372 + len(title_lines) * 94 + 48
    body_lines = wrap_paragraph(slide["body"], body_font, 760, 5)
    draw_text_block(draw, 88, body_start, body_lines, body_font, (255, 255, 255, 235), 50)

    footer_box = (88, 1160, 992, 1278)
    draw.rounded_rectangle(footer_box, radius=28, fill=(13, 19, 39, 54))
    footer_text = slide.get("footer", INSTAGRAM_HANDLE)
    draw.text((128, 1196), footer_text, font=footer_font, fill="white")
    draw.text((128, 1242), "Where Every Journey Connects", font=footer_sub_font, fill=(255, 255, 255, 210))
    draw.text((956, 1194), "✦", font=load_font(TITLE_FONT, 44), fill=(255, 247, 200, 255))

    return canvas.convert("RGB")


def build_highlight_cover(item: Dict) -> Image.Image:
    image = make_gradient(TONE_BG[item["tone"]], VERTICAL_WIDTH, VERTICAL_HEIGHT)
    draw = ImageDraw.Draw(image)
    badge = (200, 420, 880, 1100)
    draw.rounded_rectangle(badge, radius=84, fill=(13, 19, 39, 70), outline=(255, 255, 255, 30), width=4)
    draw_brand_mark(draw, 326, 566, scale=1.4)

    label_font = load_font(TITLE_FONT, 82)
    lines = wrap_paragraph(item["label"], label_font, 560, 3)
    start_y = 1240
    for index, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=label_font)
        text_width = bbox[2] - bbox[0]
        draw.text(((VERTICAL_WIDTH - text_width) / 2, start_y + index * 92), line, font=label_font, fill="white")

    draw.text((336, 1770), INSTAGRAM_HANDLE, font=load_font(TITLE_FONT, 42), fill=(255, 255, 255, 230))
    return image.convert("RGB")


def build_reel_cover(item: Dict) -> Image.Image:
    image = make_gradient(TONE_BG[item["tone"]], VERTICAL_WIDTH, VERTICAL_HEIGHT)
    draw = ImageDraw.Draw(image)
    draw_brand_mark(draw, 88, 110, scale=1.05)

    pill = (760, 110, 980, 180)
    draw.rounded_rectangle(pill, radius=32, fill=(255, 255, 255, 38))
    draw.text((808, 128), "REEL", font=load_font(TITLE_FONT, 32), fill="white")

    title_font = load_font(TITLE_FONT, 106)
    subtitle_font = load_font(TITLE_FONT, 38)

    title_lines = wrap_paragraph(item["title"], title_font, 840, 4)
    draw_text_block(draw, 100, 450, title_lines, title_font, "white", 112)

    subtitle_y = 450 + len(title_lines) * 112 + 56
    subtitle_lines = wrap_paragraph(item["subtitle"], subtitle_font, 760, 5)
    draw_text_block(draw, 100, subtitle_y, subtitle_lines, subtitle_font, (255, 255, 255, 235), 58)

    footer_box = (84, 1668, 996, 1830)
    draw.rounded_rectangle(footer_box, radius=38, fill=(13, 19, 39, 54))
    draw.text((128, 1712), INSTAGRAM_HANDLE, font=load_font(TITLE_FONT, 44), fill="white")
    draw.text((128, 1768), "Where Every Journey Connects", font=load_font(BODY_FONT, 30), fill=(255, 255, 255, 210))
    return image.convert("RGB")


def build_launch_calendar_files():
    CALENDAR_ROOT.mkdir(parents=True, exist_ok=True)

    md_lines = [
        "# Guiding Light Instagram Launch Calendar",
        "",
        "This calendar starts on Tuesday, April 21, 2026 and gives you a clear order for feed posts, story highlight setup, and reel covers.",
        "",
        "| Date | Asset type | Title | Goal | Notes |",
        "| --- | --- | --- | --- | --- |",
    ]

    for row in CALENDAR_ROWS:
        md_lines.append(
            f"| {row['date']} | {row['asset_type']} | {row['title']} | {row['goal']} | {row['notes']} |"
        )

    (CALENDAR_ROOT / "launch-calendar.md").write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    with (CALENDAR_ROOT / "launch-calendar.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = DictWriter(handle, fieldnames=["date", "asset_type", "asset_slug", "title", "goal", "notes"])
        writer.writeheader()
        writer.writerows(CALENDAR_ROWS)


def write_root_readme():
    readme_lines = [
        "# Guiding Light Instagram Launch Kit",
        "",
        "These are ready-to-upload social assets for Instagram.",
        "",
        f"Instagram profile: https://www.instagram.com/theguidinglightconnect/",
        "",
        "## Where the upload files are",
        "",
        "- Feed carousels: `posts/`",
        "- Story highlight covers: `story-highlights/`",
        "- Reel covers: `reel-covers/`",
        "- Launch calendar: `launch-calendar/launch-calendar.md` and `launch-calendar/launch-calendar.csv`",
        "",
        "## Feed posts included",
        "",
    ]

    for index, post in enumerate(POSTS, start=1):
        readme_lines.append(f"{index}. {post['title']}")
        readme_lines.append(f"   Folder: posts/{post['slug']}")
        readme_lines.append("")

    readme_lines.extend(
        [
            "## Access on your Mac",
            "",
            f"- Full folder: `{OUTPUT_ROOT}`",
            f"- Zip file: `{OUTPUT_ROOT / 'guiding-light-instagram-launch-kit.zip'}`",
            "",
        ]
    )

    (OUTPUT_ROOT / "README.md").write_text("\n".join(readme_lines) + "\n", encoding="utf-8")


def write_caption_files():
    captions_md: List[str] = []
    for index, post in enumerate(POSTS, start=1):
        post_dir = POSTS_ROOT / post["slug"]
        post_dir.mkdir(parents=True, exist_ok=True)
        (post_dir / "caption.txt").write_text(f"{post['title']}\n\n{post['caption']}\n", encoding="utf-8")
        captions_md.append(f"## Post {index}: {post['title']}\n\n{post['caption']}\n")

    (OUTPUT_ROOT / "captions.md").write_text("\n".join(captions_md), encoding="utf-8")


def export_assets():
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    POSTS_ROOT.mkdir(parents=True, exist_ok=True)
    HIGHLIGHTS_ROOT.mkdir(parents=True, exist_ok=True)
    REELS_ROOT.mkdir(parents=True, exist_ok=True)

    write_root_readme()
    write_caption_files()

    for post in POSTS:
        post_dir = POSTS_ROOT / post["slug"]
        for slide_index, slide in enumerate(post["slides"], start=1):
            image = build_slide(slide, slide_index - 1, len(post["slides"]))
            image.save(post_dir / f"slide-{slide_index:02}.png", format="PNG", optimize=True)

    for item in HIGHLIGHTS:
        image = build_highlight_cover(item)
        image.save(HIGHLIGHTS_ROOT / f"{item['slug']}.png", format="PNG", optimize=True)

    for item in REELS:
        image = build_reel_cover(item)
        image.save(REELS_ROOT / f"{item['slug']}.png", format="PNG", optimize=True)

    build_launch_calendar_files()

    zip_path = OUTPUT_ROOT / "guiding-light-instagram-launch-kit.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUTPUT_ROOT.rglob("*")):
            if path == zip_path:
                continue
            archive.write(path, path.relative_to(OUTPUT_ROOT))

    print(f"Instagram launch kit exported to {OUTPUT_ROOT}")
    print(f"Zip bundle: {zip_path}")


if __name__ == "__main__":
    export_assets()
