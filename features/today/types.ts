export type WorkoutType =
  | "Push"
  | "Pull"
  | "Legs"
  | "Run"
  | "Rest";

export type Mood =
  | 1
  | 2
  | 3
  | 4
  | 5;

export type Recovery =
  | "Poor"
  | "Fair"
  | "Good"
  | "Excellent";

export interface MorningCheckIn {

  energy: Mood;

  mood: Mood;

  sleep: Mood;

  stress: Mood;

  soreness: string;

}

export interface Mission {

  workout: WorkoutType;

  proteinGoal: number;

  stepGoal: number;

  cardioMinutes: number;

}

export interface Day {

  date: string;

  recovery: Recovery;

  checkIn: MorningCheckIn;

  mission: Mission;

  weeklyProgress: WeeklyProgress;

}

export interface WeeklyProgress {
  workoutsCompleted: number;
  workoutGoal: number;

  proteinDays: number;
  proteinGoal: number;

  stepDays: number;
  stepGoal: number;
}