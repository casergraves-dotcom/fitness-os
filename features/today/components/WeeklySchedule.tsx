import {
  useState,
} from "react";

import {
  Card,
} from "@/components/ui/card";
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from "@/components/ui/ModalShell";

import type {
  TrainingActivityCompletion,
  TrainingActivity,
  TrainingModality,
  TrainingPlanState,
} from "@/features/workout/types";

import {
  getResolvedWeeklyActivityOccurrences,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";

import type {
  ResolvedWeeklyActivityOccurrence,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";

import {
  evaluateProposedActivityReschedule,
} from "@/features/workout/logic/evaluateProposedActivityReschedule";
import { evaluateScheduleConflicts } from "@/features/workout/logic/evaluateScheduleConflicts";
import { evaluateWeeklyScheduleRearrangement } from "@/features/workout/logic/evaluateWeeklyScheduleRearrangement";
import { getDaySwapTargets } from "@/features/workout/logic/getDaySwapTargets";
import { compareMoveDestinationSuggestions } from "@/features/workout/logic/compareMoveDestinationSuggestions";
import { getTrainingDayPreferencePenalty } from "@/features/workout/logic/getTrainingParticipationPreferenceForDate";

import {
  getAdaptiveWeeklyScheduleRecommendation,
} from "@/features/workout/logic/getAdaptiveWeeklyScheduleRecommendation";

import type {
  AdaptiveWeeklyScheduleRecommendation,
} from "@/features/workout/logic/getAdaptiveWeeklyScheduleRecommendation";
import {
  getTrainingWeekStart,
  parseLocalCalendarDate,
} from "@/lib/date/trainingWeek";

import {
  isPresentedRestDay,
} from "../utils/isPresentedRestDay";


// ============================================================
// Props
// ============================================================

interface WeeklyScheduleProps {
  state:
    TrainingPlanState | null;

  completions:
    TrainingActivityCompletion[];

  loaded:
    boolean;

  currentDate:
    Date;

  onCompleteActivity: (activity: TrainingActivity, date: string) => void;

  onAddAdHocActivity: (
    date: string,
    type: "Aerial" | "Walk" | "Mobility" | "Recovery",
    label: string,
    completed: boolean,
  ) => void;

  onRemoveAdHocActivity: (activityId: string, date: string) => void;

  onRescheduleActivity: (
    trainingActivityId: string,
    originalDate: string,
    scheduledDate: string,
    overrideRecurringPlacement?: boolean,
  ) => void;

  onRescheduleActivities: (
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
      overrideRecurringPlacement?: boolean;
    }[]
  ) => void;

  onApplyAdaptiveScheduleRecommendation: (
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
    }[],
    adjustments: {
      trainingActivityId: string;
      originalDate: string;
      action: "Skip" | "Substitute";
      substituteTrainingActivityId?: string;
    }[],
    variantOverrides: {
      trainingActivityId: string;
      originalDate: string;
      strengthWorkoutVariantId: string;
    }[]
  ) => void;
}


// ============================================================
// Date Helpers
// ============================================================

function getCanonicalWeekStart(
  date: Date
) {
  return getTrainingWeekStart(date);
}


function addCalendarDays(
  date: Date,
  days: number
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days
  );
}


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDisplayDate(
  value: string
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      weekday:
        "short",

      month:
        "short",

      day:
        "numeric",
    }
  );
}


// ============================================================
// Grouping
// ============================================================

interface ScheduleGroup {
  date: string;

  occurrences:
    ResolvedWeeklyActivityOccurrence[];
}


function groupOccurrencesByDate(
  occurrences:
    ResolvedWeeklyActivityOccurrence[]
): ScheduleGroup[] {
  const groups =
    new Map<
      string,
      ResolvedWeeklyActivityOccurrence[]
    >();

  for (
    const occurrence
    of occurrences
  ) {
    const existing =
      groups.get(
        occurrence.date
      );

    if (existing) {
      existing.push(
        occurrence
      );

      continue;
    }

    groups.set(
      occurrence.date,
      [occurrence]
    );
  }

  return Array.from(
    groups.entries()
  )
    .sort(
      ([dateA], [dateB]) =>
        dateA.localeCompare(
          dateB
        )
    )
    .map(
      ([date, items]) => ({
        date,
        occurrences:
          items,
      })
    );
}


// ============================================================
// Activity Row
// ============================================================

interface ActivityRowProps {
  occurrence:
    ResolvedWeeklyActivityOccurrence;

  completed:
    boolean;

  canMarkComplete: boolean;
  canMove: boolean;

  onMarkComplete: (occurrence: ResolvedWeeklyActivityOccurrence) => void;
  onRemoveAdHoc: (occurrence: ResolvedWeeklyActivityOccurrence) => void;

  onMove: (
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) => void;
}


function ActivityRow({
  occurrence,
  completed,
  canMarkComplete,
  canMove,
  onMarkComplete,
  onRemoveAdHoc,
  onMove,
}: ActivityRowProps) {
  const moved =
    occurrence.date !==
      occurrence.originalDate &&
    occurrence.placementSource !==
      "FixedAerialCommitment";

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-semibold text-slate-900">
            {occurrence.activity.label}
          </p>

          {occurrence.activity.optional && (
            <span className="text-xs text-slate-500">
              Optional
            </span>
          )}

          {occurrence.placementSource === "FixedAerialCommitment" && (
            <span className="text-xs font-medium text-blue-600">
              Fixed commitment
            </span>
          )}

          {occurrence.placementSource === "AdHoc" && (
            <span className="text-xs font-medium text-blue-600">Added by you</span>
          )}
        </div>

        {moved && (
          <p className="mt-1 text-xs text-blue-600">
            Moved from{" "}
            {formatDisplayDate(
              occurrence.originalDate
            )}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right">
        <span
          className={
            completed
              ? "text-sm font-medium text-emerald-600"
              : "text-sm text-slate-400"
          }
        >
          {completed
            ? "Completed"
            : "Planned"}
        </span>

        {canMarkComplete && (
          <button
            type="button"
            onClick={() => onMarkComplete(occurrence)}
            className="text-sm font-medium text-blue-600 underline underline-offset-2"
          >
            Mark Complete
          </button>
        )}

        {!completed && canMove && (
          <button
            type="button"
            onClick={() =>
              onMove(
                occurrence
              )
            }
            className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Move
          </button>
        )}

        {occurrence.placementSource === "AdHoc" && (
          <button
            type="button"
            onClick={() => onRemoveAdHoc(occurrence)}
            className="text-sm font-medium text-rose-700 underline underline-offset-2"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}


// ============================================================
// Weekly Schedule
// ============================================================

export default function WeeklySchedule({
  state,
  completions,
  loaded,
  currentDate,
  onCompleteActivity,
  onAddAdHocActivity,
  onRemoveAdHocActivity,
  onRescheduleActivity,
  onRescheduleActivities,
  onApplyAdaptiveScheduleRecommendation,
}: WeeklyScheduleProps) {
  const [
    movingOccurrence,
    setMovingOccurrence,
  ] =
    useState<
      ResolvedWeeklyActivityOccurrence | null
    >(null);

  const [
    moveDate,
    setMoveDate,
  ] =
    useState("");

  const [swapWithTargetDay, setSwapWithTargetDay] = useState(false);

  const [
    adjustingWeek,
    setAdjustingWeek,
  ] =
    useState(false);

  const [
    unavailableDates,
    setUnavailableDates,
  ] =
    useState<string[]>(
      []
    );

  const [
    recommendation,
    setRecommendation,
  ] =
    useState<
      AdaptiveWeeklyScheduleRecommendation | null
    >(null);

  const [reviewMessage, setReviewMessage] =
    useState<string | null>(null);
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);
  const [confirmingCompletion, setConfirmingCompletion] =
    useState<ResolvedWeeklyActivityOccurrence | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] =
    useState<ResolvedWeeklyActivityOccurrence | null>(null);
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [addingWeekRange, setAddingWeekRange] = useState<{ start: string; end: string } | null>(null);
  const [newActivityType, setNewActivityType] = useState<"Aerial" | "Walk" | "Mobility" | "Recovery">("Aerial");
  const [newActivityLabel, setNewActivityLabel] = useState("");
  const [newActivityCompleted, setNewActivityCompleted] = useState(false);
  const [addConflictAcknowledged, setAddConflictAcknowledged] = useState(false);
  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Training Week Schedule
        </p>

        <p className="mt-5 text-sm text-slate-500">
          Loading weekly schedule...
        </p>
      </Card>
    );
  }


  // ----------------------------------------------------------
  // No Active Plan
  // ----------------------------------------------------------

  if (!state) {
    return null;
  }


  // ----------------------------------------------------------
  // Resolve Week
  // ----------------------------------------------------------

  const weekStart =
    getCanonicalWeekStart(
      currentDate
    );

  const weekEnd =
    addCalendarDays(
      weekStart,
      6
    );

  const weekStartDate =
    formatLocalDate(
      weekStart
    );

  const weekEndDate =
    formatLocalDate(
      weekEnd
    );

  const todayDate = formatLocalDate(currentDate);
  const previousWeekStartDate = formatLocalDate(addCalendarDays(weekStart, -7));
  const previousWeekEndDate = formatLocalDate(addCalendarDays(weekStart, -1));
  const previousWeekOccurrences = showPreviousWeek
    ? getResolvedWeeklyActivityOccurrences(state, previousWeekStartDate) ?? []
    : [];
  const previousWeekGroups = groupOccurrencesByDate(
    previousWeekOccurrences.filter(
      (occurrence) => occurrence.date >= previousWeekStartDate && occurrence.date <= previousWeekEndDate,
    ),
  );

  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );

  if (!occurrences) {
    return null;
  }


  // ----------------------------------------------------------
  // Separate Normal Week From Cross-Week Moves
  // ----------------------------------------------------------

  const inWeekOccurrences =
    occurrences.filter(
      (occurrence) =>
        occurrence.date >=
          weekStartDate &&
        occurrence.date <=
          weekEndDate
    );

  const outsideWeekOccurrences =
    occurrences.filter(
      (occurrence) =>
        occurrence.date <
          weekStartDate ||
        occurrence.date >
          weekEndDate
    );


  const inWeekGroups =
    groupOccurrencesByDate(
      inWeekOccurrences
    );

  const outsideWeekGroups =
    groupOccurrencesByDate(
      outsideWeekOccurrences
    );

  // Preview the same conflict rules used by Move. Include neighbouring weeks
  // so adjacency warnings still work at a Sunday/Saturday boundary.
  const addCandidateId = "pending-ad-hoc-activity";
  const addDate = addingDate ? parseLocalCalendarDate(addingDate) : null;
  const addWeekStart = addDate ? getTrainingWeekStart(addDate) : null;
  const nearbyOccurrences = addWeekStart
    ? [-7, 0, 7].flatMap((offset) =>
        getResolvedWeeklyActivityOccurrences(
          state,
          formatLocalDate(addCalendarDays(addWeekStart, offset)),
        ) ?? [],
      )
    : [];
  const uniqueNearbyOccurrences = Array.from(
    new Map(nearbyOccurrences.map((item) => [
      `${item.activity.id}|${item.originalDate}|${item.date}`,
      item,
    ])).values(),
  );
  const addConflicts = addingDate && addDate
    ? evaluateScheduleConflicts([
        ...uniqueNearbyOccurrences.map((item) => ({ date: item.date, activity: item.activity })),
        {
          date: addingDate,
          activity: {
            id: addCandidateId,
            type: newActivityType,
            label: newActivityLabel.trim() || newActivityType,
            optional: true,
          },
        },
      ]).conflicts.filter((conflict) =>
        conflict.first.activity.id === addCandidateId ||
        conflict.second.activity.id === addCandidateId,
      )
    : [];
  const otherActivitiesOnAddDate = uniqueNearbyOccurrences
    .filter((item) => item.date === addingDate && item.activity.type !== "Rest")
    .map((item) => item.activity.label);


  // ----------------------------------------------------------
  // Completion Lookup
  // ----------------------------------------------------------

  function isCompleted(
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) {
    return completions.some(
      (completion) =>
        completion.trainingActivityId ===
          occurrence.activity.id &&
        completion.date ===
          occurrence.date
    );
  }


    // ----------------------------------------------------------
  // Activity Rescheduling
  // ----------------------------------------------------------

  function openMoveDialog(
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) {
    setMovingOccurrence(
      occurrence
    );

    setMoveDate(
      occurrence.date
    );
    setSwapWithTargetDay(false);
  }


  function closeMoveDialog() {
    setMovingOccurrence(
      null
    );

    setMoveDate("");
    setSwapWithTargetDay(false);
  }


  function confirmMove() {
    if (
      !movingOccurrence ||
      !moveDate
    ) {
      return;
    }

    if (swapWithTargetDay && swapMoves.length > 1) {
      onRescheduleActivities(swapMoves);
    } else {
      onRescheduleActivity(
        movingOccurrence.activity.id,
        movingOccurrence.originalDate,
        moveDate,
        movingOccurrence.placementSource === "FixedAerialCommitment" &&
          moveDate === movingOccurrence.originalDate,
      );
    }

    closeMoveDialog();
  }


  const moveDateChanged =
    movingOccurrence !== null &&
    moveDate !== "" &&
    moveDate !== movingOccurrence.date;

  const daySwapTargets = movingOccurrence && moveDateChanged && movingOccurrence.placementSource !== "AdHoc"
    ? getDaySwapTargets(occurrences, moveDate, movingOccurrence, completions)
    : { targets: [], blockedBy: null };

  const swapTargetOccurrences = daySwapTargets.targets;

  const swapMoves = movingOccurrence
    ? [
        {
          trainingActivityId: movingOccurrence.activity.id,
          originalDate: movingOccurrence.originalDate,
          scheduledDate: moveDate,
          overrideRecurringPlacement:
            movingOccurrence.placementSource === "FixedAerialCommitment" &&
            moveDate === movingOccurrence.originalDate,
        },
        ...swapTargetOccurrences.map((occurrence) => ({
          trainingActivityId: occurrence.activity.id,
          originalDate: occurrence.originalDate,
          scheduledDate: movingOccurrence.date,
          overrideRecurringPlacement:
            occurrence.placementSource === "FixedAerialCommitment" &&
            movingOccurrence.date === occurrence.originalDate,
        })),
      ]
    : [];


  const proposedMoveEvaluation =
    movingOccurrence &&
    moveDateChanged
      ? swapWithTargetDay && swapMoves.length > 1
        ? evaluateWeeklyScheduleRearrangement({
            state,
            weekStartDate,
            moves: swapMoves,
          })
        : evaluateProposedActivityReschedule({
          state,

          trainingActivityId:
            movingOccurrence.activity.id,

          originalDate:
            movingOccurrence.originalDate,

          scheduledDate:
            moveDate,
          })
      : null;


  const proposedMoveConflicts =
    proposedMoveEvaluation
      ?.conflicts ??
    [];


  const hasHighMoveConflict =
    proposedMoveEvaluation
      ?.hasHighConflict ??
    false;


  // ----------------------------------------------------------
  // Adaptive Weekly Recommendation
  // ----------------------------------------------------------

  const weekDates =
    Array.from(
      {
        length:
          7,
      },
      (
        _,
        index
      ) =>
        formatLocalDate(
          addCalendarDays(
            weekStart,
            index
          )
        )
    );

  const destinationSuggestions = movingOccurrence
    ? weekDates
        .filter((date) => date !== movingOccurrence.date && date >= formatLocalDate(currentDate))
        .map((date) => {
          const evaluation = evaluateProposedActivityReschedule({
            state,
            trainingActivityId: movingOccurrence.activity.id,
            originalDate: movingOccurrence.originalDate,
            scheduledDate: date,
          });
          const otherActivities = inWeekOccurrences.filter(
            (occurrence) => occurrence.date === date && occurrence.activity.type !== "Rest" &&
              !(occurrence.activity.id === movingOccurrence.activity.id && occurrence.originalDate === movingOccurrence.originalDate)
          );
          const level = evaluation?.hasHighConflict ||
            evaluation?.conflicts.some((conflict) => conflict.kind === "SameDayRunLongWalk")
            ? 3
            : evaluation?.hasAnyConflict
              ? 2
              : otherActivities.some((occurrence) =>
                  !["Recovery", "Mobility"].includes(occurrence.activity.type) &&
                  !(occurrence.activity.type === "Walk" &&
                    (occurrence.activity.durationMax ?? occurrence.activity.durationMin ?? 0) <= 30)
                )
                ? 1
                : 0;
          const modality = movingOccurrence.activity.type;
          const preferencePenalty = modality === "Strength" || modality === "Run" || modality === "Aerial"
            ? getTrainingDayPreferencePenalty(
                state?.trainingParticipationPreferences,
                date,
                modality as TrainingModality,
              )
            : 0;
          return { date, level, otherActivities, preferencePenalty,
            otherActivityCount: otherActivities.length };
        })
        .sort(compareMoveDestinationSuggestions)
    : [];


  function toggleUnavailableDate(
    date: string
  ) {
    setUnavailableDates(
      (current) =>
        current.includes(
          date
        )
          ? current.filter(
              (value) =>
                value !==
                date
            )
          : [
              ...current,
              date,
            ].sort()
    );

    setRecommendation(
      null
    );

    setReviewMessage(null);
  }


  function closeWeekAdjustment() {
    setAdjustingWeek(
      false
    );

    setUnavailableDates(
      []
    );

    setRecommendation(
      null
    );

    setReviewMessage(null);
  }


  function findRecommendation() {
    if (!state) {
      return;
    }

    const existingTrainingOverlap = evaluateScheduleConflicts(
      inWeekOccurrences
        .filter((occurrence) => occurrence.activity.type !== "Rest")
        .map((occurrence) => ({
          date: occurrence.date,
          activity: occurrence.activity,
        })),
    ).conflicts[0];

    const nextRecommendation =
      getAdaptiveWeeklyScheduleRecommendation({
        state,
        weekStartDate,
        unavailableDates,
        reviewDate: formatLocalDate(currentDate),
        completions,
      });

    setRecommendation(nextRecommendation);

    setReviewMessage(
      nextRecommendation
        ? null
        : unavailableDates.length > 0
          ? "Fitness OS did not find a safer arrangement that satisfies those unavailable days. Nothing changed."
          : existingTrainingOverlap
            ? `No safer remaining-day move was found. ${existingTrainingOverlap.reason} Completed activities and fixed commitments were kept in place. Nothing changed.`
            : "Fitness OS reviewed the full week and did not find a safer arrangement than the current schedule. Nothing changed."
    );
  }


  function applyRecommendation() {
    if (!recommendation) {
      return;
    }


    const adjustments =
      recommendation
        .optionalAdjustments
        .flatMap(
          (adjustment) => {
            if (
              adjustment.action ===
                "Substitute" &&
              !adjustment.replacementActivity
            ) {
              return [];
            }


            return adjustment
              .conflictingActivities
              .map(
                (activity) => ({
                  trainingActivityId:
                    activity.trainingActivityId,

                  originalDate:
                    adjustment.scheduledDate,

                  action:
                    adjustment.action,

                  substituteTrainingActivityId:
                    adjustment.action ===
                      "Substitute"
                      ? adjustment
                          .replacementActivity
                          ?.trainingActivityId
                      : undefined,
                })
              );
          }
        );


    onApplyAdaptiveScheduleRecommendation(
      recommendation.moves.map(
        (move) => ({
          trainingActivityId:
            move.trainingActivityId,

          originalDate:
            move.originalDate,

          scheduledDate:
            move.scheduledDate,
        })
      ),

      adjustments,

      recommendation.variantRecommendations.map(
        (variantRecommendation) => ({
          trainingActivityId:
            variantRecommendation.trainingActivityId,

          originalDate:
            variantRecommendation.originalDate,

          strengthWorkoutVariantId:
            variantRecommendation.variantId,
        })
      )
    );


    closeWeekAdjustment();
  }


  // ----------------------------------------------------------
  // Render Group
  // ----------------------------------------------------------

  function renderGroup(
    group: ScheduleGroup,
    historical = false,
  ) {
    const isRestDay = isPresentedRestDay(
      group.occurrences.map(
        (occurrence) => occurrence.activity,
      ),
    );

    const presentedOccurrences =
      group.occurrences.filter(
        (occurrence) =>
          occurrence.activity.type !==
          "Rest"
      );

    const sameDayOverlap = evaluateScheduleConflicts(
      presentedOccurrences.map((occurrence) => ({
        date: group.date,
        activity: occurrence.activity,
      })),
    ).conflicts.find((conflict) =>
      conflict.kind === "SameDayHardStack" || conflict.kind === "SameDayRunLongWalk"
    );

    const completedOverlapCount = sameDayOverlap
      ? presentedOccurrences.filter((occurrence) =>
          (occurrence.activity.id === sameDayOverlap.first.activity.id ||
            occurrence.activity.id === sameDayOverlap.second.activity.id) &&
          isCompleted(occurrence)
        ).length
      : 0;

    const overlapAction = completedOverlapCount === 2
      ? "Both sessions are complete; this is a training-load note for your review."
      : completedOverlapCount === 1
        ? "One session is complete. Consider rescheduling the remaining session if needed."
        : "Consider another date or a swap if one is available.";

    return (
      <div
        key={
          group.date
        }
        className="rounded-xl bg-slate-50 px-4 py-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {formatDisplayDate(
            group.date
          )}
        </p>

        {isRestDay && (
          <p className="mt-2 font-semibold text-slate-900">
            Rest Day
          </p>
        )}

        <div className={isRestDay ? "mt-2 divide-y divide-slate-200" : "mt-1 divide-y divide-slate-200"}>
          {presentedOccurrences.map(
            (
              occurrence,
              index
            ) => (
              <ActivityRow
                key={
                  `${occurrence.activity.id}-${occurrence.originalDate}-${index}`
                }
                occurrence={
                  occurrence
                }
                completed={
                  isCompleted(
                    occurrence
                  )
                }
                canMarkComplete={
                  occurrence.date < todayDate &&
                  !isCompleted(occurrence) &&
                  occurrence.activity.type !== "Strength" &&
                  occurrence.activity.type !== "Run" &&
                  occurrence.activity.type !== "Rest"
                }
                canMove={!historical && !isCompleted(occurrence)}
                onMarkComplete={setConfirmingCompletion}
                onRemoveAdHoc={setConfirmingRemoval}
                onMove={
                    openMoveDialog
                }
              />
            )
          )}

          {isRestDay &&
            presentedOccurrences.length ===
              0 && (
            <p className="py-2 text-sm text-slate-500">
              No training scheduled
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setAddingDate(group.date);
            setAddingWeekRange(historical
              ? { start: previousWeekStartDate, end: previousWeekEndDate }
              : { start: weekStartDate, end: weekEndDate });
            setNewActivityType("Aerial");
            setNewActivityLabel("");
            setNewActivityCompleted(false);
            setAddConflictAcknowledged(false);
          }}
          className="mt-2 text-sm font-medium text-blue-600 underline underline-offset-2"
        >
          + Add Activity
        </button>

        {sameDayOverlap && (
          <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${sameDayOverlap.severity === "High" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            <span className="font-semibold">Training-load {sameDayOverlap.severity === "High" ? "warning" : "caution"}: </span>
            {sameDayOverlap.reason} {overlapAction}
          </p>
        )}
      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Training Week Schedule
        </p>

        <button
          type="button"
          onClick={() => {
            setAdjustingWeek(
              true
            );

            setRecommendation(
              null
            );
          }}
          className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          Adjust week
        </button>
      </div>

      {inWeekGroups.length > 0 ? (
        <div className="mt-5 space-y-3">
          {inWeekGroups.map((group) => renderGroup(group))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          No training activities scheduled for this week.
        </p>
      )}

      {outsideWeekGroups.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Moved Outside Training Week
          </p>

          <div className="mt-3 space-y-3">
            {outsideWeekGroups.map((group) => renderGroup(group))}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={() => setShowPreviousWeek((visible) => !visible)}
          className="text-sm font-medium text-blue-600 underline underline-offset-2"
        >
          {showPreviousWeek ? "Hide previous week" : "View previous week"}
        </button>
        {showPreviousWeek && (
          <div className="mt-3 space-y-3">
            {previousWeekGroups.length > 0
              ? previousWeekGroups.map((group) => renderGroup(group, true))
              : <p className="text-sm text-slate-500">No activities scheduled last week.</p>}
          </div>
        )}
      </div>

      {confirmingCompletion && (
        <ModalShell
          labelledBy="retroactive-completion-title"
          onBackdropPress={() => setConfirmingCompletion(null)}
        >
          <ModalHeader>
            <h2 id="retroactive-completion-title" className="text-xl font-semibold text-slate-900">
              Mark {confirmingCompletion.activity.label} complete?
            </h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm leading-6 text-slate-600">
              This will count the activity on {formatDisplayDate(confirmingCompletion.date)},
              even though you are recording it now.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-3">
            <button type="button" onClick={() => setConfirmingCompletion(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onCompleteActivity(confirmingCompletion.activity, confirmingCompletion.date);
                setConfirmingCompletion(null);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm completion
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {confirmingRemoval && (
        <ModalShell labelledBy="remove-ad-hoc-title" onBackdropPress={() => setConfirmingRemoval(null)}>
          <ModalHeader>
            <h2 id="remove-ad-hoc-title" className="text-xl font-semibold text-slate-900">
              Remove {confirmingRemoval.activity.label}?
            </h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm leading-6 text-slate-600">
              This removes only the one-time activity on {formatDisplayDate(confirmingRemoval.date)}.
              {isCompleted(confirmingRemoval) && " Its completion will also be removed from History and weekly progress."}
              {" "}Your recurring training plan will not change.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-3">
            <button type="button" onClick={() => setConfirmingRemoval(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button
              type="button"
              onClick={() => {
                onRemoveAdHocActivity(confirmingRemoval.activity.id, confirmingRemoval.date);
                setConfirmingRemoval(null);
              }}
              className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Remove activity
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {addingDate && (
        <ModalShell labelledBy="add-activity-title" onBackdropPress={() => setAddingDate(null)}>
          <ModalHeader>
            <h2 id="add-activity-title" className="text-xl font-semibold text-slate-900">Add one-time activity</h2>
            <p className="mt-2 text-sm text-slate-600">This changes only the selected date, not your recurring training plan.</p>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Date
              <input type="date" min={addingWeekRange && addingWeekRange.start > state.startDate ? addingWeekRange.start : state.startDate} max={addingWeekRange?.end} value={addingDate} onChange={(event) => {
                setAddingDate(event.target.value);
                setAddConflictAcknowledged(false);
                if (event.target.value > todayDate) setNewActivityCompleted(false);
              }} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Activity type
              <select value={newActivityType} onChange={(event) => {
                setNewActivityType(event.target.value as typeof newActivityType);
                setAddConflictAcknowledged(false);
              }} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2">
                <option value="Aerial">Aerial</option>
                <option value="Walk">Walk</option>
                <option value="Mobility">Mobility</option>
                <option value="Recovery">Recovery</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input type="text" value={newActivityLabel} onChange={(event) => {
                setNewActivityLabel(event.target.value);
                setAddConflictAcknowledged(false);
              }} placeholder={newActivityType === "Aerial" ? "e.g. Aerial Open Studio" : `e.g. ${newActivityType}`} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            {otherActivitiesOnAddDate.length > 0 && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Also scheduled: {otherActivitiesOnAddDate.join(", ")}.
              </p>
            )}
            {addConflicts.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                <p className="font-semibold">Training-load {addConflicts.some((conflict) => conflict.severity === "High") ? "warning" : "caution"}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {addConflicts.map((conflict, index) => <li key={`${conflict.kind}-${index}`}>{conflict.reason}</li>)}
                </ul>
                <label className="mt-3 flex items-start gap-2">
                  <input type="checkbox" checked={addConflictAcknowledged} onChange={(event) => setAddConflictAcknowledged(event.target.checked)} />
                  Add anyway
                </label>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={newActivityCompleted} disabled={addingDate > todayDate} onChange={(event) => setNewActivityCompleted(event.target.checked)} />
              Already completed
            </label>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-3">
            <button type="button" onClick={() => setAddingDate(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button
              type="button"
              disabled={!newActivityLabel.trim() || !addDate || addingDate < state.startDate || !addingWeekRange || addingDate < addingWeekRange.start || addingDate > addingWeekRange.end || (addConflicts.length > 0 && !addConflictAcknowledged)}
              onClick={() => {
                onAddAdHocActivity(addingDate, newActivityType, newActivityLabel, newActivityCompleted);
                setAddingDate(null);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add Activity
            </button>
          </ModalFooter>
        </ModalShell>
      )}

      {adjustingWeek && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/40 px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:items-center sm:py-6">
          <div className="max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:max-h-[90vh]">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Adjust Training Week
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Review or adjust this week
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review the current schedule around fixed commitments, or select
              days when you cannot train. Fitness OS will look for a safer
              arrangement without changing anything until you approve it.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {weekDates.map(
                (date) => {
                  const selected =
                    unavailableDates.includes(
                      date
                    );

                  return (
                    <button
                      key={
                        date
                      }
                      type="button"
                      onClick={() =>
                        toggleUnavailableDate(
                          date
                        )
                      }
                      className={
                        selected
                          ? "rounded-xl border border-blue-600 bg-blue-50 px-3 py-3 text-left text-blue-800"
                          : "rounded-xl border border-slate-200 px-3 py-3 text-left text-slate-700 hover:bg-slate-50"
                      }
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wider">
                        {new Date(
                          `${date}T12:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            weekday:
                              "short",
                          }
                        )}
                      </span>

                      <span className="mt-1 block text-xs">
                        {new Date(
                          `${date}T12:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            month:
                              "short",

                            day:
                              "numeric",
                          }
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {!recommendation && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={
                    closeWeekAdjustment
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    findRecommendation
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {unavailableDates.length > 0
                    ? "Find a Better Schedule"
                    : "Review Current Schedule"}
                </button>
              </div>
            )}

            {reviewMessage && !recommendation && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  {reviewMessage}
                </p>
              </div>
            )}

            {recommendation && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Suggested Week
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {recommendation.summary}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {recommendation.explanation}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Proposed moves
                  </p>

                  <div className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 px-4">
                    {recommendation.moves.map(
                      (move) => (
                        <div
                          key={`${move.trainingActivityId}-${move.originalDate}`}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <span className="text-sm font-medium text-slate-900">
                            {move.label}
                          </span>

                          <span className="text-sm text-slate-600">
                            {move.originalDayLabel}
                            {" → "}
                            {move.scheduledDayLabel}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {recommendation.optionalAdjustments.length >
                  0 && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      Optional session recommendations
                    </p>

                    <div className="mt-3 space-y-3">
                      {recommendation.optionalAdjustments.map(
                        (
                          adjustment
                        ) => {
                          const conflictingLabel =
                            adjustment
                              .conflictingActivities
                              .map(
                                (
                                  activity
                                ) =>
                                  activity.label
                              )
                              .join(
                                " / "
                              );

                          return (
                            <div
                              key={`${adjustment.scheduledDate}-${adjustment.substitutionGroup ?? "optional"}-${adjustment.action}`}
                              className="rounded-lg border border-amber-200 bg-white/60 p-3"
                            >
                              <p className="text-sm font-semibold text-amber-900">
                                {adjustment.scheduledDayLabel}
                                {" — "}
                                {adjustment.action ===
                                "Substitute"
                                  ? "Substitute"
                                  : "Skip"}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-amber-800">
                                {adjustment.action ===
                                  "Substitute" &&
                                adjustment.replacementActivity
                                  ? (
                                    <>
                                      Replace{" "}
                                      <span className="font-medium">
                                        {conflictingLabel}
                                      </span>
                                      {" with "}
                                      <span className="font-medium">
                                        {
                                          adjustment
                                            .replacementActivity
                                            .label
                                        }
                                      </span>
                                      .
                                    </>
                                  )
                                  : (
                                    <>
                                      Skip{" "}
                                      <span className="font-medium">
                                        {conflictingLabel}
                                      </span>
                                      {" for this week."}
                                    </>
                                  )}
                              </p>

                              <p className="mt-2 text-xs leading-5 text-amber-700">
                                {adjustment.reason}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-5 text-amber-700">
                      Applying this recommendation will apply both
                      the proposed moves and these optional session
                      adjustments together.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={
                      closeWeekAdjustment
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Keep Current Schedule
                  </button>

                  <button
                    type="button"
                    onClick={
                      applyRecommendation
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Apply Recommendation
                  </button>
                </div>
              </div>
            )}

            {unavailableDates.length >
              0 &&
              recommendation ===
                null &&
              reviewMessage === null && (
                <p className="mt-4 text-xs text-slate-500">
                  Nothing will change until you apply a
                  recommendation.
                </p>
              )}
          </div>
        </div>
      )}

    {movingOccurrence && (
        <ModalShell
          labelledBy="move-activity-title"
          describedBy="move-activity-description"
          onBackdropPress={closeMoveDialog}
        >
          <ModalHeader>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Move Activity
            </p>

            <h2 id="move-activity-title" className="mt-2 text-xl font-semibold text-slate-900">
              Move{" "}
              {
                movingOccurrence
                  .activity
                  .label
              }
            </h2>

            <p id="move-activity-description" className="mt-2 text-sm leading-6 text-slate-600">
              {movingOccurrence.placementSource === "AdHoc"
                ? "Choose another date for this one-time activity. Its identity will be preserved, and it will not become part of your recurring plan."
                : "Choose another date for this scheduled activity. Its training prescription and activity identity will be preserved."}
            </p>
          </ModalHeader>

          <ModalBody>

            {destinationSuggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900">This week&apos;s options</p>
                <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
                  {destinationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.date}
                      type="button"
                      onClick={() => {
                        setMoveDate(suggestion.date);
                        setSwapWithTargetDay(false);
                      }}
                      className={`rounded-lg border p-2 text-left text-xs ${moveDate === suggestion.date ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}
                    >
                      <span className="block font-semibold text-slate-900">{formatDisplayDate(suggestion.date)}</span>
                      <span className={suggestion.level === 0 ? "text-emerald-700" : suggestion.level === 1 ? "text-slate-600" : suggestion.level === 2 ? "text-amber-700" : "text-red-700"}>
                        {suggestion.level === 0 ? "Recommended" : suggestion.level === 1 ? "Okay" : suggestion.level === 2 ? "Caution" : "Not recommended"}
                      </span>
                      <span className="block text-slate-500">{suggestion.otherActivities.length ? suggestion.otherActivities.map((item) => item.activity.label).join(", ") : "No other training"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">
                New date
              </span>

              <input
                type="date"
                value={
                  moveDate
                }
                onChange={(event) =>
                  {
                    setMoveDate(event.target.value);
                    setSwapWithTargetDay(false);
                  }
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            {moveDateChanged && movingOccurrence.placementSource !== "AdHoc" && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Change type
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSwapWithTargetDay(false)}
                    className={swapWithTargetDay ? "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700" : "rounded-lg border border-blue-600 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"}
                  >
                    Move only
                  </button>
                  <button
                    type="button"
                    disabled={swapTargetOccurrences.length === 0}
                    onClick={() => setSwapWithTargetDay(true)}
                    className={swapWithTargetDay ? "rounded-lg border border-blue-600 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800" : "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"}
                  >
                    Swap with day
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600">
                  {daySwapTargets.blockedBy === "Completed"
                    ? "Swap with day is unavailable because an activity there is already completed. Move only, or move a flexible activity separately."
                    : daySwapTargets.blockedBy === "FixedCommitment"
                      ? "Swap with day is unavailable because it contains a fixed commitment. Move only, or move a flexible activity separately."
                    : swapTargetOccurrences.length > 0
                    ? swapWithTargetDay
                      ? `Move ${movingOccurrence.activity.label} to ${formatDisplayDate(moveDate)} and move ${swapTargetOccurrences.map((occurrence) => occurrence.activity.label).join(" and ")} back to ${formatDisplayDate(movingOccurrence.date)}.`
                      : `${formatDisplayDate(moveDate)} has ${swapTargetOccurrences.map((occurrence) => occurrence.activity.label).join(" and ")}. Choose Swap with day to exchange them as one change.`
                    : `${formatDisplayDate(moveDate)} has no other planned activities to swap.`}
                </p>
              </div>
            )}

            {moveDate &&
              proposedMoveEvaluation && (
                <div className="mt-4">
                  {proposedMoveConflicts.length >
                  0 ? (
                    <div
                      className={
                        hasHighMoveConflict
                          ? "rounded-xl border border-red-200 bg-red-50 p-4"
                          : "rounded-xl border border-amber-200 bg-amber-50 p-4"
                      }
                    >
                      <p
                        className={
                          hasHighMoveConflict
                            ? "text-sm font-semibold text-red-800"
                            : "text-sm font-semibold text-amber-800"
                        }
                      >
                        {hasHighMoveConflict
                          ? "High scheduling conflict"
                          : "Scheduling caution"}
                      </p>

                      <div className="mt-2 space-y-2">
                        {proposedMoveConflicts.map(
                          (
                            conflict,
                            index
                          ) => (
                            <p
                              key={`${conflict.kind}-${index}`}
                              className={
                                conflict.severity ===
                                "High"
                                  ? "text-sm leading-5 text-red-700"
                                  : "text-sm leading-5 text-amber-700"
                              }
                            >
                              {conflict.reason}
                            </p>
                          )
                        )}
                      </div>

                      <p
                        className={
                          hasHighMoveConflict
                            ? "mt-3 text-xs leading-5 text-red-700"
                            : "mt-3 text-xs leading-5 text-amber-700"
                        }
                      >
                        You can still move the activity if
                        this schedule works best for you.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        No scheduling conflicts detected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        This move does not create any
                        conflicts detected by the current
                        training-load rules.
                      </p>
                    </div>
                  )}
                </div>
              )}

          </ModalBody>

          <ModalFooter className="flex flex-row justify-end gap-3">
              <button
                type="button"
                onClick={
                  closeMoveDialog
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !moveDate ||
                  !moveDateChanged
                }
                onClick={
                  confirmMove
                }
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {hasHighMoveConflict
                  ? swapWithTargetDay
                    ? "Swap Anyway"
                    : "Move Anyway"
                  : swapWithTargetDay
                    ? "Swap Days"
                    : "Move Activity"}
              </button>
          </ModalFooter>
        </ModalShell>
      )}
    </Card>
  );
}
