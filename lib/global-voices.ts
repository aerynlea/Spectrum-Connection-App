export type AutismTerm = {
  country: string;
  language: string;
  localName: string;
  translation: string;
  note: string;
  sourceHref: string;
  sourceLabel: string;
};

export type GlobalPerspective = {
  region: string;
  title: string;
  summary: string;
  takeaway: string;
  sourceHref: string;
  sourceLabel: string;
};

export type PublicVoice = {
  name: string;
  country: string;
  role: string;
  connection: string;
  quote: string;
  story: string;
  articleHref: string;
  articleLabel: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imageCredit: string;
};

export type RepresentationHighlight = {
  label: string;
  title: string;
  summary: string;
  takeaway: string;
  sourceHref: string;
  sourceLabel: string;
};

export const autismTerms: AutismTerm[] = [
  {
    country: "Global health",
    language: "English",
    localName: "autism / autism spectrum disorder (ASD)",
    translation: "A broad medical and community term used in English.",
    note: "WHO describes autism as a diverse group of conditions and uses both autism and autism spectrum disorder.",
    sourceHref:
      "https://www.who.int/westernpacific/newsroom/fact-sheets/detail/autism-spectrum-disorders",
    sourceLabel: "World Health Organization",
  },
  {
    country: "Spain",
    language: "Spanish",
    localName: "trastorno del espectro del autismo (TEA)",
    translation: "Autism spectrum disorder.",
    note: "Autismo España also uses the shorter word autismo alongside TEA.",
    sourceHref: "https://autismo.org.es/el-autismo/que-es-el-autismo/",
    sourceLabel: "Autismo España",
  },
  {
    country: "France",
    language: "French",
    localName: "trouble du spectre de l'autisme (TSA)",
    translation: "Autism spectrum disorder.",
    note: "French information pages often pair TSA with the broader word autisme.",
    sourceHref: "https://www.autismeinfoservice.fr/informer/autisme/definition",
    sourceLabel: "Autisme Info Service",
  },
  {
    country: "Germany",
    language: "German",
    localName: "Autismus-Spektrum-Störung (ASS)",
    translation: "Autism spectrum disorder.",
    note: "German autism organizations also use the shorter word Autismus.",
    sourceHref: "https://www.autismus.de/was-ist-autismus",
    sourceLabel: "autismus Deutschland",
  },
  {
    country: "Brazil",
    language: "Portuguese",
    localName: "Transtorno do Espectro Autista (TEA)",
    translation: "Autism spectrum disorder.",
    note: "Brazilian public health pages use both TEA and autismo.",
    sourceHref:
      "https://www.gov.br/saude/pt-br/assuntos/noticias/2022/abril/tea-saiba-o-que-e-o-transtorno-do-espectro-autista-e-como-o-sus-tem-dado-assistencia-a-pacientes-e-familiares/",
    sourceLabel: "Ministério da Saúde",
  },
  {
    country: "Sweden",
    language: "Swedish",
    localName: "autismspektrumtillstånd",
    translation: "Autism spectrum condition.",
    note: "Autism Sverige uses this term for children, teens, and adults.",
    sourceHref: "https://www.autism.se/stockholms-lan/om-oss/",
    sourceLabel: "Autism Sverige",
  },
  {
    country: "Japan",
    language: "Japanese",
    localName: "自閉スペクトラム症",
    translation: "Autism spectrum condition.",
    note: "The Japan Autism Society uses this wording in policy and advocacy materials.",
    sourceHref: "https://www.autism.or.jp/policy/",
    sourceLabel: "Japan Autism Society",
  },
  {
    country: "China",
    language: "Simplified Chinese",
    localName: "孤独症谱系障碍",
    translation: "Autism spectrum disorder.",
    note: "Government and hospital notices often pair this formal term with 孤独症.",
    sourceHref:
      "https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/202603/t20260306_4550757.html",
    sourceLabel: "Beijing Municipal Government",
  },
  {
    country: "Saudi Arabia",
    language: "Arabic",
    localName: "اضطراب طيف التوحد",
    translation: "Autism spectrum disorder.",
    note: "Saudi health materials use this phrase for autism programs and early support.",
    sourceHref:
      "https://www.moh.gov.sa/Ministry/MediaCenter/News/Pages/News-2014-02-27-003.aspx",
    sourceLabel: "Saudi Ministry of Health",
  },
  {
    country: "Canada",
    language: "French and English",
    localName: "trouble du spectre de l'autisme (TSA) / autism spectrum disorder (ASD)",
    translation: "Bilingual public health language for autism.",
    note: "Canada's health guidance also notes that people use both identity-first and person-first language.",
    sourceHref: "https://www.canada.ca/fr/sante-publique/services/maladies/trouble-spectre-autistique-tsa.html",
    sourceLabel: "Public Health Agency of Canada",
  },
];

export const globalPerspectives: GlobalPerspective[] = [
  {
    region: "World Health Organization",
    title: "Support has to reach beyond clinics.",
    summary:
      "WHO describes autism as diverse and says care should be matched by accessibility, inclusion, and support across community life.",
    takeaway: "A good life depends on both services and welcoming everyday environments.",
    sourceHref:
      "https://www.who.int/westernpacific/newsroom/fact-sheets/detail/autism-spectrum-disorders",
    sourceLabel: "WHO autism fact sheet",
  },
  {
    region: "Canada",
    title: "Support should adapt to the person.",
    summary:
      "Canada's public health guidance says autistic people have different experiences and that supports should adapt to individual needs.",
    takeaway: "The goal is not sameness. It is support that actually fits.",
    sourceHref:
      "https://www.canada.ca/en/public-health/services/diseases/autism-spectrum-disorder-asd.html",
    sourceLabel: "Canada public health overview",
  },
  {
    region: "Spain",
    title: "Quality of life stays at the center.",
    summary:
      "Autismo España highlights support models built around quality of life, evidence-based help, and the autistic person's own interests and strengths.",
    takeaway: "Planning works better when the person stays at the center of the plan.",
    sourceHref:
      "https://autismo.org.es/actualidad/noticias/icalidad-una-herramienta-para-mejorar-la-calidad-de-vida-de-las-personas-con-tea/",
    sourceLabel: "Autismo España on quality of life",
  },
  {
    region: "Europe",
    title: "Participation grows when everyday spaces are accessible.",
    summary:
      "Autism-Europe ties autism support to accessible products, services, and public life so autistic people can participate more fully in society.",
    takeaway: "Inclusion is not just a therapy question. It is a design question too.",
    sourceHref:
      "https://www.autismeurope.org/what-we-do/rights-promotion/european-accessibility-act/",
    sourceLabel: "Autism-Europe on accessibility",
  },
  {
    region: "Japan",
    title: "Families deserve a future where they can live as themselves.",
    summary:
      "The Japan Autism Society describes a future where autistic people and their families can live calmly and authentically, supported by policy and community action.",
    takeaway: "Belonging matters just as much as treatment or diagnosis.",
    sourceHref: "https://www.autism.or.jp/donation/",
    sourceLabel: "Japan Autism Society message",
  },
];

export const homeGlobalHighlights = [
  {
    label: "Languages",
    title: "See how autism is named in different countries.",
    description:
      "Browse official and organization-used terms from Europe, Asia, the Middle East, North America, and South America.",
  },
  {
    label: "Perspectives",
    title: "Notice what support looks like around the world.",
    description:
      "Compare how different communities talk about dignity, belonging, quality of life, and support that fits the person.",
  },
  {
    label: "Representation",
    title: "See stories that make room for families who are too often overlooked.",
    description:
      "Read linked articles and source-backed notes on diagnosis access, equity, and public stories from people speaking openly about autism.",
  },
] as const;

export const representationHighlights: RepresentationHighlight[] = [
  {
    label: "United States data",
    title: "Recognition is changing, but equity work is not finished.",
    summary:
      "CDC says autism is found in every racial, ethnic, and socioeconomic group, and newer data show Black, Hispanic, Asian or Pacific Islander, American Indian or Alaska Native, and multiracial children were more likely to be identified in 2022 than White children in the sampled communities.",
    takeaway:
      "This suggests identification is improving in some historically underserved groups, but families still need faster, fairer access to high-quality evaluation and support.",
    sourceHref:
      "https://www.cdc.gov/autism/data-research/autism-data-visualization-tool.html",
    sourceLabel: "CDC Autism Data Visualization Tool",
  },
  {
    label: "Barrier research",
    title: "Awareness alone does not remove diagnostic barriers.",
    summary:
      "Research on diagnostic disparities describes barriers such as narrow stereotypes of autism, being told to wait, and struggling to turn early concerns into timely referrals and assessment.",
    takeaway:
      "Families of color should not have to piece together support through guesswork, delay, or stigma.",
    sourceHref: "https://pubmed.ncbi.nlm.nih.gov/31211181/",
    sourceLabel: "PubMed study on diagnostic disparities",
  },
  {
    label: "Community leadership",
    title: "Culturally responsive support changes what help feels like.",
    summary:
      "Autism in Black centers advocacy, education, and support built from lived experience in the Black autistic community and speaks directly to the trust gap many families feel.",
    takeaway:
      "Representation matters because language, trust, and community shape whether support feels usable in real life.",
    sourceHref: "https://www.autisminblack.org/",
    sourceLabel: "Autism in Black",
  },
];

export const publicVoices: PublicVoice[] = [
  {
    name: "Temple Grandin",
    country: "United States",
    role: "Professor, inventor, and autism advocate",
    connection: "Open about her autism diagnosis",
    quote: "I want to open doors for other people now.",
    story:
      "Her story highlights how mentors, high expectations, and work built around a real strength can open a meaningful adult life.",
    articleHref:
      "https://newsmediarelations.colostate.edu/2023/11/01/temple-grandin-documentary-premiere/",
    articleLabel: "Read the Colorado State story",
    imageSrc: "/global-voices/temple-grandin.jpg",
    imageAlt: "Temple Grandin speaking and smiling outdoors.",
    imageWidth: 330,
    imageHeight: 462,
    imageCredit: "Photo via Wikimedia Commons",
  },
  {
    name: "Greta Thunberg",
    country: "Sweden",
    role: "Climate activist",
    connection: "Open about being autistic",
    quote: "Being different is a superpower.",
    story:
      "Her public story points to the power of purpose, focus, and being taken seriously instead of being talked around.",
    articleHref:
      "https://www.theguardian.com/environment/2019/sep/02/greta-thunberg-responds-to-aspergers-critics-its-a-superpower",
    articleLabel: "Read the Guardian article",
    imageSrc: "/global-voices/greta-thunberg.jpg",
    imageAlt: "Greta Thunberg looking ahead during a public appearance.",
    imageWidth: 330,
    imageHeight: 443,
    imageCredit: "Photo via Wikimedia Commons",
  },
  {
    name: "Chris Packham",
    country: "United Kingdom",
    role: "Broadcaster, naturalist, and author",
    connection: "Open about being autistic",
    quote: "We are not broken.",
    story:
      "A later diagnosis and a life shaped around nature, truth, and advocacy changed how he understood himself and how others could understand autism.",
    articleHref:
      "https://www.lbc.co.uk/news/health/chris-packham-autism-rfk-jr-health/",
    articleLabel: "Read the LBC interview",
    imageSrc: "/global-voices/chris-packham.jpg",
    imageAlt: "Chris Packham standing outdoors in a dark jacket.",
    imageWidth: 330,
    imageHeight: 382,
    imageCredit: "Photo via Wikimedia Commons",
  },
  {
    name: "Bella Ramsey",
    country: "United Kingdom",
    role: "Actor",
    connection: "Open about being autistic",
    quote: "There's no reason for people not to know.",
    story:
      "Their story shows how recognition, assessment, and self-compassion can make everyday life and creative work feel more understandable.",
    articleHref:
      "https://people.com/the-last-of-us-star-bella-ramsay-reveals-autism-diagnosis-11701279",
    articleLabel: "Read the People article",
    imageSrc: "/global-voices/bella-ramsey.jpg",
    imageAlt: "Bella Ramsey posing in a patterned dark jacket.",
    imageWidth: 330,
    imageHeight: 440,
    imageCredit: "Photo via Wikimedia Commons",
  },
  {
    name: "Holly Robinson Peete",
    country: "United States",
    role: "Actor and parent advocate",
    connection: "Open about her son's diagnosis",
    quote: "Autism does not destroy families.",
    story:
      "Her family's story points to advocacy, access to care, and inclusive work as part of what helps autistic children grow into adult life.",
    articleHref:
      "https://people.com/holly-robinson-peete-responds-rfk-jr-autism-comments-11725491",
    articleLabel: "Read the People article",
    imageSrc: "/global-voices/holly-robinson-peete.jpg",
    imageAlt: "Holly Robinson Peete smiling at a public event.",
    imageWidth: 330,
    imageHeight: 495,
    imageCredit: "Photo via Wikimedia Commons",
  },
];
