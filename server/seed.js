// Seed configs used to populate the database the first time the server boots
// against an empty table. After that, edits live in Postgres — this file is
// only the initial content. Keep slugs lowercase.

export const SEED = {
  deltss: {
    creator: {
      name: "Shikhar Sangwan",
      handle: "captain.deltss",
      tagline: "Do it now, or forever hold your peace.",
      bio: "Training Hybrid — HIIT / Calisthenics / Bodybuilding",
      location: "India",
      niche: "Fitness",
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
    theme: null,
  },

  elena: {
    creator: {
      name: "Elena Vasseur",
      handle: "elenavasseur",
      tagline: "Style is the only language that never goes out of fashion.",
      bio: "Editorial styling · Slow fashion · Paris ⇄ Milan",
      location: "Paris, France",
      niche: ["Fashion", "Lifestyle", "Beauty"],
      // avatar: "https://...jpg"  ← optional; paste a URL or upload in /admin
      avatar: "",
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
    theme: { primary: "#b08d4f", secondary: "#1c1614", tertiary: "#100c0b" },
  },
};

export const DEFAULT_SLUG = "deltss";
