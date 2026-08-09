/**
 * Daily motivational quotes for students and learners.
 * Returns a deterministic quote for any given YYYY-MM-DD date string.
 */

export interface Quote {
  text: string;
  author: string;
}

export const DAILY_QUOTES: Quote[] = [
  { text: "Consistency is what transforms average into excellence.", author: "Anonymous" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You don't have to be extreme, just consistent.", author: "Habit Lore" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Focus on progress, not perfection.", author: "Bill Phillips" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Disciplined mind brings happiness and true accomplishment.", author: "Buddha" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Future rewards belong to those who stay focused today.", author: "Anonymous" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "Mastery requires patience, repetition, and deliberate effort.", author: "Deep Study" },
  { text: "Every day is a fresh opportunity to learn and grow.", author: "Anonymous font" }
];

export function getDailyQuote(dateStr: string): Quote {
  if (!dateStr) return DAILY_QUOTES[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}
