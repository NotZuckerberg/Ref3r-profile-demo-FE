// ── Per-creator demo configs ─────────────────────────────────────────
// Each key is the URL slug: demo.ref3r.com/<slug>
// Add a new prospect = add a new entry here. No redeploy of logic needed,
// just rebuild with the new data (or move this to a fetch() later — see
// loadCreator() in Ref3rProfile.jsx for the seam).
//
// A creator entry has: { creator, collabs, theme? }
//   creator  → profile shown in the hero, stats, highlights
//   collabs  → collaboration tiles
//   theme    → optional palette/font overrides (falls back to DEFAULT_THEME)

export const CREATORS = {
  // ── default / fallback demo ────────────────────────────────────────
  deltss: {
    creator: {
      name: "Shikhar Sangwan",
      handle: "captain.deltss",
      tagline: "Do it now, or forever hold your peace.",
      bio: "Training Hybrid — HIIT / Calisthenics / Bodybuilding",
      location: "India",
      niche: ["Fitness"],
      stats: { ref3rScore: 302, clout: 72100, cloutDelta: 6 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "58.2K" },
        { id: "youtube",   label: "YT", color: "#FF0000", followers: "12.4K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "9.1K" },
        { id: "twitter",   label: "X",  color: "#1DA1F2", followers: "4.3K" },
      ],
      highlights: [
        { platform: "youtube",   title: "How I built a hybrid training split that actually works", duration: "12:48", views: "184K", channel: "Captain Deltss" },
        { platform: "youtube",   title: "My full day of eating on a cut (3,200 kcal)", duration: "8:21", views: "97K", channel: "Captain Deltss" },
        { platform: "instagram", title: "Full upper-body session 💪", duration: "0:58", views: "2.1M", likes: "312K" },
        { platform: "instagram", title: "3 mistakes killing your pull-ups", duration: "0:41", views: "1.4M", likes: "201K" },
        { platform: "tiktok",    title: "POV: leg day done right", duration: "0:22", views: "904K", likes: "88.4K", sound: "original sound - captain.deltss" },
        { platform: "tiktok",    title: "Stop skipping your warm-up 🔥", duration: "0:18", views: "1.2M", likes: "143K", sound: "original sound - captain.deltss" },
        { platform: "twitter",   text: "Most people don't need a new program. They need to run their current one for 12 weeks without quitting. Consistency > novelty. Every time.", likes: "4.2K", retweets: "612", time: "2h" },
        { platform: "twitter",   text: "Reminder: progress isn't linear. A bad week doesn't erase 3 good months. Zoom out.", likes: "8.9K", retweets: "1.3K", time: "1d" },
      ],
    },
    collabs: [
      { id: "c1", brand: "BigMuscles Nutrition", desc: "Use code BMDELTS for an exclusive discount", code: "BMDELTS", verified: true, accent: "#f97316" },
      { id: "c2", brand: "1:1 Coaching", desc: "Personal hybrid training programs", link: "Apply →", verified: false, accent: "#4ade80" },
      { id: "c3", brand: "Gymshark", desc: "Shop my training fits — code DELTS10", code: "DELTS10", verified: true, accent: "#3b82f6" },
      { id: "c4", brand: "Meal Plan PDF", desc: "My exact cutting nutrition guide", link: "Get it →", verified: false, accent: "#a855f7" },
    ],
  },

  // ── example second prospect (fashion) — duplicate & edit per outreach ─
  elena: {
    creator: {
      name: "Elena Vasseur",
      handle: "elenavasseur",
      tagline: "Style is the only language that never goes out of fashion.",
      bio: "Editorial styling · Slow fashion · Paris ⇄ Milan",
      location: "Paris, France",
      niche: ["Fashion"],
      stats: { ref3rScore: 418, clout: 256000, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "412K" },
        { id: "youtube",   label: "YT", color: "#FF0000", followers: "88K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "1.2M" },
        { id: "twitter",   label: "X",  color: "#1DA1F2", followers: "47K" },
      ],
      highlights: [
        { platform: "youtube",   title: "Building a capsule wardrobe that lasts a decade", duration: "14:02", views: "342K", channel: "Elena Vasseur" },
        { platform: "instagram", title: "Tailoring details worth the splurge", duration: "0:54", views: "3.4M", likes: "486K" },
        { platform: "tiktok",    title: "How to spot quality fabric in seconds", duration: "0:24", views: "1.8M", likes: "224K", sound: "original sound - elenavasseur" },
        { platform: "twitter",   text: "Luxury isn't about logos. It's about cut, cloth, and the confidence to wear the same coat for ten years.", likes: "6.1K", retweets: "942", time: "3h" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
      { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },

  allyna: {
    creator: {
      name: "Allyna Wong",
      handle: "allynawong",
      tagline: "i emcee, i dance, i yap",
      bio: "Sharing the li moments in my life",
      location: "Malaysia",
      niche: ["Lifestyle"],
      stats: { ref3rScore: 310, clout: 90000, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "59.5K" },
        { id: "youtube",   label: "YT", color: "#FF0000", followers: "81.1K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "90K" },
      ],
      highlights: [
        { platform: "youtube",   title: "How I Save $$ Living Alone in KL", duration: "10:01", views: "35K", channel: "Allyna Wong" },
        { platform: "instagram", title: "Exploring KL", duration: "1:07", views: "850K", likes: "14.6K" },
        { platform: "tiktok",    title: "Ni style apa?", duration: "0:53", views: "3.8M", likes: "217.7K", sound: "Hari Raya - Najwa Latif" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
      { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },

  mariona: {
    creator: {
      name: "Mariona Roma",
      handle: "mariona.roma",
      tagline: "Style is the only language that never goes out of fashion.",
      bio: "Welcome, pick a flower",
      location: "Barcelona, Spain",
      niche: ["Fashion"],
      stats: { ref3rScore: 305, clout: 1600000, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "1.6M" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "1.4M" },
      ],
      highlights: [
        { platform: "instagram", title: "What a timeless purse ;)", duration: "0:13", views: "14.9M", likes: "1.2M" },
        { platform: "tiktok",    title: "Im not that kind of person...", duration: "0:09", views: "100.9M", likes: "19.4M", sound: "original sound - Mariona.roma" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
      { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },

  shivi: {
    creator: {
      name: "SHIVI GAHLOT",
      handle: "shivii.gahlot",
      tagline: "Fashion. Travel. Lifestyle.",
      bio: "Real eyes realise real lies",
      location: "",
      niche: ["Lifestyle"],
      stats: { ref3rScore: 200, clout: 17600, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "17.6K" },
        { id: "youtube",   label: "YT", color: "#FF0000", followers: "220" },
      ],
      highlights: [
        { platform: "instagram", title: "What a timeless purse ;)", duration: "0:13", views: "14.9M", likes: "1.2M" },
        { platform: "youtube",   title: "First Day in Goa", duration: "13:37", views: "744", channel: "Exclusive Visions of Shivi" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
      { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },

laura: {
    creator: {
      name: "Laura Kam",
      handle: "llaurakam",
      tagline: "",
      bio: "",
      location: "Kuala Lumpur, Malaysia",
      niche: ["Lifestyle"],
      stats: { ref3rScore: 288, clout: 31950, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "31.9K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "61.3K" },
      ],
      highlights: [
        { platform: "instagram", title: "Bestied so hard", duration: "0:10", views: "5.2M", likes: "218K" },
        { platform: "tiktok",    title: "POV: Aquarium date", duration: "0:16", views: "567.9K", likes: "57.3K", sound: "original sound - laura kam" },
      ],
    
      collabs: [
        { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
        { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
      ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
    }
  },

  rohini: {
    creator: {
      name: "Rohini",
      handle: "rohinislm",
      tagline: "Singaporean in Toronto",
      bio: "Editorial styling · Slow fashion · Paris ⇄ Milan",
      location: "Toronto, Canada",
      niche: ["Lifestyle"],
      stats: { ref3rScore: 330, clout: 256000, cloutDelta: 9 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "46.8K" },
        { id: "youtube",   label: "YT", color: "#FF0000", followers: "88K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "1.2M" },
        { id: "twitter",   label: "X",  color: "#1DA1F2", followers: "47K" },
      ],
      highlights: [
        { platform: "youtube",   title: "Building a capsule wardrobe that lasts a decade", duration: "14:02", views: "342K", channel: "Elena Vasseur" },
        { platform: "instagram", title: "Did you know there's over 50 ways to to say love in Tamil?", duration: "0:43", views: "1.2M", likes: "102K" },
        { platform: "tiktok",    title: "Come make Dosa with me", duration: "````````1:36", views: "1.8M", likes: "224K", sound: "original sound - elenavasseur" },
        { platform: "twitter",   text: "Luxury isn't about logos. It's about cut, cloth, and the confidence to wear the same coat for ten years.", likes: "6.1K", retweets: "942", time: "3h" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Maison Lumière", desc: "Atelier capsule — code ELENA15", code: "ELENA15", verified: true, accent: "#b08d4f" },
      { id: "c2", brand: "Styling Sessions", desc: "1:1 personal wardrobe consults", link: "Book now →", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },

  uncadam_: {
    creator: {
      name: "Adam Hamid",
      handle: "uncadam_",
      tagline: "No.1 Malaysian Food Yapper",
      bio: "Contact for work/collab",
      location: "Kuala Lumpur, Malaysia",
      niche: ["Food", "Foodreview", "Travel"] ,
      stats: { ref3rScore: 330, clout: 19551, cloutDelta: 4 },
      socials: [
        { id: "instagram", label: "IG", color: "#E1306C", followers: "9.45K" },
        { id: "tiktok",    label: "TT", color: "#69C9D0", followers: "10.1k" },
      ],
      highlights: [
        { platform: "instagram",   title: "the BEST kari kambing in KL", duration: "14:02", views: "342K", channel: "Elena Vasseur" },
        { platform: "instagram", title: "Burgers outta this world!", duration: "0:43", views: "1.2M", likes: "102K" },
        { platform: "instagram",    title: "Ayam berempah and the mee mamak here is smoking good", duration: "````````1:36", views: "1.8M", likes: "224K", sound: "original sound - elenavasseur" },
        { platform: "tiktok",   text: "The best kari kambing in KL", likes: "6.1K", retweets: "942", time: "3h" },
      ],
    },
    collabs: [
      { id: "c1", brand: "Food panda", desc: "get your free delivery with UNCADAMFP", code: "UNCADAMFP", verified: false, accent: "#b08d4f" },
      { id: "c2", brand: "Grab", desc: "Get RM10 off your next order using this UNCADAMG", code: "UNCADAMG", verified: false, accent: "#8c6f9e" },
    ],
    // optional palette override for this prospect
    theme: { primary: "#b38941", secondary: "#ac5b38", tertiary: "#100c0b" },
  }, 
};

// The slug used when no slug is in the URL (your "showcase" demo).
export const DEFAULT_SLUG = "deltss";
