import type { MobilityRoutineId } from "@/features/workout/types";

export interface MobilityDrill {
  id: string;
  name: string;
  targetArea: string;
  durationSeconds: number;
  perSide?: boolean;
  setup: string;
  execution: string;
  safetyCue: string;
}

export interface MobilityRoutine {
  id: MobilityRoutineId;
  name: string;
  description: string;
  durationMinutes: number;
  durationOptions: number[];
  drills: MobilityDrill[];
}

export const mobilityRoutines: MobilityRoutine[] = [
  {
    id: "full-body-recovery",
    name: "Full Body Recovery",
    description: "Gentle mobility for the major areas used across strength, running, and aerial training.",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "calf-wall-stretch",
        name: "Wall Calf Stretch",
        targetArea: "Calves",
        durationSeconds: 30,
        perSide: true,
        setup: "Place both hands on a wall and step one foot behind you.",
        execution: "Keep the back heel down and gently shift forward.",
        safetyCue: "Keep the back foot pointing forward and stop before pain.",
      },
      {
        id: "half-kneeling-hip-flexor",
        name: "Half-Kneeling Hip Flexor Stretch",
        targetArea: "Hip flexors",
        durationSeconds: 30,
        perSide: true,
        setup: "Kneel with one foot forward and pad the down knee if needed.",
        execution: "Tuck the pelvis slightly and shift forward without arching the low back.",
        safetyCue: "Use support for balance and keep the front knee comfortable.",
      },
      {
        id: "reclined-glute-stretch",
        name: "Reclined Glute Stretch",
        targetArea: "Glutes and outer hips",
        durationSeconds: 30,
        perSide: true,
        setup: "Lie on your back and cross one ankle over the opposite thigh.",
        execution: "Draw the supporting leg toward you until the glute gently stretches.",
        safetyCue: "Keep the head relaxed and avoid pressing on the crossed knee.",
      },
      {
        id: "adductor-rock-back",
        name: "Adductor Rock-Back",
        targetArea: "Inner thighs",
        durationSeconds: 45,
        perSide: true,
        setup: "From hands and knees, extend one leg to the side with the foot planted.",
        execution: "Slowly rock the hips backward and return through a comfortable range.",
        safetyCue: "Keep the spine long and reduce the range if the knee feels strained.",
      },
      {
        id: "childs-pose-lat-reach",
        name: "Child’s Pose Lat Reach",
        targetArea: "Lats and upper back",
        durationSeconds: 30,
        perSide: true,
        setup: "Sit the hips toward the heels with both hands reaching forward.",
        execution: "Walk both hands to one side and breathe into the opposite ribcage.",
        safetyCue: "Keep the position gentle and place support under the hips if needed.",
      },
      {
        id: "doorway-chest-stretch",
        name: "Doorway Chest Stretch",
        targetArea: "Chest and shoulders",
        durationSeconds: 30,
        perSide: true,
        setup: "Place one forearm on a doorway with the elbow below shoulder height.",
        execution: "Turn the body away until the front of the chest gently stretches.",
        safetyCue: "Do not force the shoulder backward or allow numbness or tingling.",
      },
    ],
  },
];

const fullBodyDrills = mobilityRoutines[0].drills;

function chooseDrills(ids: string[]) {
  return ids
    .map((id) => fullBodyDrills.find((drill) => drill.id === id))
    .filter((drill): drill is MobilityDrill => Boolean(drill));
}

mobilityRoutines.push(
  {
    id: "post-run",
    name: "Post-Run Reset",
    description: "Easy lower-body mobility to settle calves, hips, glutes, and inner thighs after running.",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: chooseDrills([
      "calf-wall-stretch",
      "half-kneeling-hip-flexor",
      "reclined-glute-stretch",
      "adductor-rock-back",
    ]),
  },
  {
    id: "post-strength",
    name: "Post-Strength Reset",
    description: "A gentle cooldown for the hips, chest, shoulders, and back after a strength session.",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: chooseDrills([
      "reclined-glute-stretch",
      "adductor-rock-back",
      "childs-pose-lat-reach",
      "doorway-chest-stretch",
    ]),
  },
  {
    id: "post-aerial",
    name: "Post-Aerial Reset",
    description: "Restorative mobility for shoulders, lats, chest, hips, and glutes after aerial training.",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: chooseDrills([
      "doorway-chest-stretch",
      "childs-pose-lat-reach",
      "half-kneeling-hip-flexor",
      "reclined-glute-stretch",
    ]),
  }
);

export function getMobilityRoutine(id: MobilityRoutineId) {
  return mobilityRoutines.find((routine) => routine.id === id);
}

export function getMobilityDrillDurationSeconds(
  baseDurationSeconds: number,
  baseRoutineMinutes: number,
  selectedDurationMinutes: number
) {
  return Math.round(
    baseDurationSeconds * (selectedDurationMinutes / baseRoutineMinutes)
  );
}
