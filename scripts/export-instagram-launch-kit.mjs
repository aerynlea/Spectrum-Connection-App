import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const projectRoot = process.cwd();
const outputRoot = join(projectRoot, "deliverables", "instagram-launch-kit");
const postsRoot = join(outputRoot, "posts");

const instagramHandle = "@theguidinglightconnect";

const posts = [
  {
    slug: "post-01-welcome-to-guiding-light",
    title: "Welcome to Guiding Light",
    caption:
      "Welcome to Guiding Light. We created this space for autistic people, parents, caregivers, and support teams who need real-life help that feels calm, clear, and connected. Here you can find trusted resources, inclusive events, honest community conversations, and support that meets you where you are. If you have been looking for a gentler place to begin, we hope this feels like a good first step. Visit theguidinglight.com to explore more. #GuidingLight #AutismSupport #AutismCommunity #Neurodiversity #ParentSupport #ActuallyAutistic",
    slides: [
      {
        eyebrow: "Guiding Light",
        title: "Where every journey connects.",
        body: "A calm support space for autistic people, families, caregivers, and trusted professionals.",
        footer: instagramHandle,
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
    slug: "post-02-start-here-for-families",
    title: "Start Here for Families",
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
    slug: "post-03-global-voices-and-belonging",
    title: "Global Voices and Belonging",
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
    slug: "post-04-calmer-outings-and-everyday-support",
    title: "Calmer Outings and Everyday Support",
    caption:
      "Support is not only about school or therapy. It is also about haircuts, outings, nursing rooms, quiet spaces, sensory-friendly play, and tools that make everyday life feel more manageable. Guiding Light gathers those real-world helps in one place so families can spend less time searching and more time preparing for success. Save this if everyday support is what you need most right now. #SensoryFriendly #AutismOutings #DisabilityAccess #InclusivePlay #AutismTools #FamilySupport",
    slides: [
      {
        eyebrow: "Real life support",
        title: "The small everyday details matter too.",
        body: "Haircuts, play spaces, quiet rooms, and outing plans can change a whole day.",
        imageSrc: "/family/founder-son-portrait-1.jpeg",
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
    slug: "post-05-community-events-and-trusted-guidance",
    title: "Community, Events, and Trusted Guidance",
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
        footer: instagramHandle,
        tone: "brand",
      },
    ],
  },
];

const toneStyles = {
  brand: {
    background:
      "radial-gradient(circle at top left, rgba(143,213,255,0.42), transparent 34%), linear-gradient(145deg, #445bc4 0%, #6c63d9 55%, #ff9c73 100%)",
  },
  calm: {
    background:
      "radial-gradient(circle at top left, rgba(104,200,221,0.36), transparent 34%), linear-gradient(145deg, #274866 0%, #3d74a6 58%, #69b8c9 100%)",
  },
  warm: {
    background:
      "radial-gradient(circle at top left, rgba(255,196,139,0.4), transparent 32%), linear-gradient(145deg, #704f69 0%, #d16f8e 58%, #ffb27f 100%)",
  },
  spotlight: {
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 32%), linear-gradient(145deg, #1f2a4f 0%, #4d5fd1 58%, #8c7bea 100%)",
  },
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toDataUri(filePath) {
  const absolutePath = join(projectRoot, "public", filePath.replace(/^\//, ""));
  const extension = absolutePath.endsWith(".png") ? "png" : absolutePath.endsWith(".webp") ? "webp" : "jpeg";
  const base64 = readFileSync(absolutePath).toString("base64");
  return `data:image/${extension};base64,${base64}`;
}

function buildSvg(post, slide, slideIndex, slideCount) {
  const tone = toneStyles[slide.tone ?? "brand"];
  const imageTag = slide.imageSrc
    ? `<image href="${toDataUri(slide.imageSrc)}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice" />
       <rect x="0" y="0" width="1080" height="1350" fill="url(#photoShade)" />`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="cardTone" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#5a7be8" />
      <stop offset="55%" stop-color="#8572e9" />
      <stop offset="100%" stop-color="#ff9c73" />
    </linearGradient>
    <linearGradient id="photoShade" x1="0%" x2="0%" y1="0%" y2="1">
      <stop offset="0%" stop-color="rgba(18,24,45,0.15)" />
      <stop offset="72%" stop-color="rgba(10,14,26,0.62)" />
      <stop offset="100%" stop-color="rgba(10,14,26,0.78)" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" rx="64" fill="#f4f5ff" />
  <rect x="32" y="32" width="1016" height="1286" rx="56" fill="${tone.background}" />
  ${imageTag}
  <circle cx="918" cy="144" r="74" fill="rgba(255,255,255,0.12)" />
  <path d="M112 148C166 192 236 214 324 186" fill="none" opacity="0.85" stroke="#73BAFF" stroke-linecap="round" stroke-width="16"/>
  <path d="M120 208C194 258 288 258 384 198" fill="none" opacity="0.72" stroke="#4D61C8" stroke-linecap="round" stroke-width="16"/>
  <g fill="#fff">
    <circle cx="180" cy="150" r="18"/>
    <circle cx="230" cy="136" r="13"/>
    <circle cx="288" cy="162" r="15"/>
  </g>
  <path d="M180 150L230 136L288 162L352 112" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="7"/>
  <text x="88" y="114" fill="rgba(255,255,255,0.88)" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="6">GUIDING LIGHT</text>
  <rect x="812" y="88" rx="22" ry="22" width="182" height="58" fill="rgba(255,255,255,0.14)" />
  <text x="903" y="126" fill="#fff" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="22" font-weight="800" text-anchor="middle">${slideIndex + 1}/${slideCount}</text>
  <text x="88" y="310" fill="rgba(255,255,255,0.82)" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="7">${escapeXml(slide.eyebrow.toUpperCase())}</text>
  ${wrapText(88, 380, 904, 106, slide.title, 74, 1.03, 0.3, true)}
  ${wrapText(88, 740, 760, 56, slide.body, 42, 1.48, 0, false)}
  <rect x="88" y="1162" rx="28" ry="28" width="904" height="120" fill="rgba(13,19,39,0.16)" />
  <text x="128" y="1212" fill="#fff" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="28" font-weight="800">${escapeXml(slide.footer ?? instagramHandle)}</text>
  <text x="128" y="1256" fill="rgba(255,255,255,0.82)" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="24">Where Every Journey Connects</text>
  <text x="988" y="1222" fill="#fff7c8" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="42" text-anchor="end">✦</text>
</svg>`;
}

function wrapText(x, y, width, lineHeight, text, fontSize, lineSpacing, letterSpacing, isTitle) {
  const charsPerLine = Math.max(10, Math.floor(width / (fontSize * (isTitle ? 0.72 : 0.56))));
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= charsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines
    .map((line, index) => {
      return `<text x="${x}" y="${y + index * lineHeight}" fill="#ffffff" font-family="Avenir Next, Trebuchet MS, Arial, sans-serif" font-size="${fontSize}" font-weight="${isTitle ? 800 : 600}" letter-spacing="${letterSpacing}"${index > 0 ? "" : ""}>${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writePostCaption(postIndex, post) {
  const captionPath = join(postsRoot, post.slug, "caption.txt");
  writeFileSync(captionPath, `${post.title}\n\n${post.caption}\n`);
}

function renderPosts() {
  rmSync(outputRoot, { recursive: true, force: true });
  ensureDir(postsRoot);

  const summaryLines = [
    "# Guiding Light Instagram Launch Kit",
    "",
    `Profile: https://www.instagram.com/theguidinglightconnect/`,
    "",
    "Each folder below contains ready-to-post 1080x1350 PNG carousel slides plus one caption.txt file.",
    "",
  ];

  posts.forEach((post, postIndex) => {
    const postFolder = join(postsRoot, post.slug);
    ensureDir(postFolder);

    summaryLines.push(`${postIndex + 1}. ${post.title}`);
    summaryLines.push(`   Folder: posts/${post.slug}`);
    summaryLines.push("");

    writePostCaption(postIndex, post);

    post.slides.forEach((slide, slideIndex) => {
      const svgPath = join(postFolder, `slide-${String(slideIndex + 1).padStart(2, "0")}.svg`);
      const pngPath = join(postFolder, `slide-${String(slideIndex + 1).padStart(2, "0")}.png`);
      writeFileSync(svgPath, buildSvg(post, slide, slideIndex, post.slides.length));
      execFileSync("sips", ["-s", "format", "png", svgPath, "--out", pngPath], {
        stdio: "ignore",
      });
      rmSync(svgPath, { force: true });
    });
  });

  writeFileSync(join(outputRoot, "README.md"), `${summaryLines.join("\n")}\n`);
  writeFileSync(
    join(outputRoot, "captions.md"),
    posts
      .map(
        (post, index) =>
          `## Post ${index + 1}: ${post.title}\n\n${post.caption}\n`,
      )
      .join("\n"),
  );

  execFileSync(
    "zip",
    ["-rq", "guiding-light-instagram-launch-kit.zip", "posts", "README.md", "captions.md"],
    {
      cwd: outputRoot,
      stdio: "ignore",
    },
  );
}

ensureDir(dirname(outputRoot));
renderPosts();
console.log(`Instagram launch kit exported to ${outputRoot}`);
