// Default website content.
// This is exactly what the website showed before content became editable.
// If the admin hasn't saved a section yet (or Firebase can't load), these show.
// Admin edits are saved in Firestore: siteContent/{section} -> field "content".

export const SITE_DEFAULTS = {
  festival: {
    enabled: false,
    theme: "red",
    eyebrow: "FESTIVAL SPECIAL",
    title: "Happy Diwali",
    subtitle: "Light up your brand this festive season.",
    offerText: "Flat 20% OFF on all shoots booked this week",
    image: "",
    buttonText: "Book Your Slot",
    buttonLink: "#booking",
    showConfetti: true,
    startDate: "",
    endDate: "",
  },

  intro: {
    brandWords: ["ONE", "MORE", "TAKE"],
    slogan: ["SHOOT", "CUT", "READY"],
  },

  hero: {
    eyebrow: "CREATIVE VIDEO PRODUCTION STUDIO",
    titleLines: [
      { text: "IDEAS", style: "normal" },
      { text: "DESERVE", style: "normal" },
      { text: "A BETTER", style: "red" },
      { text: "TAKE.", style: "outline" },
    ],
    description:
      "We shoot. We edit. We create.\nVisual stories that make people stop,\nwatch and remember.",
    primaryButton: "Explore Our Work",
    secondaryButton: "Discover Our Services",
    stats: [
      { value: "01", label: "CREATIVE STUDIO" },
      { value: "∞", label: "STORIES TO TELL" },
      { value: "4K", label: "DETAIL IN EVERY FRAME" },
    ],
    cameraTag: "PRODUCTION IN PROGRESS",
    captionLeft: "CAM 01 / MAIN SHOT",
    captionRight: "● REC",
    handwriting: ["Shoot.", "Edit.", "Create.", "Inspire."],
    scrollHint: "SCROLL TO EXPLORE",
  },

  marquee: {
    items: [
      "VIDEO PRODUCTION",
      "CREATIVE STORYTELLING",
      "SOCIAL REELS",
      "PODCAST PRODUCTION",
      "CINEMATIC EDITING",
    ],
  },

  about: {
    label: "WHO WE ARE",
    titleLines: ["We don't just", "make"],
    titleAccent: "videos.",
    accentNewLine: false,
    leadText: "We turn ideas into visual experiences\npeople actually want to watch.",
    paragraphs: [
      "From the first frame to the final cut, One More Take brings production and post-production together under one roof.",
      "Camera, lighting, editing, sound, motion and storytelling — every detail works together to make your story feel bigger.",
    ],
    signatureLight: "GOOD FRAMES.",
    signatureBold: "BETTER STORIES.",
    linkText: "DISCOVER WHAT WE DO",
  },

  services: {
    label: "WHAT WE DO",
    titleLines: ["Creative work."],
    titleAccent: "Every frame.",
    accentNewLine: true,
    intro:
      "We bring ideas to life through production, editing and visual storytelling. One creative partner, from the first idea to the final frame.",
    items: [
      {
        title: "AI Video Generation",
        description:
          "Transform ideas into stunning AI-powered videos with creative visuals, cinematic scenes and next-generation storytelling.",
        tags: ["AI Video", "AI Visuals", "Creative Films"],
      },
      {
        title: "Promotional Shoot",
        description:
          "Create compelling promotional films that showcase your brand, products and services with impact.",
        tags: ["Brand Films", "Product Videos", "Commercials"],
      },
      {
        title: "Social Reels",
        description:
          "Engaging short-form videos designed to capture attention and bring your ideas to life on social media.",
        tags: ["Instagram Reels", "Short Videos", "Social Content"],
      },
      {
        title: "Events",
        description:
          "Capture the atmosphere, people and memorable moments of your events through cinematic storytelling.",
        tags: ["Event Coverage", "Highlight Films", "Live Moments"],
      },
      {
        title: "Podcasts",
        description:
          "Professional podcast production with quality visuals and audio to make every conversation stand out.",
        tags: ["Podcast Shoots", "Multi-Camera", "Video Podcasts"],
      },
      {
        title: "Video Editing",
        description:
          "Transform raw footage into polished visual stories with thoughtful editing, pacing and finishing.",
        tags: ["Post-Production", "Color Grading", "Motion Graphics"],
      },
    ],
    bottomText: "HAVE A PROJECT IN MIND?",
    bottomButton: "LET'S CREATE SOMETHING",
  },

  plans: {
    label: "OUR PLANS",
    titleLines: ["CHOOSE YOUR"],
    titleAccent: "CONTENT LEVEL.",
    accentNewLine: true,
    intro: "Start where you are. Upgrade as your brand grows.",
    priceSuffix: "/ month",
    items: [
      {
        number: "01",
        name: "SILVER",
        title: "Content Starter",
        description:
          "Start creating professional and consistent content for your brand.",
        price: 9999,
        oldPrice: 0,
        Reels: "8 Reels  2  Ads",
        discount: "",
        icon: "◉",
        popular: false,
        tags: ["Planning", "Shoot", "Reels"],
        includes: [
          {
            title: "Content Strategy",
            items: ["Initial content planning", "Topic recommendations", "Content calendar"],
          },
          {
            title: "Production",
            items: ["Professional video shoot", "Professional photography", "Reels : 8 Reels  2  Ads"],
          },
          {
            title: "Content Creation",
            items: ["Edited Reels", "Branded visual content", "Captions / content support"],
          },
          {
            title: "Content Support",
            items: ["Content organization", "Publishing-ready assets"],
          },
        ],
        outcome: "A professional foundation for your digital presence.",
      },
      {
        number: "02",
        name: "GOLD",
        title: "Authority Builder",
        description:
          "Build a recognizable personal brand through consistent strategic content.",
        price: 17499,
        oldPrice: 24999,
        Reels: "15 Reels  3  Ads",
        discount: "30% OFF ON First Shoot",
        icon: "✦",
        popular: true,
        tags: ["Strategy", "Content", "Brand"],
        includes: [
          {
            title: "Strategy",
            items: [
              "Personal brand positioning",
              "Content pillars",
              "Monthly content strategy",
              "Topic & hook development",
            ],
          },
          {
            title: "Production",
            items: [
              "Regular professional shoots",
              "Professional photography",
              "Multiple content formats",
              "Reels : 15 Reels  3  Ads",
            ],
          },
          {
            title: "Content Creation",
            items: [
              "Higher-volume Reels",
              "Educational videos",
              "FAQ content",
              "Authority content",
              "Personal brand content",
              "Clinic / brand content",
            ],
          },
          {
            title: "Content Management",
            items: [
              "Content calendar",
              "Publishing support",
              "Profile / content optimization",
              "Monthly content review",
            ],
          },
        ],
        outcome: "Become more visible for what you already know.",
      },
      {
        number: "03",
        name: "PLATINUM",
        title: "Digital Authority System",
        description:
          "Build a complete long-term content and personal brand ecosystem.",
        price: 34999,
        oldPrice: 49999,
        Reels: "30 Reels  6  Ads",
        discount: "30% OFF ON First Shoot",
        icon: "◎",
        popular: false,
        tags: ["30-Day Plan", "Long-form", "Growth"],
        includes: [
          {
            title: "Strategic Brand Development",
            items: [
              "Personal brand strategy",
              "Professional positioning",
              "Audience definition",
              "Content architecture",
              "30-day content roadmap",
            ],
          },
          {
            title: "Premium Production",
            items: [
              "Structured shoot days",
              "Multiple video formats",
              "Professional photography",
              "Educational content",
              "Authority content",
              "Story-driven content",
              "Promotional content",
              "Long-form content",
              "Reels : 30 Reels  10  Ads",
            ],
          },
          {
            title: "Content Operations",
            items: [
              "Content calendar",
              "Publishing workflow",
              "Content library",
              "Performance review",
              "Content optimization",
            ],
          },
        ],
        outcome: "A digital presence designed as a long-term professional asset.",
      },
      {
        number: "04",
        name: "DIAMOND",
        title: "Complete Brand Partner",
        description:
          "One team managing your complete strategy, production and content journey.",
        price: 99999,
        oldPrice: 129999,
        Reels: "30 Reels  10  Ads",
        discount: "Digital Marketing Service",
        icon: "◆",
        popular: false,
        tags: ["Strategy", "Production", "Management"],
        includes: [
          {
            title: "Strategy",
            items: [
              "Brand positioning",
              "Content strategy",
              "30-day planning",
              "Campaign concepts",
              "Content architecture",
            ],
          },
          {
            title: "Production",
            items: [
              "Regular professional shoots",
              "Photography",
              "Educational videos",
              "Brand films",
              "Promotional videos",
              "Long-form content",
              "Reels : 30 Reels  10  Ads",
              "Digital Marketing Service",
            ],
          },
          {
            title: "Content",
            items: [
              "Reels",
              "Short-form videos",
              "Educational series",
              "Authority series",
              "FAQ series",
              "Storytelling",
              "Clinic / hospital content",
            ],
          },
          {
            title: "Management",
            items: [
              "Content calendar",
              "Publishing support",
              "Content library",
              "Monthly review",
              "Creative optimization",
            ],
          },
        ],
        outcome: "One team for your complete content journey.",
      },
    ],
    helpTitle: "NOT SURE WHICH PLAN?",
    helpText: "Open a plan to see exactly what's included.",
    customTitle: "HAVE A DIFFERENT REQUIREMENT?",
    customText: "Create a quotation tailored to your specific project.",
  },

  process: {
    label: "THE PROCESS",
    titleLines: ["FROM", "FOOTAGE", "TO"],
    titleAccent: "IMPACT.",
    accentNewLine: false,
    intro: "Ideas go through many frames.\nWe make the final one unforgettable.",
    steps: [
      { title: "PLAN", text: "Understand" },
      { title: "SHOOT", text: "Capture" },
      { title: "EDIT", text: "Bring it alive" },
      { title: "COLOR", text: "Set the mood" },
      { title: "DELIVER", text: "Make it perform" },
    ],
  },

  work: {
    label: "FEATURED WORK",
    titleLines: ["REAL STORIES.", "REAL"],
    titleAccent: "IMPACT.",
    accentNewLine: false,
    description: "Five ways we bring ideas to life through the lens.",
    buttonText: "Start a Project",
    projects: [
      {
        title: "Promotional Shoot",
        category: "PROMOTIONAL FILMS",
        image:
          "https://res.cloudinary.com/db4faz2rs/image/upload/v1790834997/One_More_Take__Cinematic_Production_Set_wgexcd.png",
      },
      {
        title: "Social Reels",
        category: "SHORT-FORM CONTENT",
        image:
          "https://res.cloudinary.com/db4faz2rs/image/upload/v1790834834/One_More_Take__Shoot_Cut_Ready_xcpbp9.png",
      },
      {
        title: "Events",
        category: "EVENT VIDEOGRAPHY",
        image:
          "https://res.cloudinary.com/db4faz2rs/image/upload/v1790834832/Event_Videography_in_Action_vg5ttu.png",
      },
      {
        title: "Podcasts",
        category: "PODCAST PRODUCTION",
        image:
          "https://res.cloudinary.com/db4faz2rs/image/upload/v1790834689/One_More_Take_Podcast_Studio_vl8pmk.png",
      },
      {
        title: "Video Editing",
        category: "POST-PRODUCTION",
        image:
          "https://res.cloudinary.com/db4faz2rs/image/upload/v1790835981/One_More_Take_Creative_Studio_nd96gk.png",
      },
    ],
    bottomWords: ["CREATIVE VISION.", "VISUAL STORYTELLING.", "ONE MORE TAKE."],
  },

  experience: {
    label: "OUR EXPERIENCE",
    titleLines: ["EXPERIENCE", "THAT"],
    titleAccent: "SHOWS.",
    accentNewLine: false,
    intro:
      "Years of learning, creating and growing with ambitious brands, professionals and creators.",
    stats: [
      { number: "3+", title: "Years", description: "in the industry" },
      { number: "100+", title: "Projects", description: "delivered" },
      { number: "60+", title: "Clients", description: "worked with" },
      { number: "5+", title: "Industries", description: "served" },
    ],
  },

  gallery: {
    eyebrow: "BEHIND EVERY FRAME",
    titleStart: "Our",
    titleAccent: "Gallery.",
    description: "A closer look at the stories we create.",
    emptyText: "Gallery images will appear here soon.",
  },

  reviews: {
    label: "CLIENT STORIES",
    titleLines: ["WHAT PEOPLE"],
    titleAccent: "SAY ABOUT US.",
    accentNewLine: true,
    intro:
      "The best part of the work is hearing what the story meant to the people we created it for.",
    emptyText: "Client reviews will appear here soon.",
  },

  booking: {
    tag: "LET'S CREATE SOMETHING AMAZING",
    titleStart: "Book Your",
    titleAccent: "Shoot",
    description:
      "Choose your shoot type, select a date and time, and send your booking request to One More Take.",
    shootTypes: ["Studio Shoot", "Outdoor Shoot"],
    timeSlots: [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ],
    whatsappNumber: "917331132227",
    buttonText: "Send Booking Request via WhatsApp",
  },

  contact: {
    label: "LET'S WORK TOGETHER",
    titleLines: ["LET'S CREATE", "SOMETHING"],
    titleAccent: "GREAT.",
    accentNewLine: true,
    intro: "Have a project, brand film,\nreel or content idea?\nTell us what you're thinking.",
    whatsappNumber: "917331132227",
    whatsappMessage: "Hi One More Take, I would like to discuss a project.",
    whatsappButton: "Connect on WhatsApp",
    address: "Hyderabad, Telangana\nIndia",
    email: "onemoretake07@gmail.com",
    phone: "+91 73311 32227",
    hours: "Mon – Sat\n10:00 AM – 7:00 PM",
    script: ["Ideas.", "People.", "Stories."],
  },

  footer: {
    brandName: "ONE MORE TAKE",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    linkedin: "https://www.linkedin.com/",
    copyrightName: "One More Take",
  },
};
