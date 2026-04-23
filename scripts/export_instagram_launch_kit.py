from __future__ import annotations

from csv import DictWriter
from pathlib import Path
from typing import Dict, List
import shutil
import zipfile

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = PROJECT_ROOT / "deliverables" / "instagram-launch-kit"
POSTS_ROOT = OUTPUT_ROOT / "posts"
HIGHLIGHTS_ROOT = OUTPUT_ROOT / "story-highlights"
REELS_ROOT = OUTPUT_ROOT / "reel-covers"
REEL_SCRIPTS_ROOT = OUTPUT_ROOT / "reel-scripts"
REEL_VIDEOS_ROOT = OUTPUT_ROOT / "reel-videos"
STORY_OVERLAYS_ROOT = OUTPUT_ROOT / "story-text-overlays"
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

TONE_BG = {
    "brand": ("#445bc4", "#6C63D9", "#FF9C73"),
    "calm": ("#274866", "#3D74A6", "#69B8C9"),
    "warm": ("#704F69", "#D16F8E", "#FFB27F"),
    "spotlight": ("#1F2A4F", "#4D5FD1", "#8C7BEA"),
}

POSTS: List[Dict] = [
    {
        "slug": "post-01-welcome-to-guiding-light",
        "title": "Welcome to Guiding Light",
        "caption": "Welcome to Guiding Light. We created this space for autistic people, parents, caregivers, and support teams who need real-life help that feels calm, clear, and connected. Here you can find trusted resources, inclusive events, honest community conversations, and support that meets you where you are. If you have been looking for a gentler place to begin, we hope this feels like a good first step. Visit theguidinglight.com to explore more. #GuidingLight #AutismSupport #AutismCommunity #Neurodiversity #ParentSupport #ActuallyAutistic",
        "caption_variations": [
            "Guiding Light was created to feel like a calmer starting point for autistic people, families, caregivers, and trusted support teams. If you have been searching for one place that feels more human and less overwhelming, this is our invitation to begin. #GuidingLight #AutismSupport #ActuallyAutistic",
            "A softer place to begin. Guiding Light brings together resources, events, community, and everyday support so people do not have to carry the whole search alone. Save this intro post and follow along at @theguidinglightconnect. #AutismCommunity #ParentSupport #Neurodiversity",
        ],
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
        "caption_variations": [
            "For families just beginning, the goal is not to know everything right away. The goal is to find the next right step and give yourself permission to come back to the rest later. Save this one for when you need it. #AutismParenting #GuidingLight #ParentSupport",
            "A guide should help you breathe, not panic. This post is for the families who need a softer starting point and a clearer path into support. #AutismResources #IEP #SpecialNeedsParenting",
        ],
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
        "caption_variations": [
            "Representation matters because recognition matters. The more stories we honor across countries, cultures, and identities, the easier it becomes for people to feel seen earlier and more fully. #GlobalVoices #QueerAutistic #ActuallyAutistic",
            "Global voices make the spectrum feel wider, more honest, and more human. This post is a reminder that dignity should travel across every language and community. #Neurodiversity #AutisticAdults #LGBTQIA",
        ],
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
        "caption_variations": [
            "Sometimes support looks like a quieter room, a better haircut plan, or knowing where the nursing space is before you arrive. Those details matter, and they deserve to be easier to find. #SensoryFriendly #AutismOutings #FamilySupport",
            "Daily life support counts too. This post is for the families building calmer routines, more workable outings, and less stressful planning. #InclusivePlay #AutismTools #GuidingLight",
        ],
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
        "caption_variations": [
            "Support feels different when it feels human. Guiding Light was built to hold resources, community, events, and real guidance in one place people can return to. #AutismCommunity #GuidingLight #ParentCommunity",
            "A guide should feel like something you can grow with. This post is about community, trusted support, and finding information you actually want to save. #AutismEvents #TherapistSupport #GuidingLight",
        ],
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
        "caption_variations": [
            "California families deserve a guide that makes school support feel clearer, not heavier. Save this for the next time you need to revisit evaluations, rights, or what comes next. #CaliforniaParents #IEP #ParentAdvocacy",
            "A lot of families are trying to understand school support while already carrying too much. This post is meant to make that path feel more usable and less scattered. #SpecialEducation #AutismSupport #GuidingLight",
        ],
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
        "caption_variations": [
            "Communication, sensory support, and play tools all belong in the conversation. This post is for the daily life supports that make routines feel more workable and more connected. #AAC #SensorySupport #PlayBasedLearning",
            "Support does not only happen in appointments. It also lives in the tools that help people regulate, communicate, move, and play in everyday life. #AutismTools #GuidingLight #NeurodiversityAffirming",
        ],
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
        "caption_variations": [
            "Queer autistic lives deserve full recognition, not partial understanding. This post is here to keep that truth visible on the grid and in the conversation. #QueerAutistic #LGBTQIA #GlobalVoices",
            "Belonging should not require leaving part of yourself behind. Guiding Light makes room for queer autistic dignity, safety, and visibility because those things matter. #AutisticAdults #Neurodiversity #GuidingLight",
        ],
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
        "caption_variations": [
            "A few grounded questions can change how a meeting feels. Save this before the next therapist, school, or provider conversation so you do not have to walk in empty-handed. #ParentAdvocacy #AutismSupport #GuidingLight",
            "You are allowed to ask for clarity. You are allowed to ask what happens if something is not working. You are allowed to ask for support that fits real life. #TherapySupport #SpecialEducation #GuidingLight",
        ],
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
        "caption_variations": [
            "Families of color deserve to be seen sooner, supported better, and recognized without having to push twice as hard. This post names that reality because it matters. #AutismInBlack #RepresentationMatters #GuidingLight",
            "Recognition should not depend on how much access, advocacy experience, or information a family already has. Equity matters here too. #AutismSupport #ParentSupport #AutismInBlack",
        ],
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
    {
        "slug": "post-11-adulthood-work-and-independent-living",
        "title": "Adulthood, Work, and Independent Living",
        "caption": "Autistic support should not end when school does. Adults deserve access to employment resources, social connection, practical life support, and space to build a life that feels truly their own. Guiding Light includes adulthood-focused resources because support should grow with the person. #AutisticAdults #IndependentLiving #AutismEmployment #Neurodiversity #GuidingLight",
        "caption_variations": [
            "Autistic adulthood deserves more than an afterthought. Work, housing, social life, and independence all deserve real support pathways too. #AutisticAdults #AutismEmployment #GuidingLight",
            "A meaningful life after school matters. This post centers adulthood resources because support should grow with the person, not stop when childhood services do. #IndependentLiving #Neurodiversity #AutisticAdults",
        ],
        "slides": [
            {
                "eyebrow": "Adulthood",
                "title": "Support should grow with the person, not stop after school.",
                "body": "Autistic adults deserve resources for work, daily life, connection, and independence too.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-son-portrait-1.jpeg",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Employment",
                "title": "Work support is about fit, not forcing sameness.",
                "body": "A better match between strengths, environment, and expectations can change what work feels like.",
                "tone": "brand",
            },
            {
                "eyebrow": "Daily life",
                "title": "Independent living can include support and still be independence.",
                "body": "Real life skills, routines, systems, and accommodations all matter here.",
                "tone": "calm",
            },
            {
                "eyebrow": "Belonging",
                "title": "Adulthood is also about connection, purpose, and dignity.",
                "body": "People deserve social spaces and community support that do not disappear with age.",
                "tone": "warm",
            },
            {
                "eyebrow": "Explore more",
                "title": "Use Guiding Light to keep adulthood resources close by.",
                "body": "Support should still feel possible in every stage of life.",
                "footer": SITE_URL,
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-12-haircuts-grooming-and-sensory-care",
        "title": "Haircuts, Grooming, and Sensory Care",
        "caption": "Haircuts and grooming can carry a lot of stress when sensory needs are high. Families should not have to search through scattered links just to find a gentler option. Guiding Light keeps haircut guides, salon resources, and sensory-aware grooming support easier to reach. #SensoryCare #AutismHaircuts #FamilySupport #GuidingLight",
        "caption_variations": [
            "Haircuts can feel like a major event, not a small errand. This post is for the families looking for gentler grooming support and more workable planning. #AutismHaircuts #SensoryCare #GuidingLight",
            "Sensory-friendly grooming support matters because everyday care matters. Save this one if haircuts or grooming have felt especially heavy lately. #FamilySupport #SensoryFriendly #GuidingLight",
        ],
        "slides": [
            {
                "eyebrow": "Grooming support",
                "title": "Haircuts can feel easier with the right preparation and environment.",
                "body": "Families deserve grooming resources that make sensory care feel more manageable.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-son-portrait-2.jpeg",
                "tone": "warm",
            },
            {
                "eyebrow": "Why it matters",
                "title": "Everyday care should not feel like an impossible event.",
                "body": "The smaller details of support can shape whether a whole week feels calmer or heavier.",
                "tone": "calm",
            },
            {
                "eyebrow": "What helps",
                "title": "Preparation, sensory-friendly spaces, and provider awareness matter.",
                "body": "A better setting can turn a high-stress task into something more workable.",
                "tone": "brand",
            },
            {
                "eyebrow": "What to save",
                "title": "Keep the haircut and grooming links you may need later.",
                "body": "Good support is easier to use when it is already within reach.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Browse support",
                "title": "Open Haircuts and Grooming on Guiding Light.",
                "body": "Find the links and resources that make this part of life feel softer.",
                "footer": "theguidinglight.com/resources?collection=Haircuts+and+Grooming",
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-13-caregiver-support-and-home-based-help",
        "title": "Caregiver Support and Home-Based Help",
        "caption": "Caregivers need support too. Home-based care, respite, financial help, and systems like IHSS or paid leave can shape whether families feel stretched past capacity or more able to keep going. Guiding Light includes caregiver-facing links because caring for the whole family matters. #CaregiverSupport #IHSS #PaidFamilyLeave #AutismParenting #GuidingLight",
        "caption_variations": [
            "Caregivers are carrying so much. This post is a reminder that support for the person also has to include support for the people helping every day. #CaregiverSupport #AutismParenting #GuidingLight",
            "Home-based help, respite, and financial support can change whether a family feels constantly underwater. Save this for later if caregiver support is part of the picture right now. #IHSS #PaidFamilyLeave #FamilySupport",
        ],
        "slides": [
            {
                "eyebrow": "Caregiver support",
                "title": "The whole family needs support, not only the person in services.",
                "body": "Home-based help, respite, and practical caregiving resources matter too.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-1.jpeg",
                "tone": "calm",
            },
            {
                "eyebrow": "At home care",
                "title": "Support systems can help families keep going without burning out.",
                "body": "When help is easier to find, caregiving can feel more sustainable.",
                "tone": "warm",
            },
            {
                "eyebrow": "Financial support",
                "title": "Programs like IHSS or paid leave can make a real difference.",
                "body": "Families should be able to find those links without a second job of searching for them.",
                "tone": "brand",
            },
            {
                "eyebrow": "Why we include it",
                "title": "Caregiver well-being changes what support feels like at home.",
                "body": "A guide should care about the people carrying the day-to-day load too.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Open resources",
                "title": "Use Guiding Light to save caregiver links and return later.",
                "body": "The right support is easier to use when it is already in one place.",
                "footer": SITE_URL,
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-14-safer-community-and-verified-support",
        "title": "Safer Community and Verified Support",
        "caption": "A support space should not only feel welcoming. It should also feel safer, clearer, and more accountable. Guiding Light includes reporting, moderation, and verified professional signals because trust matters when families are looking for help. #SafeCommunity #AutismSupport #TrustedSupport #GuidingLight",
        "caption_variations": [
            "A caring space needs trust, not only warmth. This post is about the safety features that help Guiding Light feel more dependable for the people using it. #SafeCommunity #TrustedSupport #GuidingLight",
            "Families deserve support spaces that feel welcoming and accountable at the same time. Trust is part of access too. #AutismSupport #CommunityCare #GuidingLight",
        ],
        "slides": [
            {
                "eyebrow": "Safer support",
                "title": "Welcoming spaces should still have accountability.",
                "body": "Trust grows when people know concerns can be reported, reviewed, and handled with care.",
                "footer": INSTAGRAM_HANDLE,
                "tone": "brand",
            },
            {
                "eyebrow": "Why it matters",
                "title": "Families should not have to guess whether support feels safe.",
                "body": "Clear moderation and trusted signals help people feel more secure using the space.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "Verified professionals",
                "title": "Professional guidance should be easier to recognize.",
                "body": "People deserve clearer cues when they are deciding what to trust and where to return.",
                "tone": "calm",
            },
            {
                "eyebrow": "Community care",
                "title": "Safety is part of belonging, not separate from it.",
                "body": "A support platform should feel human and responsible at the same time.",
                "tone": "warm",
            },
            {
                "eyebrow": "Explore more",
                "title": "Use Guiding Light to browse resources with more confidence.",
                "body": "Trust and accessibility should grow together.",
                "footer": SITE_URL,
                "tone": "brand",
            },
        ],
    },
    {
        "slug": "post-15-why-guiding-light-exists",
        "title": "Why Guiding Light Exists",
        "caption": "Guiding Light was created from a real family journey. It grew out of love, pressure, hope, diagnosis, homeschooling, therapy support, and the deep truth that community made all the difference. This space exists because one family should not have to feel so alone while trying to find the help their child needs. #FounderStory #AutismParenting #CommunitySupport #GuidingLight",
        "caption_variations": [
            "This platform began with a real family story and a real need for calmer guidance. It exists because support should feel closer, more human, and easier to trust. #FounderStory #GuidingLight #CommunitySupport",
            "Guiding Light was built from lived experience, not just a project idea. Hope, community, and the reality of parenting all shaped what this space is meant to be. #AutismParenting #FounderStory #GuidingLight",
        ],
        "slides": [
            {
                "eyebrow": "Founder story",
                "title": "Guiding Light was built from a real family journey.",
                "body": "This space exists because love, pressure, hope, and community all shaped what support needed to feel like.",
                "footer": INSTAGRAM_HANDLE,
                "imageSrc": "family/founder-mother-son-2.jpeg",
                "tone": "warm",
            },
            {
                "eyebrow": "Early years",
                "title": "A diagnosis can change the shape of everyday life very quickly.",
                "body": "Families need information, but they also need reassurance, direction, and people who truly understand.",
                "tone": "spotlight",
            },
            {
                "eyebrow": "What helped",
                "title": "Community made the difference.",
                "body": "Intentional therapists, a real village, and support that showed up with care helped keep the path possible.",
                "tone": "brand",
            },
            {
                "eyebrow": "Why this space matters",
                "title": "No family should have to search alone for everything they need.",
                "body": "Guiding Light was created to gather support in a way that feels more human and more usable.",
                "tone": "calm",
            },
            {
                "eyebrow": "Keep following",
                "title": "This space was made for connection, support, and hope.",
                "body": "Follow along as Guiding Light keeps growing into a steadier guide for families and autistic people.",
                "footer": INSTAGRAM_HANDLE,
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
        "hook": "If autism support feels scattered, this is the calmer place to begin.",
        "voiceover": "Guiding Light was created to feel like one calmer starting point for autistic people, families, caregivers, and trusted support teams. Instead of opening ten tabs, you can find resources, events, community, and real-life guidance in one space built to feel more human.",
        "beats": [
            "Open with homepage hero or logo shot.",
            "Show resources page and quick filters.",
            "Show community or events page.",
            "End on homepage CTA and Instagram handle.",
        ],
        "caption": "If support has felt scattered, Guiding Light was built to make it feel calmer and easier to return to. Start here, save what matters, and keep going one step at a time. #GuidingLight #AutismSupport #AutismCommunity",
    },
    {
        "slug": "reel-02-start-here",
        "title": "Start Here for Families",
        "subtitle": "A short guide to the first steps families can take inside the app.",
        "tone": "warm",
        "hook": "If you are at the beginning, you do not have to figure it all out today.",
        "voiceover": "One of the hardest parts of an autism journey is not knowing where to begin. Guiding Light helps families start with the next right step, save the resources that fit their real life, and come back to support without feeling buried by information.",
        "beats": [
            "Start on a calm founder/family image.",
            "Show onboarding or resources opening state.",
            "Point to California guide and outings guide.",
            "End with save/share CTA.",
        ],
        "caption": "For families just starting, the goal is not to learn everything at once. The goal is to find the next right step and come back to the rest later. #AutismParenting #ParentSupport #GuidingLight",
    },
    {
        "slug": "reel-03-global-voices",
        "title": "Global Voices and Belonging",
        "subtitle": "Why representation, queer inclusion, and creator voices matter.",
        "tone": "spotlight",
        "hook": "Autism is understood differently around the world, but dignity should not change by location.",
        "voiceover": "Guiding Light makes room for global voices, queer autistic belonging, and creator perspectives because representation helps people feel seen earlier and more fully. The wider the picture becomes, the more possible support can feel.",
        "beats": [
            "Open on Global Voices heading.",
            "Cut to creator cards and identity sections.",
            "Highlight queer/LGBTQIA+ and representation text.",
            "Close on invitation to explore the section.",
        ],
        "caption": "Global voices matter because recognition matters. The more stories we honor, the more people get to feel seen and supported sooner. #GlobalVoices #QueerAutistic #Neurodiversity",
    },
    {
        "slug": "reel-04-daily-support",
        "title": "Daily Support that Helps",
        "subtitle": "Haircuts, outings, tools, sensory support, and calmer everyday planning.",
        "tone": "calm",
        "hook": "Support is not only therapy or school. It is also the little everyday details.",
        "voiceover": "Daily life support can mean haircuts, access passes, nursing rooms, AAC, fidgets, quiet spaces, and tools that help people regulate and feel more prepared. Guiding Light gathers those everyday helps in one place so families can spend less time searching.",
        "beats": [
            "Open on resource categories or outing tools.",
            "Cut to haircut/grooming and outing guides.",
            "Show support tools and resource cards.",
            "End with quick filter or collection page.",
        ],
        "caption": "Daily support counts too. Haircuts, outings, quiet rooms, tools, and sensory care can change how a whole day feels. #SensorySupport #AutismTools #GuidingLight",
    },
    {
        "slug": "reel-05-california-guide",
        "title": "California Guide and IEP Help",
        "subtitle": "A simpler way to point families toward school and support information.",
        "tone": "brand",
        "hook": "California school support can feel confusing fast. This guide helps slow it down.",
        "voiceover": "Guiding Light gathers California-focused information for evaluations, parent rights, insurance pathways, and next steps so families do not have to restart the search every time they need clarity. It is a calmer place to come back to when school support feels heavy.",
        "beats": [
            "Open on California guide hero.",
            "Highlight IEP/school evaluations wording.",
            "Show parent rights and guide sections.",
            "End with URL and save CTA.",
        ],
        "caption": "California families deserve a guide that makes school support feel clearer, not heavier. Save this for the next time you need to revisit evaluations, rights, or next steps. #CaliforniaParents #IEP #GuidingLight",
    },
    {
        "slug": "reel-06-adulthood",
        "title": "Adulthood and Independence",
        "subtitle": "Why adulthood support matters too.",
        "tone": "spotlight",
        "hook": "Autistic support should not end after school.",
        "voiceover": "Adults deserve resources for work, connection, daily life, and independence too. Guiding Light keeps adulthood in the conversation because support should keep growing with the person, not stop when childhood services do.",
        "beats": [
            "Open on adulthood carousel cover.",
            "Show adulthood resource text or pages.",
            "Call out work, independence, and belonging.",
            "End with follow/save CTA.",
        ],
        "caption": "Autistic adulthood deserves real support too. Work, independence, social life, and daily routines all matter. #AutisticAdults #IndependentLiving #GuidingLight",
    },
    {
        "slug": "reel-07-grooming",
        "title": "Haircuts and Sensory Care",
        "subtitle": "Making everyday care feel more manageable.",
        "tone": "warm",
        "hook": "Haircuts can feel like a major event when sensory stress is high.",
        "voiceover": "Haircuts and grooming can carry a lot of stress for families, especially when sensory needs are high. Guiding Light keeps gentler grooming resources easier to reach so everyday care can feel a little more manageable.",
        "beats": [
            "Open on haircut/grooming carousel cover.",
            "Highlight sensory-friendly grooming language.",
            "Show the resource collection or quick links.",
            "End with save-for-later CTA.",
        ],
        "caption": "Haircuts and grooming support matter because everyday care matters. Save this one if that part of life has felt especially heavy. #AutismHaircuts #SensoryCare #GuidingLight",
    },
    {
        "slug": "reel-08-caregiver-support",
        "title": "Caregiver Support at Home",
        "subtitle": "Resources that hold up the whole family.",
        "tone": "calm",
        "hook": "Caregivers need support too.",
        "voiceover": "Home-based help, respite, financial support, and programs like IHSS or paid leave can shape whether families feel stretched past capacity or more able to keep going. Guiding Light includes caregiver-facing resources because caring for the whole family matters.",
        "beats": [
            "Open on caregiver support carousel cover.",
            "Call out home-based help and financial support.",
            "Show related resource pages or cards.",
            "End with supportive CTA.",
        ],
        "caption": "Caregiving should not mean carrying everything alone. Support for the whole family matters too. #CaregiverSupport #IHSS #GuidingLight",
    },
    {
        "slug": "reel-09-safer-community",
        "title": "Safer Community Support",
        "subtitle": "Why trust and accountability matter in a support space.",
        "tone": "brand",
        "hook": "A support space should feel welcoming and dependable at the same time.",
        "voiceover": "Guiding Light includes reporting, moderation, and trusted professional signals because warmth alone is not enough. Families deserve spaces that feel more accountable, clearer to navigate, and safer to return to.",
        "beats": [
            "Open on safer community carousel cover.",
            "Show community or professionals page.",
            "Call out reporting and moderation/trust language.",
            "End with trust-focused CTA.",
        ],
        "caption": "Support feels stronger when trust is part of the design. Families deserve welcoming spaces that also feel accountable. #SafeCommunity #TrustedSupport #GuidingLight",
    },
    {
        "slug": "reel-10-founder-story",
        "title": "Why Guiding Light Exists",
        "subtitle": "The founder story behind the platform.",
        "tone": "warm",
        "hook": "Guiding Light began with a real family journey, not just an app idea.",
        "voiceover": "This space grew out of diagnosis, homeschooling, therapy support, caregiving, and the truth that community made all the difference. Guiding Light exists because one family should not have to feel so alone while trying to find help.",
        "beats": [
            "Open on founder story visuals or photos.",
            "Show founder section on the site.",
            "Overlay a few key lines from the story.",
            "Close with hopeful CTA and handle.",
        ],
        "caption": "Guiding Light was built from lived experience, not just a project idea. Community, hope, and the real family journey shaped what this space is meant to be. #FounderStory #AutismParenting #GuidingLight",
    },
]

MONTH_1_CALENDAR_ROWS: List[Dict[str, str]] = [
    {"date": "2026-04-21", "asset_type": "Feed carousel", "asset_slug": "post-01-welcome-to-guiding-light", "title": "Welcome to Guiding Light", "goal": "Introduce the brand and invite first follows.", "notes": "Pin this post after publishing."},
    {"date": "2026-04-22", "asset_type": "Story highlights", "asset_slug": "all-highlight-covers", "title": "Publish story highlight covers", "goal": "Set up profile structure before the first week ends.", "notes": "Add Start Here, Resources, Events, Community, Voices, Outings, Guides, Tools."},
    {"date": "2026-04-23", "asset_type": "Feed carousel", "asset_slug": "post-02-start-here-for-families", "title": "Start Here for Families", "goal": "Give new visitors an immediate practical entry point.", "notes": "Use a story reminder the next morning."},
    {"date": "2026-04-25", "asset_type": "Reel cover", "asset_slug": "reel-01-welcome", "title": "Welcome reel", "goal": "Reach new people through a short introductory reel.", "notes": "Post with voiceover or simple screen-record walk-through."},
    {"date": "2026-04-28", "asset_type": "Feed carousel", "asset_slug": "post-03-global-voices-and-belonging", "title": "Global Voices and Belonging", "goal": "Show the heart and values of the platform.", "notes": "Pair with a story poll about representation."},
    {"date": "2026-04-30", "asset_type": "Feed carousel", "asset_slug": "post-04-calmer-outings-and-everyday-support", "title": "Calmer Outings and Everyday Support", "goal": "Spotlight one of the most practical resource categories.", "notes": "Add a comment with a favorite outing tip."},
    {"date": "2026-05-02", "asset_type": "Reel cover", "asset_slug": "reel-02-start-here", "title": "Start Here reel", "goal": "Guide viewers toward the most useful first pages.", "notes": "Use screen recording from the site."},
    {"date": "2026-05-05", "asset_type": "Feed carousel", "asset_slug": "post-05-community-events-and-trusted-guidance", "title": "Community, Events, and Trusted Guidance", "goal": "Emphasize the human connection behind the platform.", "notes": "Invite followers to share what support they wish was easier to find."},
    {"date": "2026-05-07", "asset_type": "Feed carousel", "asset_slug": "post-06-california-parent-guide-and-iep-support", "title": "California Parent Guide and IEP Support", "goal": "Reach families needing state-specific school support.", "notes": "Mention that school and medical evaluations are separate paths."},
    {"date": "2026-05-09", "asset_type": "Reel cover", "asset_slug": "reel-03-global-voices", "title": "Global Voices reel", "goal": "Extend reach through values-driven content.", "notes": "Use quick text overlays and calm music."},
    {"date": "2026-05-12", "asset_type": "Feed carousel", "asset_slug": "post-07-communication-sensory-and-play-tools", "title": "Communication, Sensory, and Play Tools", "goal": "Highlight daily-life tools people can save and revisit.", "notes": "Pair with a question box in stories."},
    {"date": "2026-05-14", "asset_type": "Feed carousel", "asset_slug": "post-08-queer-and-lgbtqia-autistic-belonging", "title": "Queer and LGBTQIA+ Autistic Belonging", "goal": "Continue making inclusion and belonging visible on the grid.", "notes": "Share to stories with a reminder that all families deserve dignity and safety."},
    {"date": "2026-05-16", "asset_type": "Reel cover", "asset_slug": "reel-04-daily-support", "title": "Daily support reel", "goal": "Drive interest in practical support categories.", "notes": "Use quick clips of resource pages and text prompts."},
    {"date": "2026-05-19", "asset_type": "Feed carousel", "asset_slug": "post-09-questions-to-ask-your-support-team", "title": "Questions to Ask Your Support Team", "goal": "Offer highly savable advocacy content.", "notes": "This is a strong candidate for a pinned post later."},
    {"date": "2026-05-21", "asset_type": "Feed carousel", "asset_slug": "post-10-seeing-black-and-brown-families-more-clearly", "title": "Seeing Black and Brown Families More Clearly", "goal": "Center access, visibility, and earlier recognition.", "notes": "Follow with story discussion prompts."},
    {"date": "2026-05-23", "asset_type": "Reel cover", "asset_slug": "reel-05-california-guide", "title": "California guide reel", "goal": "Wrap the launch period with a practical resource reel.", "notes": "Link back to the guide in stories."},
]

MONTH_2_CALENDAR_ROWS: List[Dict[str, str]] = [
    {"date": "2026-05-26", "asset_type": "Feed carousel", "asset_slug": "post-11-adulthood-work-and-independent-living", "title": "Adulthood, Work, and Independent Living", "goal": "Show that support continues across the whole lifespan.", "notes": "Good post to share into stories with a question box about adulthood resources."},
    {"date": "2026-05-28", "asset_type": "Story text overlay", "asset_slug": "story-11-adulthood-work-and-independent-living", "title": "Story reminder for adulthood support", "goal": "Bring people back to the carousel after the first post day.", "notes": "Add a link sticker to the site if available."},
    {"date": "2026-05-30", "asset_type": "Reel cover", "asset_slug": "reel-06-adulthood", "title": "Adulthood reel", "goal": "Expand reach with a quick reel on adult resources.", "notes": "Use short clips of the adulthood-related sections and supporting text."},
    {"date": "2026-06-02", "asset_type": "Feed carousel", "asset_slug": "post-12-haircuts-grooming-and-sensory-care", "title": "Haircuts, Grooming, and Sensory Care", "goal": "Highlight highly practical family support again.", "notes": "Strong candidate for a saved post."},
    {"date": "2026-06-04", "asset_type": "Reel cover", "asset_slug": "reel-07-grooming", "title": "Haircuts and sensory care reel", "goal": "Reach families searching for everyday support.", "notes": "Keep it calm, practical, and visual."},
    {"date": "2026-06-09", "asset_type": "Feed carousel", "asset_slug": "post-13-caregiver-support-and-home-based-help", "title": "Caregiver Support and Home-Based Help", "goal": "Acknowledge and support the people carrying the daily load.", "notes": "Pair with a gentle story prompt asking what support feels hardest to find."},
    {"date": "2026-06-11", "asset_type": "Story text overlay", "asset_slug": "story-13-caregiver-support-and-home-based-help", "title": "Story reminder for caregiver support", "goal": "Drive more saves and shares after the main post.", "notes": "Add a support-oriented sticker or poll."},
    {"date": "2026-06-13", "asset_type": "Reel cover", "asset_slug": "reel-08-caregiver-support", "title": "Caregiver support reel", "goal": "Reach families and caregivers who need home-based help.", "notes": "Use simple on-screen text and an encouraging tone."},
    {"date": "2026-06-16", "asset_type": "Feed carousel", "asset_slug": "post-14-safer-community-and-verified-support", "title": "Safer Community and Verified Support", "goal": "Show that Guiding Light is designed to feel dependable, not only useful.", "notes": "Pair with a story slide about trust and accountability."},
    {"date": "2026-06-18", "asset_type": "Reel cover", "asset_slug": "reel-09-safer-community", "title": "Safer community reel", "goal": "Explain trust and moderation in a lighter, easier-to-share format.", "notes": "Keep the reel short and values-centered."},
    {"date": "2026-06-23", "asset_type": "Feed carousel", "asset_slug": "post-15-why-guiding-light-exists", "title": "Why Guiding Light Exists", "goal": "Reconnect the brand to your founder story and heart.", "notes": "Good candidate to pin or repost later."},
    {"date": "2026-06-25", "asset_type": "Reel cover", "asset_slug": "reel-10-founder-story", "title": "Founder story reel", "goal": "Close out month two with a personal, values-led story.", "notes": "Use voiceover if you want this to feel especially personal."},
]


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


def build_story_overlay(post: Dict, index: int) -> Image.Image:
    first_slide = post["slides"][0]
    image = make_gradient(TONE_BG[first_slide.get("tone", "brand")], VERTICAL_WIDTH, VERTICAL_HEIGHT)
    draw = ImageDraw.Draw(image)

    if first_slide.get("imageSrc"):
        add_photo(image, PUBLIC_ROOT / first_slide["imageSrc"])
        draw = ImageDraw.Draw(image)

    draw_brand_mark(draw, 76, 120, scale=1.0)

    top_label_font = load_font(TITLE_FONT, 34)
    title_font = load_font(TITLE_FONT, 94)
    body_font = load_font(TITLE_FONT, 42)
    cta_font = load_font(TITLE_FONT, 38)

    draw.text((88, 360), f"STORY {index:02}", font=top_label_font, fill=(255, 255, 255, 220))
    title_lines = wrap_paragraph(post["title"], title_font, 820, 4)
    draw_text_block(draw, 88, 430, title_lines, title_font, "white", 104)

    body_y = 430 + len(title_lines) * 104 + 48
    story_body = first_slide["body"]
    body_lines = wrap_paragraph(story_body, body_font, 760, 5)
    draw_text_block(draw, 88, body_y, body_lines, body_font, (255, 255, 255, 235), 60)

    cta_box = (88, 1540, 992, 1732)
    draw.rounded_rectangle(cta_box, radius=44, fill=(13, 19, 39, 64))
    draw.text((126, 1596), "Tap into the full carousel on the grid", font=cta_font, fill="white")
    draw.text((126, 1650), INSTAGRAM_HANDLE, font=load_font(TITLE_FONT, 34), fill=(255, 255, 255, 220))
    return image.convert("RGB")


def clean_story_slug(post_slug: str) -> str:
    parts = post_slug.split("-")
    if len(parts) > 2:
        return "-".join(parts[2:])
    return post_slug


def sanitize_beat_text(text: str) -> str:
    replacements = (
        ("Show ", ""),
        ("Open with ", ""),
        ("Point to ", ""),
        ("End with ", ""),
        ("Close with ", ""),
        ("Layer in ", ""),
        ("Use ", ""),
    )
    cleaned = text.strip()
    for prefix, replacement in replacements:
        if cleaned.startswith(prefix):
            cleaned = replacement + cleaned[len(prefix) :]
    return cleaned[:1].upper() + cleaned[1:] if cleaned else text


def build_reel_text_frame(item: Dict, title: str, body: str, step_label: str, footer: str) -> Image.Image:
    image = make_gradient(TONE_BG[item["tone"]], VERTICAL_WIDTH, VERTICAL_HEIGHT)
    draw = ImageDraw.Draw(image)

    draw_brand_mark(draw, 84, 120, scale=0.92)

    pill = (82, 300, 404, 374)
    draw.rounded_rectangle(pill, radius=34, fill=(255, 255, 255, 42))
    draw.text((118, 320), step_label.upper(), font=load_font(TITLE_FONT, 28), fill="white")

    title_font = load_font(TITLE_FONT, 92)
    body_font = load_font(TITLE_FONT, 42)
    footer_font = load_font(TITLE_FONT, 34)

    title_lines = wrap_paragraph(title, title_font, 860, 4)
    draw_text_block(draw, 92, 430, title_lines, title_font, "white", 104)

    body_y = 430 + len(title_lines) * 104 + 38
    body_lines = wrap_paragraph(body, body_font, 820, 5)
    draw_text_block(draw, 92, body_y, body_lines, body_font, (255, 255, 255, 230), 58)

    footer_box = (84, 1664, 996, 1834)
    draw.rounded_rectangle(footer_box, radius=42, fill=(13, 19, 39, 62))
    draw.text((124, 1710), footer, font=footer_font, fill="white")
    draw.text((124, 1762), INSTAGRAM_HANDLE, font=load_font(BODY_FONT, 30), fill=(255, 255, 255, 220))
    return image.convert("RGB")


def zoom_frame(image: Image.Image, progress: float) -> np.ndarray:
    scale = 1.0 + 0.05 * progress
    new_width = int(image.width * scale)
    new_height = int(image.height * scale)
    resized = image.resize((new_width, new_height), resample=Image.Resampling.LANCZOS)
    left = (new_width - image.width) // 2
    top = (new_height - image.height) // 2
    cropped = resized.crop((left, top, left + image.width, top + image.height))
    return np.asarray(cropped, dtype=np.uint8)


def build_reel_video_frames(item: Dict) -> List[Image.Image]:
    cta_title = "Follow for calmer support that feels more human."
    cta_body = f"Save this reel, visit {SITE_URL}, and share it with someone who needs a softer place to begin."
    beat_texts = [sanitize_beat_text(beat) for beat in item["beats"][:3]]

    return [
        build_reel_cover(item),
        build_reel_text_frame(item, item["hook"], item["subtitle"], "Hook", "Start here"),
        build_reel_text_frame(item, beat_texts[0], "Keep the pace calm, clear, and easy to save for later.", "Step 1", "Guiding Light support"),
        build_reel_text_frame(item, beat_texts[1], "Show one useful step at a time so viewers can picture what support looks like.", "Step 2", "Useful, not overwhelming"),
        build_reel_text_frame(item, cta_title, cta_body, "Call to action", "theguidinglight.com"),
    ]


def write_reel_videos() -> None:
    fps = 24
    scene_frames = fps * 2
    transition_frames = int(fps * 0.4)

    for item in REELS:
        video_path = REEL_VIDEOS_ROOT / f"{item['slug']}.mp4"
        frames = build_reel_video_frames(item)

        with imageio.get_writer(
            video_path,
            fps=fps,
            codec="libx264",
            quality=8,
            macro_block_size=None,
            pixelformat="yuv420p",
        ) as writer:
            for index, frame in enumerate(frames):
                for frame_index in range(scene_frames):
                    progress = frame_index / max(scene_frames - 1, 1)
                    writer.append_data(zoom_frame(frame, progress))

                if index == len(frames) - 1:
                    continue

                next_frame = frames[index + 1]
                current_end = zoom_frame(frame, 1.0).astype(np.float32)
                next_start = zoom_frame(next_frame, 0.0).astype(np.float32)

                for transition_index in range(transition_frames):
                    mix = (transition_index + 1) / (transition_frames + 1)
                    blended = ((1 - mix) * current_end + mix * next_start).clip(0, 255).astype(np.uint8)
                    writer.append_data(blended)


def write_calendar_file(rows: List[Dict[str, str]], md_path: Path, csv_path: Path, title: str, intro: str) -> None:
    md_lines = [
        f"# {title}",
        "",
        intro,
        "",
        "| Date | Asset type | Title | Goal | Notes |",
        "| --- | --- | --- | --- | --- |",
    ]

    for row in rows:
        md_lines.append(
            f"| {row['date']} | {row['asset_type']} | {row['title']} | {row['goal']} | {row['notes']} |"
        )

    md_path.write_text("\n".join(md_lines) + "\n", encoding="utf-8")

    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = DictWriter(handle, fieldnames=["date", "asset_type", "asset_slug", "title", "goal", "notes"])
        writer.writeheader()
        writer.writerows(rows)


def write_root_readme() -> None:
    readme_lines = [
        "# Guiding Light Instagram Launch Kit",
        "",
        "These are ready-to-upload social assets for Instagram.",
        "",
        "Instagram profile: https://www.instagram.com/theguidinglightconnect/",
        "",
        "## Where the upload files are",
        "",
        "- Feed carousels: `posts/`",
        "- Story highlight covers: `story-highlights/`",
        "- Reel covers: `reel-covers/`",
        "- Reel scripts: `reel-scripts/`",
        "- Reel videos: `reel-videos/`",
        "- Story text overlays: `story-text-overlays/`",
        "- Launch calendars: `launch-calendar/`",
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


def write_caption_files() -> None:
    captions_md: List[str] = []
    caption_variations_md: List[str] = ["# Guiding Light Caption Variations", ""]

    for index, post in enumerate(POSTS, start=1):
        post_dir = POSTS_ROOT / post["slug"]
        post_dir.mkdir(parents=True, exist_ok=True)

        (post_dir / "caption.txt").write_text(f"{post['title']}\n\n{post['caption']}\n", encoding="utf-8")
        captions_md.append(f"## Post {index}: {post['title']}\n\n{post['caption']}\n")

        caption_variations_md.append(f"## Post {index}: {post['title']}")
        caption_variations_md.append("")
        for variation_index, variation in enumerate(post["caption_variations"], start=1):
            variation_path = post_dir / f"caption-alt-{variation_index:02}.txt"
            variation_path.write_text(f"{post['title']} (Alt {variation_index})\n\n{variation}\n", encoding="utf-8")
            caption_variations_md.append(f"### Alt {variation_index}")
            caption_variations_md.append("")
            caption_variations_md.append(variation)
            caption_variations_md.append("")

    (OUTPUT_ROOT / "captions.md").write_text("\n".join(captions_md), encoding="utf-8")
    (OUTPUT_ROOT / "caption-variations.md").write_text("\n".join(caption_variations_md), encoding="utf-8")


def write_reel_scripts() -> None:
    reel_index_md: List[str] = ["# Guiding Light Reel Scripts", ""]

    for index, reel in enumerate(REELS, start=1):
        script_path = REEL_SCRIPTS_ROOT / f"{reel['slug']}.md"
        lines = [
            f"# {reel['title']}",
            "",
            f"Cover file: ../reel-covers/{reel['slug']}.png",
            "",
            f"Hook: {reel['hook']}",
            "",
            "## Voiceover",
            "",
            reel["voiceover"],
            "",
            "## Shot list",
            "",
        ]
        for beat_index, beat in enumerate(reel["beats"], start=1):
            lines.append(f"{beat_index}. {beat}")
        lines.extend(
            [
                "",
                "## Caption",
                "",
                reel["caption"],
                "",
            ]
        )
        script_path.write_text("\n".join(lines), encoding="utf-8")

        reel_index_md.extend(
            [
                f"## Reel {index}: {reel['title']}",
                "",
                f"Hook: {reel['hook']}",
                "",
                reel["caption"],
                "",
            ]
        )

    (OUTPUT_ROOT / "reel-scripts.md").write_text("\n".join(reel_index_md), encoding="utf-8")


def export_assets() -> None:
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    POSTS_ROOT.mkdir(parents=True, exist_ok=True)
    HIGHLIGHTS_ROOT.mkdir(parents=True, exist_ok=True)
    REELS_ROOT.mkdir(parents=True, exist_ok=True)
    REEL_SCRIPTS_ROOT.mkdir(parents=True, exist_ok=True)
    REEL_VIDEOS_ROOT.mkdir(parents=True, exist_ok=True)
    STORY_OVERLAYS_ROOT.mkdir(parents=True, exist_ok=True)
    CALENDAR_ROOT.mkdir(parents=True, exist_ok=True)

    write_root_readme()
    write_caption_files()
    write_reel_scripts()
    write_reel_videos()

    for post in POSTS:
        post_dir = POSTS_ROOT / post["slug"]
        for slide_index, slide in enumerate(post["slides"], start=1):
            image = build_slide(slide, slide_index - 1, len(post["slides"]))
            image.save(post_dir / f"slide-{slide_index:02}.png", format="PNG", optimize=True)

    for index, post in enumerate(POSTS, start=1):
        story = build_story_overlay(post, index)
        story.save(STORY_OVERLAYS_ROOT / f"story-{index:02}-{clean_story_slug(post['slug'])}.png", format="PNG", optimize=True)

    for item in HIGHLIGHTS:
        image = build_highlight_cover(item)
        image.save(HIGHLIGHTS_ROOT / f"{item['slug']}.png", format="PNG", optimize=True)

    for item in REELS:
        image = build_reel_cover(item)
        image.save(REELS_ROOT / f"{item['slug']}.png", format="PNG", optimize=True)

    write_calendar_file(
        MONTH_1_CALENDAR_ROWS,
        CALENDAR_ROOT / "launch-calendar.md",
        CALENDAR_ROOT / "launch-calendar.csv",
        "Guiding Light Instagram Launch Calendar",
        "This calendar starts on Tuesday, April 21, 2026 and gives you a clear order for feed posts, story highlight setup, and reel covers.",
    )
    write_calendar_file(
        MONTH_2_CALENDAR_ROWS,
        CALENDAR_ROOT / "month-2-launch-calendar.md",
        CALENDAR_ROOT / "month-2-launch-calendar.csv",
        "Guiding Light Instagram Month 2 Calendar",
        "This follow-up calendar extends the content plan through late May and June with a third batch of feed posts, story reminders, and extra reel covers.",
    )

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
