import type { WorkoutSession } from "../types";

export const previousWorkout: WorkoutSession = {
  id: "previous-push",
  workoutType: "Push",
  startedAt: "2026-08-06T17:30:00",

  restStartedAt: undefined,

  exercises: [
    {
      id: "bench",
      name: "Barbell Bench Press",
      sets: [
        { id: "1", weight: 180, reps: 5, completed: true },
        { id: "2", weight: 180, reps: 5, completed: true },
        { id: "3", weight: 180, reps: 4, completed: true },
      ],
    },
    {
      id: "incline",
      name: "Incline Dumbbell Press",
      sets: [
        { id: "1", weight: 60, reps: 10, completed: true },
        { id: "2", weight: 60, reps: 9, completed: true },
        { id: "3", weight: 55, reps: 10, completed: true },
      ],
    },
    {
      id: "fly",
      name: "Chest Fly",
      sets: [
        { id: "1", weight: 120, reps: 12, completed: true },
        { id: "2", weight: 120, reps: 12, completed: true },
        { id: "3", weight: 120, reps: 10, completed: true },
      ],
    },
    {
      id: "pushdown",
      name: "Triceps Pushdown",
      sets: [
        { id: "1", weight: 70, reps: 12, completed: true },
        { id: "2", weight: 70, reps: 12, completed: true },
        { id: "3", weight: 70, reps: 11, completed: true },
      ],
    },
  ],
};