/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color
}

export type ChapterStatus = 'Not Started' | 'In Progress' | 'Revised' | 'Mastered';
export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  status: ChapterStatus;
  completionPct: number; // 0 - 100
  difficulty: DifficultyLevel;
  estimatedTime: number; // in hours
  notes: string;
  revisionsCount: number;
  priority: PriorityLevel;
}

export type StudyMood = 'Happy' | 'Focused' | 'Tired' | 'Stressed' | 'Calm';

export interface StudySession {
  id: string;
  subjectId: string;
  chapterId: string;
  topic: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  productivityRating: number; // 1-5
  focusRating: number; // 1-5
  notes: string;
  mood: StudyMood;
  difficulty: DifficultyLevel;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  reminder: boolean;
  subjectId: string;
  chapterId: string;
  estimatedTime: number; // in minutes
  priority: PriorityLevel;
  status: 'Pending' | 'Completed' | 'Incomplete';
}

export type HabitType = 'Good' | 'Bad';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  successDates: string[]; // YYYY-MM-DD
  failureDates: string[]; // YYYY-MM-DD
  skipDates: string[];    // YYYY-MM-DD
}

export interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  mode: '25/5' | '50/10' | '90/20' | 'Custom';
}

export interface Revision {
  id: string;
  subjectId: string;
  chapterId: string;
  revisionNumber: number;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  retentionRating: number; // 1-5
  nextRevisionDate: string; // YYYY-MM-DD
}

export interface MockTest {
  id: string;
  testName: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  marksObtained: number;
  maxMarks: number;
  rank: string; // e.g. "1", "12/500", "Top 5%"
  mistakes: string[];
  notes: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // YYYY-MM-DD or null
  category: 'study' | 'pomodoro' | 'streak' | 'chapters' | 'tasks';
  targetValue: number;
  icon: string;
}

export interface GamificationState {
  xp: number;
  level: number; // Calculated from XP
  achievements: Achievement[];
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export type AppTheme = 'light' | 'dark' | 'amoled' | 'glass' | 'neumorph' | 'flat';
export type FontSize = 'sm' | 'base' | 'lg';
export type AnimationSpeed = 'fast' | 'normal' | 'slow';

// ==================== FITNESS DATA MODELS ====================

export interface FitnessProfile {
  startingWeight: number; // e.g. 52 kg
  targetWeight: number;   // e.g. 60 kg
  targetWeightRateKgPerWeek: number; // e.g. 0.25 kg/week
  calorieTarget: number;  // e.g. 2200 kcal
  proteinTarget: number;  // e.g. 120 g
  waterTargetMl: number;  // e.g. 3000 ml
  sleepTargetHours: number; // e.g. 8 hrs
  stepTarget: number;     // e.g. 8000 steps
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number; // 0 for bodyweight exercises
  isCompleted: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
}

export type SkippedWorkoutReason = 'Busy' | 'Tired' | 'Pain' | 'Schedule conflict' | 'Other';

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  name: string; // e.g. "Upper Body", "Leg Day", "Push"
  durationMinutes: number;
  status: 'Completed' | 'Skipped';
  skipReason?: SkippedWorkoutReason;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface BodyMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  waist?: number;  // cm or inches
  chest?: number;
  shoulders?: number;
  upperArm?: number;
  thigh?: number;
  neck?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  photoType: 'Front' | 'Side' | 'Back';
  imageUrl: string; // base64 or object URL
  notes?: string;
}

export type NutritionAdherence = 'Hit target' | 'Close' | 'Missed';

export interface NutritionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number; // grams
  waterMl?: number;
  mealsCount?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  notes?: string;
  adherence: NutritionAdherence;
}

export interface RecoveryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: number; // 1-5 rating
  energy: number;       // 1-5 rating
  soreness: number;     // 1-5 rating
  stress: number;       // 1-5 rating
  notes?: string;
}

export interface CardioActivity {
  type: string; // e.g. Running, Cycling, Walking
  durationMinutes: number;
  distanceKm?: number;
}

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  steps?: number;
  cardio?: CardioActivity[];
  activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
}

export interface WeeklyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  averageWeight: number;
  waist?: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  averageProtein: number;
  averageCalories: number;
  averageSleep: number;
  averageSteps: number;
  bestStrengthImprovement?: string;
  energy: number;   // 1-5 rating
  hunger: number;   // 1-5 rating
  recovery: number; // 1-5 rating
  biggestProblem?: string;
  biggestWin?: string;
  anythingUnusual?: string;
  anythingElse?: string; // Large free text field
}

export interface FitnessHabit {
  id: string;
  name: string;
  icon?: string;
  successDates: string[]; // YYYY-MM-DD
  skipDates: string[];    // YYYY-MM-DD
}

export interface FitnessMilestone {
  id: string;
  title: string;
  description: string;
  category: 'weight' | 'strength' | 'measurement' | 'consistency';
  targetValue: number;
  currentValue: number;
  unlockedAt: string | null; // YYYY-MM-DD or null
  icon: string;
}

export interface FitnessState {
  profile: FitnessProfile;
  workouts: Workout[];
  bodyMeasurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  nutritionEntries: NutritionEntry[];
  recoveryEntries: RecoveryEntry[];
  activityEntries: ActivityEntry[];
  weeklyCheckIns: WeeklyCheckIn[];
  habits: FitnessHabit[];
  milestones: FitnessMilestone[];
}

export interface AppSettings {
  theme: AppTheme;
  accentColor: string; // Hex color
  fontSize: FontSize;
  uiScaling: number; // 0.9, 1.0, 1.1
  animationSpeed: AnimationSpeed;
  cornerRadius: number; // in px
  notificationsEnabled: boolean;
  fontSizeMultiplier: number;
  volumeEnabled: boolean;
}

export interface AppData {
  subjects: Subject[];
  chapters: Chapter[];
  studySessions: StudySession[];
  tasks: Task[];
  habits: Habit[];
  pomodoroSessions: PomodoroSession[];
  revisions: Revision[];
  mockTests: MockTest[];
  gamification: GamificationState;
  settings: AppSettings;
  fitness?: FitnessState;
}
