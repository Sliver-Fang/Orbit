export interface Palette {
  id: string;
  name: string;
  accent: string;      // Tailwind-like or Hex color for main buttons & charts
  accentHover: string; // Darker shade for hovers
  bgLight: string;     // Primary background color (light)
  cardLight: string;   // Card background color (light)
  bgDark: string;      // Primary background color (dark)
  cardDark: string;    // Card background (dark)
  textLight: string;   // Primary text or class string
  borderLight: string; // Border color light
  borderDark: string;  // Border color dark
  gradientStart: string; // Accent gradient start
  gradientEnd: string;   // Accent gradient end
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly';
  createdAt: string; // ISO date
  completedDates: string[]; // List of YYYY-MM-DD strings when habit was done
  streak: number;
}

export interface DailyTask {
  id: string;
  name: string;
  isCompleted: boolean;
  assignedDate: string; // YYYY-MM-DD
  completedAt?: string; // ISO string
}

export interface AvoidItem {
  id: string;
  name: string;
  reason?: string;
  timesViolatedToday: number; // Counter for slips
  avoidedToday: boolean;       // Check if successfully avoided today
  category?: string;
}

export interface SleepWakeLog {
  id: string;
  date: string; // YYYY-MM-DD
  wakeTime?: string; // ISO string when turned on
  sleepTime?: string; // ISO string when turned off
  durationHours?: number; // Calculated hours awake/asleep
  status: 'active-awake' | 'active-sleeping' | 'completed';
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  isCustom?: boolean;
}

export interface FocusSession {
  mode: 'focus' | 'short-break' | 'long-break';
  durationMinutes: number;
  timeLeftSeconds: number;
  isRunning: boolean;
  sessionsCompletedToday: number;
}
