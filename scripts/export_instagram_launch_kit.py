from __future__ import annotations

from pathlib import Path
from textwrap import wrap
from typing import Dict, List
import zipfile

from PIL import Image, ImageDraw, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = PROJECT_ROOT / "deliverables" / "instagram-launch-kit"
POSTS_ROOT = OUTPUT_ROOT / "posts"
PUBLIC_ROOT = PROJECT_ROOT / "public"
INSTAGRAM_HANDLE = "@theguidinglightconnect"

TITLE_FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
BODY_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"

WIDTH = 1080
HEIGHT = 1350

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
]

TONE_BG = {
    "brand": ("#445bc4", "#6c63d9", "#ff9c73"),
    "calm": ("#274866", "#3d74a6", "#69b8c9"),
    "warm": ("#704f69", "#d16f8e", "#ffb27f"),
    "spotlight": ("#1f2a4f", "#4d5fd1", "#8c7bea"),
}


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def make_gradient(colors):
    base = Image.new("RGBA", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(base)
    top, mid, bottom = [hex_to_rgb(color) for color in colors]
    for y in range(HEIGHT):
        t = y / max(HEIGHT - 1, 1)
        if t < 0.55:
            ratio = t / 0.55
            color = tuple(int(top[i] + (mid[i] - top[i]) * ratio) for i in range(3))
        else:
            ratio = (t - 0.55) / 0.45
            color = tuple(int(mid[i] + (bottom[i] - mid[i]) * ratio) for i in range(3))
        draw.line([(0, y), (WIDTH, y)], fill=(*color, 255))
    return base


def hex_to_rgb(value: str):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def add_photo(base: Image.Image, photo_path: Path) -> None:
    photo = Image.open(photo_path).convert("RGBA")
    photo_ratio = photo.width / photo.height
    canvas_ratio = WIDTH / HEIGHT

    if photo_ratio > canvas_ratio:
        new_height = HEIGHT
        new_width = int(new_height * photo_ratio)
    else:
        new_width = WIDTH
        new_height = int(new_width / photo_ratio)

    photo = photo.resize((new_width, new_height))
    left = (new_width - WIDTH) // 2
    top = (new_height - HEIGHT) // 2
    photo = photo.crop((left, top, left + WIDTH, top + HEIGHT))
    base.alpha_composite(photo)

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (10, 16, 28, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for y in range(HEIGHT):
        alpha = int(35 + (y / HEIGHT) * 150)
        overlay_draw.line([(0, y), (WIDTH, y)], fill=(10, 16, 28, alpha))
    base.alpha_composite(overlay)


def draw_brand_mark(draw: ImageDraw.ImageDraw) -> None:
    draw.arc((74, 86, 266, 214), start=22, end=162, fill="#73BAFF", width=16)
    draw.arc((88, 142, 322, 284), start=22, end=158, fill="#4D61C8", width=16)
    draw.line((156, 150, 214, 136, 284, 162, 350, 114), fill="white", width=7)
    for x, y, r in [(156, 150, 18), (214, 136, 13), (284, 162, 15)]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill="white")
    draw.text((70, 84), "GUIDING LIGHT", font=load_font(TITLE_FONT, 28), fill=(255, 255, 255, 235))


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
        if not lines[-1].endswith("..."):
            lines[-1] = lines[-1].rstrip("., ") + "..."
    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, x: int, y: int, lines: List[str], font, fill, line_height: int):
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=font, fill=fill)


def build_slide(post: Dict, slide: Dict, slide_index: int, total_slides: int) -> Image.Image:
    canvas = make_gradient(TONE_BG[slide.get("tone", "brand")])

    if slide.get("imageSrc"):
        add_photo(canvas, PUBLIC_ROOT / slide["imageSrc"])

    draw = ImageDraw.Draw(canvas)
    title_font = load_font(TITLE_FONT, 82)
    body_font = load_font(TITLE_FONT, 34)
    eyebrow_font = load_font(TITLE_FONT, 28)
    footer_font = load_font(TITLE_FONT, 30)
    footer_sub_font = load_font(BODY_FONT, 22)
    pill_font = load_font(TITLE_FONT, 26)

    draw_brand_mark(draw)

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


def export_assets():
    if OUTPUT_ROOT.exists():
        for path in sorted(OUTPUT_ROOT.rglob("*"), reverse=True):
            if path.is_file():
                path.unlink()
            elif path.is_dir():
                path.rmdir()

    POSTS_ROOT.mkdir(parents=True, exist_ok=True)

    readme_lines = [
        "# Guiding Light Instagram Launch Kit",
        "",
        "These are ready-to-upload 1080x1350 PNG carousel slides plus one caption per post.",
        "",
        f"Instagram profile: https://www.instagram.com/theguidinglightconnect/",
        "",
    ]

    captions_md: List[str] = []

    for index, post in enumerate(POSTS, start=1):
        post_dir = POSTS_ROOT / post["slug"]
        post_dir.mkdir(parents=True, exist_ok=True)
        readme_lines.append(f"{index}. {post['title']}")
        readme_lines.append(f"   Folder: posts/{post['slug']}")
        readme_lines.append("")

        (post_dir / "caption.txt").write_text(f"{post['title']}\n\n{post['caption']}\n", encoding="utf-8")
        captions_md.append(f"## Post {index}: {post['title']}\n\n{post['caption']}\n")

        for slide_index, slide in enumerate(post["slides"], start=1):
            image = build_slide(post, slide, slide_index - 1, len(post["slides"]))
            image.save(post_dir / f"slide-{slide_index:02}.png", format="PNG", optimize=True)

    (OUTPUT_ROOT / "README.md").write_text("\n".join(readme_lines) + "\n", encoding="utf-8")
    (OUTPUT_ROOT / "captions.md").write_text("\n".join(captions_md), encoding="utf-8")

    zip_path = OUTPUT_ROOT / "guiding-light-instagram-launch-kit.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(OUTPUT_ROOT.rglob("*")):
            if path == zip_path:
                continue
            archive.write(path, path.relative_to(OUTPUT_ROOT))

    print(f"Instagram launch kit exported to {OUTPUT_ROOT}")


if __name__ == "__main__":
    export_assets()
