
export interface Habit {
  id: string;
  name: string;
  targetDays: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
  startDate: string; // ISO string format
  completedDates: string[]; // Array of ISO string dates
  streak: number;
  highestStreak: number;
}
