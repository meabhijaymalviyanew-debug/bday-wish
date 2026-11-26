export type ChapterId =
  | "cake"
  | "memory"
  | "letter"
  | "remember"
  | "wishes"
  | "finale";

export interface ChapterMeta {
  id: ChapterId;
  label: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: "cake",
    label: "Cake",
    cameraPosition: [0, 3.1, 6.9],
    cameraTarget: [0, 1.35, 0],
  },
  {
    id: "memory",
    label: "Memory",
    cameraPosition: [-4.2, 2.75, 4.9],
    cameraTarget: [-2.15, 1.35, -0.35],
  },
  {
    id: "letter",
    label: "Letter",
    cameraPosition: [3.6, 2.55, 4.7],
    cameraTarget: [1.95, 0.65, 0.75],
  },
  {
    id: "remember",
    label: "Remember",
    cameraPosition: [-2.8, 3.35, 6.2],
    cameraTarget: [0.3, 1.0, 0.2],
  },
  {
    id: "wishes",
    label: "Wishes",
    cameraPosition: [0.8, 4.2, 7.6],
    cameraTarget: [0, 1.7, -0.4],
  },
  {
    id: "finale",
    label: "Finale",
    cameraPosition: [0, 3.6, 8.8],
    cameraTarget: [0, 1.45, -0.2],
  },
];

export const OPENING_COPY = {
  heading: "Hey Riya Didi! 💗",
  subtext: "Someone has made a little something special for you...",
  cta: "Open Your Surprise ✨",
};

export const HERO_COPY = {
  heading: "Happiest Birthday, Riya Didi! 🎂",
  subtext:
    "Today is all about you! Someone who has made a special place in my life deserves a day filled with endless happiness, smiles and beautiful memories.",
  wishButton: "Make a Wish ✨",
  wishGranted: "May all your wishes come true! 💗",
};

export const ILLUSTRATION_CAPTION =
  "A little memory, a lot of happiness. ❤️";

export const LETTER_HEADING = "A Letter From My Heart";

export const LETTER_PARAGRAPHS: string[] = [
  "Riya Didi,",
  "I honestly don't think words will ever be enough to explain how much you mean to me.",
  "Thank you for being there for me during the times when I couldn't even process what was happening in my own life. There were moments when everything felt confusing, when I didn't know what to think or how to deal with things, but somehow, having you around made everything feel a little easier.",
  "Thank you for listening to me, understanding me, supporting me and standing beside me even when I wasn't at my best.",
  "You are genuinely one of the best people I have ever got in my life. I'm so lucky to have someone like you whom I can count on, share random nonsense with, laugh with and talk to without having to think twice.",
  "I hope you never doubt how special you are. You deserve all the happiness, peace, success and beautiful things this world has to offer.",
  "No matter how life changes or how busy things get, I hope you always remember that you have someone who genuinely wishes the best for you.",
  "Thank you for being YOU, Riya Didi. Thank you for being my constant, my comfort and one of the biggest blessings in my life.",
  "I may not say it every day, but I'm genuinely grateful for you.",
  "You are irreplaceable, and I'm really lucky to have you. ❤️",
];

export interface RememberCardItem {
  id: number;
  title: string;
  message: string;
  icon: "heart" | "sun" | "sparkles" | "star" | "flower" | "ribbon";
  tintClass: string;
}

export const REMEMBER_CARDS: RememberCardItem[] = [
  {
    id: 1,
    title: "My Safe Space",
    message: "Thank you for being there when I needed someone the most.",
    icon: "heart",
    tintClass: "bg-[#FFF5F8]",
  },
  {
    id: 2,
    title: "A Little Lighter",
    message: "You make difficult days feel a little easier.",
    icon: "sun",
    tintClass: "bg-[#F8F5FF]",
  },
  {
    id: 3,
    title: "Truly Understood",
    message:
      "Thank you for understanding me even when I couldn't understand myself.",
    icon: "sparkles",
    tintClass: "bg-[#FCF7EE]",
  },
  {
    id: 4,
    title: "Quietly Priceless",
    message: "Your presence means more than you realise.",
    icon: "star",
    tintClass: "bg-[#FFF6FA]",
  },
  {
    id: 5,
    title: "All The Joy",
    message: "You deserve every little bit of happiness life has to offer.",
    icon: "flower",
    tintClass: "bg-[#F9F5FF]",
  },
  {
    id: 6,
    title: "Always In Your Corner",
    message: "I'll always be cheering for you, no matter what.",
    icon: "ribbon",
    tintClass: "bg-[#FDF6EE]",
  },
];

export const HEARTFELT_WISHES: string[] = [
  "May you always find reasons to smile, even on your hardest days.",
  "May all your dreams slowly turn into reality.",
  "May life surprise you with beautiful opportunities.",
  "May you always be surrounded by people who genuinely care.",
  "May you never lose the beautiful person you are.",
];

export const ILLUSTRATION_STORAGE_KEY = "riya_didi_custom_illustration_v1";
