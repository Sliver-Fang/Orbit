import { Palette, Quote } from "../types";

export const COLOR_PALETTES: Palette[] = [
  {
    id: "mint-breeze",
    name: "Mint Breeze 🌱",
    accent: "#0d9488", // teal-600
    accentHover: "#0f766e", // teal-700
    bgLight: "bg-emerald-50/50",
    cardLight: "bg-white",
    bgDark: "bg-zinc-950",
    cardDark: "bg-zinc-900 border-zinc-800",
    textLight: "text-emerald-950",
    borderLight: "border-emerald-100",
    borderDark: "border-zinc-800",
    gradientStart: "from-emerald-500",
    gradientEnd: "to-teal-600"
  },
  {
    id: "ocean-slate",
    name: "Ocean Slate 🌊",
    accent: "#0284c7", // sky-600
    accentHover: "#0369a1", // sky-700
    bgLight: "bg-sky-50/50",
    cardLight: "bg-white",
    bgDark: "bg-slate-950",
    cardDark: "bg-slate-900 border-slate-800",
    textLight: "text-sky-950",
    borderLight: "border-sky-100",
    borderDark: "border-slate-800",
    gradientStart: "from-sky-500",
    gradientEnd: "to-indigo-600"
  },
  {
    id: "lavender-fog",
    name: "Lavender Fog 🔮",
    accent: "#7c3aed", // violet-600
    accentHover: "#6d28d9", // violet-700
    bgLight: "bg-violet-50/40",
    cardLight: "bg-white",
    bgDark: "bg-stone-950",
    cardDark: "bg-stone-900 border-stone-800",
    textLight: "text-violet-950",
    borderLight: "border-violet-100",
    borderDark: "border-stone-800",
    gradientStart: "from-violet-500",
    gradientEnd: "to-fuchsia-600"
  },
  {
    id: "peach-sorbet",
    name: "Peach Sorbet 🍑",
    accent: "#ea580c", // orange-600
    accentHover: "#ca8a04", // yellow-600
    bgLight: "bg-amber-50/50",
    cardLight: "bg-white",
    bgDark: "bg-neutral-950",
    cardDark: "bg-neutral-900 border-neutral-800/80",
    textLight: "text-amber-950",
    borderLight: "border-orange-100/80",
    borderDark: "border-neutral-800",
    gradientStart: "from-orange-500",
    gradientEnd: "to-amber-500"
  },
  {
    id: "rose-bloom",
    name: "Dusk Rose 🌹",
    accent: "#db2777", // pink-600
    accentHover: "#be185d", // pink-700
    bgLight: "bg-rose-50/40",
    cardLight: "bg-white",
    bgDark: "bg-zinc-950",
    cardDark: "bg-zinc-900 border-zinc-800",
    textLight: "text-rose-950",
    borderLight: "border-rose-100",
    borderDark: "border-zinc-800/80",
    gradientStart: "from-rose-500",
    gradientEnd: "to-rose-700"
  },
  {
    id: "monochrome",
    name: "Chic Obsidian 🕶️",
    accent: "#18181b", // zinc-900
    accentHover: "#3f3f46", // zinc-700
    bgLight: "bg-zinc-50",
    cardLight: "bg-white",
    bgDark: "bg-black",
    cardDark: "bg-zinc-900 border-zinc-800",
    textLight: "text-zinc-900",
    borderLight: "border-zinc-200",
    borderDark: "border-zinc-900",
    gradientStart: "from-zinc-700",
    gradientEnd: "to-zinc-950"
  }
];

export const ROOT_QUOTES: Quote[] = [
  {
    id: "1",
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "Habits"
  },
  {
    id: "2",
    text: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock",
    category: "Routine"
  },
  {
    id: "3",
    text: "It is easier to prevent bad habits than to break them.",
    author: "Benjamin Franklin",
    category: "Not-to-do"
  },
  {
    id: "4",
    text: "Focus is a muscle, and you build it through conscious distraction-free sessions.",
    author: "Focus Guide",
    category: "Focus"
  },
  {
    id: "5",
    text: "Do not watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "Perseverance"
  },
  {
    id: "6",
    text: "Atomic modifications in daily rituals yield colossal leaps in life quality.",
    author: "James Clear",
    category: "Atomic Habits"
  },
  {
    id: "7",
    text: "Your focus determines your reality.",
    author: "Qui-Gon Jinn",
    category: "Focus"
  },
  {
    id: "8",
    text: "Chains of habit are too light to be felt until they are too heavy to be broken.",
    author: "Samuel Johnson",
    category: "Warning"
  },
  {
    id: "9",
    text: "Beware of tiny leaks; a small leak will sink a great ship.",
    author: "Benjamin Franklin",
    category: "Not-to-do"
  }
];

// Synth Audio Helper
export const playSoundWave = (type: 'success' | 'click' | 'ticking' | 'alarm') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      // Warm bell chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'click') {
      // Subtle organic button click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'ticking') {
      // Very soft focal click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } else if (type === 'alarm') {
      // Beautiful repeated chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Audio Context synth not supported on this active gesture or browser restrictions", e);
  }
};

// Date helper: Returns simple localized YYYY-MM-DD
export const getLocalDateString = (offsetDays = 0): string => {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Day-of-week formatter
export const getDayOfWeekLabel = (dateStr: string): string => {
  const dateObj = new Date(dateStr + "T00:00:00");
  return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
};

// Month-day formatter
export const getMonthDayLabel = (dateStr: string): string => {
  const dateObj = new Date(dateStr + "T00:00:00");
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
