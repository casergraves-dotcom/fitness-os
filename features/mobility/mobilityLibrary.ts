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
  category: "Recovery" | "Flexibility Goal";
  durationMinutes: number;
  durationOptions: number[];
  drills: MobilityDrill[];
}

export const mobilityRoutines: MobilityRoutine[] = [
  {
    id: "full-body-recovery",
    name: "Full Body Recovery",
    description: "Gentle mobility for the major areas used across strength, running, and aerial training.",
    category: "Recovery",
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
    category: "Recovery",
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
    category: "Recovery",
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
    category: "Recovery",
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

mobilityRoutines.push(
  {
    id: "front-split-preparation",
    name: "Front Split Preparation",
    description: "Gradual hip-flexor and hamstring work for a more comfortable front-split range without forcing depth.",
    category: "Flexibility Goal",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "front-split-half-kneeling-hip-flexor",
        name: "Half-Kneeling Hip Flexor Stretch",
        targetArea: "Back-leg hip flexors",
        durationSeconds: 35,
        perSide: true,
        setup: "Kneel with one foot forward and place padding beneath the down knee.",
        execution: "Gently tuck the pelvis and shift forward while keeping the torso tall.",
        safetyCue: "Use support for balance and avoid arching the low back.",
      },
      {
        id: "half-split-hamstring-rock",
        name: "Half-Split Hamstring Rock",
        targetArea: "Front-leg hamstrings",
        durationSeconds: 40,
        perSide: true,
        setup: "From half kneeling, shift the hips back and lengthen the front leg with a soft knee.",
        execution: "Rock forward and back slowly, stopping at gentle hamstring tension.",
        safetyCue: "Keep the spine long and do not force the front knee straight.",
      },
      {
        id: "supported-split-stance",
        name: "Supported Split Stance",
        targetArea: "Hip flexors and hamstrings",
        durationSeconds: 30,
        perSide: true,
        setup: "Use sturdy blocks or a chair for support and slide the feet into a long stance.",
        execution: "Ease the hips lower only while both legs remain controlled and comfortable.",
        safetyCue: "Stay well above pain and never bounce or force the end range.",
      },
    ],
  },
  {
    id: "middle-split-preparation",
    name: "Middle Split Preparation",
    description: "Tolerance-aware inner-thigh and hip mobility for gradually widening a straddle position.",
    category: "Flexibility Goal",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "wide-stance-shift",
        name: "Wide-Stance Weight Shift",
        targetArea: "Inner thighs and hips",
        durationSeconds: 45,
        perSide: true,
        setup: "Stand in a comfortable wide stance with toes facing mostly forward and hands supported.",
        execution: "Bend one knee and shift toward that side while the other leg stays long.",
        safetyCue: "Keep the bent knee tracking with the toes and use a smaller range if needed.",
      },
      {
        id: "frog-rock-back",
        name: "Supported Frog Rock-Back",
        targetArea: "Adductors and inner hips",
        durationSeconds: 45,
        setup: "From hands and knees, widen the knees only as far as comfortable and pad them well.",
        execution: "Keep the spine long and slowly rock the hips backward and forward.",
        safetyCue: "Stop if the knees feel pressured; a narrower position is still useful.",
      },
      {
        id: "seated-straddle-hinge",
        name: "Seated Straddle Hinge",
        targetArea: "Inner thighs and hamstrings",
        durationSeconds: 40,
        setup: "Sit tall with the legs in a comfortable straddle and hands resting in front.",
        execution: "Hinge forward slightly from the hips while maintaining a long spine.",
        safetyCue: "Do not pull yourself forward or chase depth; keep the knees comfortable.",
      },
    ],
  },
  {
    id: "overhead-shoulder-range",
    name: "Overhead Shoulder Range",
    description: "Gentle shoulder and lat mobility to support a controlled overhead position.",
    category: "Flexibility Goal",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "quadruped-lat-rock",
        name: "Bench Lat Rock-Back",
        targetArea: "Lats and shoulders",
        durationSeconds: 40,
        setup: "Place both hands on a bench or chair and step back until the torso can hinge forward.",
        execution: "Send the hips back while allowing the chest to lower gently between the arms.",
        safetyCue: "Keep the ribs controlled and avoid pinching in the shoulders.",
      },
      {
        id: "wall-shoulder-slide",
        name: "Wall Shoulder Slide",
        targetArea: "Shoulders and upper back",
        durationSeconds: 45,
        setup: "Stand with the back near a wall and place forearms against it at a comfortable height.",
        execution: "Slide the arms upward through a pain-free range, then return slowly.",
        safetyCue: "Do not force the hands to the wall or flare the ribs to gain height.",
      },
      {
        id: "doorway-lat-reach",
        name: "Doorway Lat Reach",
        targetArea: "Lats and side body",
        durationSeconds: 35,
        perSide: true,
        setup: "Hold a sturdy doorway with one hand and step the same-side foot behind you.",
        execution: "Sit the hips away from the hand until the side body gently lengthens.",
        safetyCue: "Keep the grip comfortable and stop if the shoulder feels unstable.",
      },
    ],
  },
  {
    id: "ankle-mobility",
    name: "Ankle Mobility",
    description: "Controlled calf and ankle work for squatting, walking, running, and hiking comfort.",
    category: "Flexibility Goal",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "ankle-knee-to-wall",
        name: "Knee-to-Wall Rock",
        targetArea: "Ankles and calves",
        durationSeconds: 45,
        perSide: true,
        setup: "Face a wall in a short staggered stance with the front heel planted.",
        execution: "Guide the front knee toward the wall over the middle toes, then return.",
        safetyCue: "Keep the heel down and use a range that does not pinch the front of the ankle.",
      },
      {
        id: "bent-knee-calf-stretch",
        name: "Bent-Knee Calf Stretch",
        targetArea: "Lower calf and ankle",
        durationSeconds: 35,
        perSide: true,
        setup: "Use a wall for balance and place one foot slightly behind the other.",
        execution: "Bend both knees gently while keeping the back heel planted.",
        safetyCue: "Keep the back foot forward and avoid collapsing the arch inward.",
      },
      {
        id: "supported-calf-raise",
        name: "Slow Supported Calf Raise",
        targetArea: "Calves and ankle control",
        durationSeconds: 45,
        setup: "Stand tall while holding a wall or chair lightly for balance.",
        execution: "Rise onto both feet, pause, and lower slowly through a comfortable range.",
        safetyCue: "Keep pressure even across the toes and stop if the ankle feels unstable.",
      },
    ],
  },
  {
    id: "thoracic-rotation",
    name: "Thoracic Rotation",
    description: "Controlled upper-back rotation for reaching, running posture, strength work, and aerial movement.",
    category: "Flexibility Goal",
    durationMinutes: 10,
    durationOptions: [10, 15, 20],
    drills: [
      {
        id: "open-book-rotation",
        name: "Open Book",
        targetArea: "Upper back and chest",
        durationSeconds: 45,
        perSide: true,
        setup: "Lie on one side with hips and knees bent and both arms reaching forward.",
        execution: "Sweep the top arm open while the knees stay stacked, then return slowly.",
        safetyCue: "Use a smaller range if the low back or shoulder takes over.",
      },
      {
        id: "thread-the-needle",
        name: "Thread the Needle",
        targetArea: "Upper back and rear shoulder",
        durationSeconds: 40,
        perSide: true,
        setup: "Begin on hands and knees with the spine in a comfortable neutral position.",
        execution: "Slide one arm beneath the other, then rotate it upward through an easy range.",
        safetyCue: "Keep the movement smooth and reduce pressure through the supporting wrist if needed.",
      },
      {
        id: "half-kneeling-wall-rotation",
        name: "Half-Kneeling Wall Rotation",
        targetArea: "Upper back and ribcage",
        durationSeconds: 40,
        perSide: true,
        setup: "Half kneel beside a wall with the inside knee up and both hands reaching forward.",
        execution: "Rotate the outside arm away while the hips remain facing forward.",
        safetyCue: "Move from the upper back rather than twisting through the low back.",
      },
    ],
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
