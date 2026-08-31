# Fitness OS Roadmap

## North Star

Fitness OS exists to answer one question:

> **What should I do next to make meaningful progress toward my fitness goals?**

The project began as a way to rebuild a sustainable training routine after an
extended period of travel and inconsistent gym attendance. The product must
remain anchored to that problem rather than becoming only a workout logger.

### Primary outcome

Improve body composition through sustainable fat loss, with reducing abdominal
fat as the practical goal. Scale weight is a useful trend, not the sole
definition of success.

### Secondary outcomes

- Retain and build useful muscle.
- Maintain strength and capacity for aerials, snowboarding, hiking, and other
  active hobbies.
- Improve cardiovascular fitness.
- Build a training routine that survives travel, schedule disruption, and missed
  gym days.
- Reduce the amount of day-to-day planning required from the user.

### Current default training structure

The current long-term default rhythm is:

- **Monday:** Gym
- **Tuesday:** Optional aerial / running / recovery
- **Wednesday:** Gym
- **Thursday:** Optional aerial / recovery
- **Friday:** Gym
- **Weekend:** Running, walking, hiking, recovery, or other appropriate
  conditioning

The system should build toward that rhythm gradually rather than assuming full
training volume immediately.

This is the current default program structure, not a universal Fitness OS
requirement. Phase 7 personalization will allow supported training modalities,
availability, and preferences to vary by user while preserving the same
programming principles.

### Product requirement

Fitness OS should not merely record what happened. It should increasingly use
training history, adherence, recovery, lifestyle context, and progress to
recommend the most appropriate action next.

---

# Development Principles

1. **Finish the core coaching loop before expanding scope.**
2. **Prefer adherence over theoretical perfection.** A plan the user follows is
   better than a more aggressive plan they abandon.
3. **Progress gradually.** Strength, running, and overall weekly load should ramp
   safely.
4. **Treat aerials and active hobbies as real training load.**
5. **A missed gym day should have a useful fallback, not become a failed day.**
6. **Persistent user data should remain authenticated, private, and cloud-backed.**
7. **Active workout/run sessions remain device-local until conflict handling is
   deliberately designed.**
8. **Social features must expose only intentionally shared data, never raw private
   Fitness OS storage.**
9. Every major feature should pass the Vision test:

   > **Does this help the user make a better decision about what to do next?**

---

# Current State

## Completed Foundation

### Application platform

- [x] Next.js application structure.
- [x] Responsive/mobile-first interface.
- [x] Installable PWA.
- [x] Offline application shell.
- [x] Supabase authentication.
- [x] Per-user cloud data isolation.
- [x] Persistent-data cloud synchronization.
- [x] Sync on persistent writes.
- [x] Cloud hydration before page initialization.
- [x] Cross-device PC -> cloud -> phone synchronization verified.
- [x] Cross-device phone -> cloud -> PC synchronization verified.
- [x] Active workout and active run intentionally remain device-local.

### Strength training

- [x] Exercise library.
- [x] Custom exercises.
- [x] Editable workout templates.
- [x] Gym A / Gym B / Gym C templates.
- [x] Active workout sessions.
- [x] Set, weight, rep, RPE, and notes logging.
- [x] Rest timer.
- [x] Exercise targets based on previous performance.
- [x] Exercise-level increase / repeat / regression decisions.
- [x] RPE-aware target decisions.
- [x] Personal-record recognition using estimated 1RM.
- [x] Workout history.
- [x] Exercise progress views.
- [x] Persistent workout history cloud sync.
- [x] Exercise-type-aware workout inputs and history formatting.
- [x] Per-side repetition labeling for unilateral exercises.
- [x] Resistance-band load tracking with band-specific resistance selection.
- [x] Mobile-friendly workout numeric inputs without unwanted input zoom.
- [x] Empty numeric fields remain editable instead of forcing zero during entry.

### Training plan

- [x] Structured return-to-training ramp.
- [x] Week 0 Return phase.
- [x] Progressive ramp weeks.
- [x] Steady-state training phase.
- [x] Deload support.
- [x] Scheduled strength, running, walking, aerial, mobility, rest, and recovery
  activities.
- [x] Training activity completion tracking.
- [x] Weekly adherence evaluation.
- [x] Automatic advance / advance-with-warning / hold decisions.
- [x] Recovery-aware weekly progression decisions.
- [x] Strength-quality-aware weekly progression decisions.
- [x] Running-load-aware weekly progression decisions.
- [x] Calendar-week rollover with fresh weekly completion counters.
- [x] Training-plan state persistence and cloud sync.

### Activity prescription clarity

- [x] Ensure scheduled walking, mobility, and recovery activities have a defined
  purpose and target rather than relying on an open-ended label.
- [x] Replace vague `Easy Walk` prescriptions with a concrete duration/intensity
  target of 20–30 minutes at an easy, conversational effort.
- [x] Replace vague `Stretch & Recovery` prescriptions with a concrete
  10–15-minute duration and recommended full-body recovery routine.
- [x] Show walking/mobility prescriptions clearly from Today before the activity
  is completed.

**Completion tracking follow-up — COMPLETE:**

- [x] Define and enforce what counts as completion so walking/mobility activities
  can be tracked consistently without requiring unnecessary logging.

Walking, mobility, recovery, and other simple scheduled activities use the
canonical `TrainingActivityCompletion` record and a reversible `Mark Complete`
action on Today. Detailed strength and running sessions continue satisfying
their scheduled activities through their own canonical completion flows.

### Running

- [x] Scheduled and manually started runs.
- [x] Duration, distance, RPE, and notes.
- [x] Run/walk prescription support.
- [x] Run history.
- [x] Running progress views.
- [x] Scheduled run completion integration.
- [x] Persistent run history cloud sync.

### Recovery and guidance

- [x] Morning check-in.
- [x] Energy, sleep, mood, stress, and soreness inputs.
- [x] Readiness calculation.
- [x] Basic Coach recommendation engine.
- [x] Recovery progress views.
- [x] Morning check-in cloud sync.

---

# Phase 1 — Complete the Core Daily Coaching Loop

**Priority: COMPLETE**

This phase replaced the original mix of live training data and
placeholder/static Mission and Weekly Progress data with a trustworthy Today
control center driven entirely by real Fitness OS state.

## 1.1 Dynamic Today Mission — COMPLETE

- [x] Remove dependency on static `today` fixture data for the live Today
  experience.
- [x] Derive today's mission from the active training plan and actual date.
- [x] Derive workout/activity status from real completion records.
- [x] Remove placeholder protein and step goals until real/configurable data
  sources exist.
- [x] Clearly distinguish required and optional activities.
- [x] Handle rest/recovery days intentionally.
- [x] Handle days with no active training plan.
- [x] Remove obsolete Today fixture data/types after live consumers are migrated.

**Completed outcome:** every item shown under Today's Mission is derived from
real, current Fitness OS state. Protein and step goals return in Phase 5 once
their data sources are real.

**Today hierarchy cleanup:** The separate Today's Mission card was removed after
Today's Training became the canonical schedule, status, and execution surface.
Today's Recommendation retains prioritization and explanation, while daily
nutrition and activity targets remain in their own tracking cards. The underlying
mission derivation remains available without duplicating the visible schedule.

## 1.2 Real Weekly Progress — COMPLETE

- [x] Replace static weekly progress values.
- [x] Calculate required training activities scheduled this week.
- [x] Calculate completed required activities.
- [x] Show strength-session adherence.
- [x] Show overall plan adherence.
- [x] Surface current-week progression status using the same
  adherence/progression rules as automatic progression.
- [x] Show optional training separately without counting it against required
  adherence.
- [x] Respect substitution-group requirements.
- [x] Do not show protein/step streak data until those data sources are real.
- [x] Verify workout completion updates Mission and Weekly Progress immediately
  without a page reload.

**Completed outcome:** the weekly card reflects the same real completion records
and adherence rules used by automatic progression.

**Manual verification completed (August 2026):**

- [x] 25% adherence with 1/2 strength sessions reports below progression target.
- [x] 50% adherence with 2/2 strength sessions remains below target because
  overall required adherence is insufficient.
- [x] 75% adherence with 2/2 strength sessions reports likely advancement with
  reduced adherence.
- [x] 100% adherence with 2/2 strength sessions reports on track to advance.
- [x] Optional training is tracked separately and does not reduce required
  adherence.
- [x] Week rollover advances Week 0 Return to Week 1 Restart, resets current-week
  counters, preserves history, and carries forward exercise targets.

## 1.3 Reset Plan UX — COMPLETE

- [x] Rename `Reset` to `Reset Plan`.
- [x] Add confirmation before clearing plan state.
- [x] Explicitly state that workout history, run history, check-ins, and completed
  historical data are preserved.
- [x] Verify reset clears the active training-plan schedule/progression while
  preserving historical data.
- [x] Verify the user can start Week 0 again after resetting.

**Completed outcome:** resetting the plan is now a deliberate, confirmed action
that resets active plan state without deleting historical Fitness OS data.

## 1.4 Strength Workout Completion Validation — COMPLETE

- [x] Prevent an empty strength session from satisfying a scheduled strength
  activity.
- [x] Require meaningful workout input before recording scheduled strength
  completion.
- [x] Keep cancel/discard behavior separate from completion.
- [x] Support intentionally shortened or recovery-modified strength sessions
  under the current minimum-valid-session rule.
- [x] Ensure invalid/empty sessions do not increase weekly required-training,
  strength-session, or adherence counts.
- [x] Show a clear validation message when a user attempts to finish with zero
  completed working sets.
- [x] Verify an invalid zero-set session is not written to workout history.

**Completed outcome:** a strength workout now requires at least one completed
working set before it can be finished. Empty sessions remain active, are not
written to history, and cannot record scheduled strength completion. Legitimate
shortened sessions remain possible.

## 1.5 Guide Integration — COMPLETE

- [x] Make Coach/Guide aware of today's actual scheduled activity.
- [x] Combine readiness with training type when giving advice.
- [x] Distinguish normal training, reduced-effort training, recovery, and
  substitution recommendations.
- [x] Explain recommendations briefly and calmly.
- [x] Avoid recommendations that silently alter the long-term program.

**Milestone: COMPLETE:** Opening Today reliably answers **“What should I do
today?”**

---

# Phase 2 — Flexible Execution and Backup Workouts

**Priority: COMPLETE**

This phase directly addressed the original requirement that missing the gym
should not automatically mean missing training.

## 2.1 Backup Workout Model — COMPLETE

- [x] Define a substitute-workout data model.
- [x] Create home equivalents for Gym A, Gym B, and Gym C.
- [x] Support equipment-aware substitutions where useful.
- [x] Create abbreviated gym sessions for time-constrained days.
- [x] Preserve the training intent of the scheduled workout rather than copying
  exercises mechanically.
- [x] Represent movement roles explicitly so substitute sessions preserve
  training purpose rather than relying on one-for-one exercise replacement.
- [x] Separate available equipment from setup capabilities so owning equipment
  does not imply every exercise using it is executable.
- [x] Model the current home environment as bodyweight, yoga mat, resistance
  bands, floor space, and a high anchor.
- [x] Add availability logic that validates both required equipment and required
  setup capabilities.

**Completed outcome:** Gym A, Gym B, and Gym C now each have structured Full
Gym, Short Gym, and Home pathways. Short Gym variants preserve required movement
roles with reduced volume, while Home variants use bands/bodyweight/mat work and
explicitly account for setup requirements such as a high anchor.

## 2.2 Today Substitution Flow — COMPLETE

- [x] Add a `Need another option?` action for scheduled strength workouts.
- [x] Offer Full Gym, Short Gym, and Home pathways while preserving the
  scheduled Gym A / Gym B / Gym C identity.
- [x] Let the user explicitly choose the workout variant before starting.
- [x] Expose the same Full Gym / Short Gym / Home choice when manually starting
  Gym A / Gym B / Gym C from the Workout tab.
- [x] Filter backup options using current equipment and setup-capability
  availability.
- [x] Record the performed variant separately from the underlying scheduled
  workout identity.
- [x] Credit an appropriate Short Gym or Home substitute against the original
  scheduled strength activity.
- [x] Count valid substitutes toward weekly adherence and strength-session
  progression requirements.
- [x] Treat a strength substitution group as one strength requirement and only
  award strength credit when a Strength alternative is completed.
- [x] Preserve the actual performed variant in workout history while maintaining
  backwards compatibility with older history entries.

**Completed outcome:** a scheduled Gym A / Gym B / Gym C session can now be
executed as Full Gym, Short Gym, or an available Home variant without breaking
the training-plan identity.

## 2.2A In-Workout Exercise Substitution — COMPLETE

- [x] Add a per-exercise `Need another option?` action during an active strength
  workout.
- [x] Recommend ranked alternatives that preserve the exercise's movement
  role/training intent.
- [x] Prefer alternatives executable with the equipment and setup currently
  available.
- [x] Support common gym constraints such as a machine or station being occupied
  or unavailable.
- [x] Let the user explicitly choose the replacement rather than silently
  changing the workout.
- [x] Replace only the affected exercise while preserving the rest of the active
  workout and prescribed set count.
- [x] Use the replacement exercise's own target and performance history.
- [x] Support repeated substitutions during the same active workout.
- [x] Keep the exercise card expanded after a successful substitution so the
  user can immediately enter the replacement's working sets.
- [x] Record the exercise actually performed in workout history.
- [x] Preserve the underlying Gym A / Gym B / Gym C and workout-variant identity.
- [x] Preserve useful progression continuity when exercises are substituted.

**Completed outcome:** active strength workouts support explicit, ranked
per-exercise substitutions without changing the rest of the programmed session.

**Remaining substitution UX follow-up:**

- [x] Build substitution context from the entire active workout and exclude
  exercises already programmed elsewhere in the session from `Need another
  option?` recommendations, unless duplication is explicitly intentional.
- [x] Refine the movement-role model where a broad muscle-group label does not
  preserve training intent. In particular, distinguish knee-flexion hamstring
  work such as Leg Curl from hip-hinge work such as Romanian Deadlift.
- [x] Audit other substitution roles for the same muscle-group-versus-movement
  ambiguity before expanding the recommendation catalog.
- [x] Replace the broad `Accessory` role with explicit chest-isolation,
  shoulder-abduction, rear-shoulder, elbow-flexion, elbow-extension, and
  calf-raise intent so unrelated accessory movements are not interchangeable.
- [x] Replace the broad `Core` role with explicit rotation, trunk-flexion,
  stability, and hip-flexion intent; disclose when Home variants use practical
  stability work instead of the scheduled core pattern.
- [x] Rank alternatives by functional movement intent rather than treating every
  exercise with a shared broad role as interchangeable.
- [x] Review the hard-coded Leg Curl alternatives so hip-hinge exercises are not
  presented as equivalent knee-flexion replacements without explicitly
  identifying the compromise.
- [x] Preserve the session-level duplicate guard as defensive validation even
  after duplicate candidates are removed from the recommendation list.
- [x] Surface clear feedback if a replacement is rejected instead of allowing a
  recommended option to appear to do nothing.
- [x] Verify duplicate exercises cannot be recommended or introduced across
  initial and repeated substitutions in the same workout.
- [x] Exclude substitution candidates that do not yet have complete target and
  progression metadata, while keeping those definitions available for existing
  history and manual library use.
- [x] Add substitution tests confirming that Leg Curl recommendations preserve
  knee-flexion intent and that broader fallback movements are ranked or labeled
  appropriately.
- [x] Add at least one fully configured knee-flexion alternative so required Leg
  Curl work is not a substitution dead end.
- [x] Add fully configured alternatives for rotational core and trunk-flexion
  work so Cable Woodchop and Ab Crunch Machine can remain movement-specific
  without becoming substitution dead ends.
- [x] Decide whether chest isolation, calf raises, and hip-flexion core work
  belong in the active program or only the broader library, then either add
  complete same-role alternatives or explicitly retain them as endpoints.
- [x] Correct incomplete or questionable exercise metadata before those
  definitions can enter automatic substitution results, including Weighted
  Plank equipment/setup requirements and preserved spreadsheet-era exercises.

### Exercise Library and Substitution Audit

Complete a read-only catalog and architecture audit before making broad movement
role or substitution changes. The audit should identify affected consumers,
historical-data implications, and any required migration strategy before
implementation begins.

- [x] Review every canonical exercise definition for accurate naming, category,
  movement function, required equipment, setup capabilities, unilateral/per-side
  behavior, resistance type, performance type, rep range, and progression
  metadata.
- [x] Review the movement-role taxonomy for roles that are missing, overly broad,
  overlapping, or unable to distinguish materially different training intent.
- [x] Review every preferred and dynamically ranked substitution for functional
  equivalence, equipment/setup availability, difficulty, safety, and preservation
  of the source exercise's purpose.
- [x] Identify substitutions that are useful fallbacks but not true equivalents,
  and define how the UI should label and rank those compromises.
- [x] Review Gym A / Gym B / Gym C plus Short Gym and Home variants for missing
  movement patterns, unintended duplication, exercise-order problems, and
  appropriate weekly balance.
- [x] Identify important exercise and substitution gaps for common gym-equipment
  constraints, the supported home setup, mobility limitations, and different
  experience levels.
- [x] Trace every movement-role and exercise-definition consumer before changing
  the taxonomy, including template validation, workout balance, substitution
  ranking, backup workouts, progression, history, and Reflect analysis.
- [x] Determine whether historical records require compatibility aliases or a
  migration before exercise IDs or semantic roles change.
- [x] Produce a prioritized findings report separating correctness defects,
  missing coverage, UX improvements, and optional catalog expansion.
- [x] Add representative substitution tests for each movement family and
  regression coverage for every confirmed defect before considering the audit
  complete.

**Verified incremental correction:** knee-flexion and hip-hinge work now use
distinct canonical movement roles. Leg Curl no longer recommends hip-hinge
movements as equivalent substitutions. Gym C's required hip-hinge intent is
represented in its Full Gym, Short Gym, and Home pathways. Home Gym A and Gym B
retain Band Good Morning only as explicit hip-hinge work and disclose that it
does not replace the scheduled knee-flexion pattern. Production build verified
after the taxonomy and variant updates.

Substitution recommendations now receive the complete active-workout exercise
context and remove exercises already programmed elsewhere in the session. The
session-level duplicate guard remains defensive validation, and rejected
replacements provide visible feedback. Verified in an active Gym A workout by
adding Goblet Squat, confirming it disappeared from Leg Press alternatives, then
removing it and confirming the option returned.

Automatic substitutions now require complete repetition range, increment,
resistance-type, and performance-type metadata. Verified that incomplete Barbell
Squat, Overhead Press, and Barbell Row definitions no longer appear as automatic
alternatives while configured options remain available. Production build passed
after the filter was added.

The broad Accessory taxonomy has been removed from the workout system. Gym A,
Gym B, Gym C, and Home Gym B now declare the actual optional movement intent,
while canonical exercise definitions and substitution ranking distinguish chest
isolation, shoulder abduction, rear-shoulder work, elbow flexion, elbow extension,
and calf raises. Verified that biceps, triceps, lateral-raise, and rear-shoulder
recommendations remain within their respective families. Production build
passed after the role split.

Core substitutions now distinguish rotation, trunk flexion, stability, and
hip-flexion patterns. Gym A and Gym C retain their intended rotational and
trunk-flexion work in Full and Short variants, while their Home variants identify
Dead Bug and Plank as practical stability compromises rather than equivalents.
Verified that Cable Woodchop and Ab Crunch Machine no longer offer unrelated
alternatives, Plank remains within the stability family, and Full Gym A/C still
load correctly. Production build passed after the Core role split.

The post-taxonomy substitution audit found five isolated movement families:
knee flexion, chest isolation, calf raises, core rotation, and core hip flexion.
Trunk flexion has two definitions, but Cable Crunch lacks the metadata required
for automatic recommendations. Leg Curl, Cable Woodchop, and Ab Crunch Machine
are active-program substitution gaps; the remaining isolated families require a
program-scope decision before expanding the catalog. Weighted Plank also needs
an equipment/setup correction before the library audit is complete.

The existing `leg-curl` definition now represents Seated Leg Curl without
changing its stable ID, preserving its saved performance history. Lying Leg Curl
and Band Leg Curl provide fully configured same-role alternatives, with the band
variation requiring an available low anchor. Verified in a fresh Gym A session
that the seated exercise retained its prior target, both alternatives appeared,
no hip-hinge movements were offered, and the production build passed.

Rotational and trunk-flexion core work now have fully configured same-pattern
alternatives. Cable Woodchop and Band Woodchop recommend each other, with band
repetitions recorded per side; Ab Crunch Machine and Cable Crunch likewise form
a trunk-flexion pair. Verified both directions in active workouts and confirmed
the production build passed without reintroducing plank/stability substitutions.

The exercise-library audit now has an explicit history-protection boundary for
the exercises already recorded in the app. Existing `leg-curl` history resolves
canonically as Seated Leg Curl, while the history-bearing legacy
`triceps-press-machine` ID resolves as Triceps Pushdown Machine because that is
the machine actually performed. Seated Dip Machine has a new history-free ID.
Barbell Curl and Triceps Pushdown Machine are now explicit configured equipment
variants rather than ambiguous generic definitions. Progress and History resolve
current canonical labels from stable definition IDs without rewriting saved
session snapshots. Verified the corrected labels, retained targets, substitution
choices, and production build.

Exercise substitution now preserves the active session exercise ID for the
card's stable workout position. Replacing an exercise still resets its target and
working sets to the selected definition, but the replacement card remains
expanded for immediate entry. Verified in an active workout and production build.

Core hip-flexion exercises are retained as optional library coverage rather than
added to the active Gym A/B/C templates. Hanging Leg Raise now requires an
installed pull-up bar and has complete progression metadata; Lying Leg Raise is
its floor-based same-role alternative. Weighted Plank now requires floor space,
a mat, and a weight plate. Verified both hip-flexion substitution directions,
Weighted Plank availability within the stability family, persistent card
expansion, and the production build.

Chest isolation and calf raises are likewise retained as optional library
coverage rather than added to the active Gym A/B/C templates. The former generic
Chest Fly now resolves as Pec Deck Machine and offers Cable Fly and Dumbbell Fly
as fully configured same-role alternatives. The former generic Calf Raise now
resolves as bodyweight Standing Calf Raise and offers standing and seated calf
raise machine alternatives. Verified both families in an active workout and
confirmed the production build passed.

The remaining preserved free-weight placeholders now have explicit identities,
accurate equipment requirements, and complete progression metadata. Barbell
Bench Press and Barbell Squat require a rack; Incline Dumbbell Press, Barbell
Row, Barbell Overhead Press, and Barbell Romanian Deadlift identify their actual
loading equipment and movement-specific rep ranges. Verified the squat, row,
vertical-press, hip-hinge, and horizontal-press substitution paths in active
workouts and confirmed the production build passed.

Substitution ranking now supports an explicit fallback relationship in addition
to same-pattern equivalents. Glute Bridge and Hip Thrust Machine share bilateral
hip-extension intent, while Glute Kickback Machine is retained as a lower-ranked
unilateral isolation fallback and labeled `Related fallback — different movement
setup` in the workout UI. Separating hip extension from glute-biased squatting
also removes Glute Bridge from Leg Press recommendations without changing the
intentional Home Gym C fallback prescription. Verified ordering, labeling,
per-side kickback logging, Gym C loading, and the production build.

The workout domain now has a dependency-free automated substitution regression
suite using Node's built-in test runner. Initial coverage verifies complete
candidate metadata, shared movement intent, Leg Curl exclusion of hip hinges,
Leg Press exclusion of hip-extension isolation, equivalent-before-fallback
ordering, core-pattern separation, and active-workout duplicate exclusion. All
six tests and the TypeScript check pass. Keep the broader representative-family
test item open until every supported movement family has explicit coverage.

Representative regression coverage now spans every supported movement role and
also verifies equipment/setup filtering. Expanding the suite exposed an
incorrect high-anchor requirement on Band Row; its supported seated-around-the-
feet setup now requires only a resistance band, matching the existing Home
workout guidance. All eight substitution tests, the TypeScript check, and the
production build were verified after the correction.

The canonical exercise-definition audit now covers all 67 library entries.
Automated invariants protect unique IDs and names, complete progression fields,
valid rep ranges, required equipment, and movement roles. The final manual pass
corrected per-side logging for One-Arm Dumbbell Row, Side-Lying Hip Abduction,
and Side-Lying Hip Adduction while preserving all history-bearing IDs. Verified
the per-side target and working-set UI, all ten catalog/substitution tests, the
TypeScript check, and the production build.

In-workout substitution filtering now uses the active session environment rather
than assuming every workout has full gym access. Home variants receive the
canonical bodyweight, mat, band, and setup-capability profile; Full and Short Gym
variants receive the canonical gym profile. Verified that Home Band Row offers
only Backpack Row, anchor-independent Home exercises can legitimately have no
available alternative, Full Gym recommendations remain unchanged, all ten
substitution tests pass, and the production build succeeds.

The remaining catalog-gap review found no unrepresented movement family in the
current program or fixed Home setup: every supported role has a tested same-role
alternative or an explicitly labeled fallback/endpoint. The unresolved gaps are
personal rather than generic—individual gym inventories, pain or mobility
limitations, exercises a user cannot perform safely, experience level, and
preferred complexity. These require the Phase 7 equipment/setup and training-
preference model before recommendations can be filtered or ranked responsibly.
Do not expand the catalog with presumed rehabilitation or beginner substitutions
without those inputs and exercise-specific guidance metadata.

## 2.3 Coach-Recommended Modification — COMPLETE

- [x] Allow low readiness to recommend reduced volume/intensity.
- [x] Allow high soreness to influence exercise/session recommendations.
- [x] Avoid turning every imperfect check-in into a skipped workout.
- [x] Keep user override available.

**Completed outcome:** the coach turns readiness and soreness check-ins into
proportional training guidance while preserving user control.

**Milestone: COMPLETE:** Schedule disruption produces a useful alternative
instead of a failed training day.

---

# Phase 3 — Mature the Adaptive Training Plan

**Priority: COMPLETE**

The original plan could advance or hold based primarily on adherence. This phase
expanded adaptation to incorporate performance, recovery, running load, aerial
participation, and real-life schedule constraints.

## 3.1 Strength Progression — COMPLETE

- [x] Formalize exercise-level progression rules.
- [x] Use completed sets/reps/RPE to recommend next-session loads.
- [x] Distinguish successful progression, repeat, and regression.
- [x] Handle incomplete prescribed set counts without granting progression.
- [x] Handle exercise substitutions without losing progression history.
- [x] Surface estimated-strength PRs without encouraging unnecessary max-effort
  testing.
- [x] Persist next-session targets across workouts and calendar-week rollover.

**Completed outcome:** completed working sets produce an explained next-workout
target. Full top-of-range performance can increase load, high RPE can hold the
target, below-range performance can reduce load, and incomplete exercises retain
the current target.

## 3.2 Weekly Training Decisions — COMPLETE

- [x] Use required adherence and minimum strength-session counts to advance,
  advance with reduced adherence, or hold.
- [x] Explain the current weekly decision on the Today screen.
- [x] Apply the decision during calendar-week rollover while preserving history.
- [x] Incorporate recent recovery alongside adherence.
- [x] Incorporate strength-session quality where appropriate.
- [x] Incorporate running completion/load.
- [x] Treat aerial participation as meaningful training load.
- [x] Complete unified advance / hold / deload explanations, including all
  contributing load and recovery factors.
- [x] Allow manual override with a clear record of the decision.

**Completed outcome:** weekly progression combines required adherence and minimum
strength-session completion with recovery, strength-session quality, scheduled
running load, and scheduled aerial participation.

Advance, advance-with-warning, hold, and deload behavior use a unified decision
model with persisted reasons and contributing factors. Manual overrides preserve
the original automatic decision and remain auditable.

## 3.3 Steady-State Programming

### 3.3.1 Steady-State Strength Programming — COMPLETE

- [x] Validate Monday / Wednesday / Friday as the long-term strength structure.
- [x] Validate Gym A / Gym B / Gym C as full-body sessions distributed across
  the week.
- [x] Review weekly movement-pattern balance and strength volume.
- [x] Add a true hip-hinge pattern to Gym C using Dumbbell Romanian Deadlift.
- [x] Preserve editable workout templates and existing exercise progression.
- [x] Keep gym-day conditioning separate from the strength exercise templates.

**Completed outcome:** steady-state strength uses three nonconsecutive full-body
sessions on Monday, Wednesday, and Friday.

### 3.3.2 Weekly Conditioning Structure — COMPLETE

- [x] Validate running/cardio placement around strength and aerial training.
- [x] Treat Monday and Wednesday post-strength cardio as incline treadmill
  walking at Zone 2 rather than scheduled running.
- [x] Preserve Tuesday as Aerial OR a programmed run.
- [x] Preserve Thursday as Aerial OR recovery-oriented activity.
- [x] Remove fixed Friday adaptive intervals.
- [x] Preserve Saturday as the primary long-endurance day.
- [x] Preserve Sunday as recovery.
- [x] Keep supplemental gym-day aerobic work distinct from the running program.

**Completed outcome:** the default steady-state week separates supplemental
Zone 2 conditioning from actual running.

### 3.3.3 Adaptive Running Progression — COMPLETE

- [x] Define the steady-state running progression model after the initial ramp.
- [x] Generate an appropriate Tuesday run prescription when running is selected
  instead of aerial.
- [x] Progress Tuesday running between easy and interval development work based
  on current running capacity and completed performance.
- [x] Define a progressive Saturday endurance-duration prescription.
- [x] Use scheduled-run completion, actual duration, and RPE when determining
  subsequent running progression.
- [x] Account for aerial substitution so choosing aerial on Tuesday does not
  incorrectly count as failed running progression.
- [x] Avoid increasing running load when recent performance or recovery does not
  support progression.
- [x] Keep manual/extra runs as useful history without allowing them to
  automatically advance the prescribed running program.
- [x] Surface the current run prescription clearly when starting a scheduled run.
- [x] Verify running progression works across calendar-week rollover and
  steady-state repeats.

**Completed outcome:** steady-state running uses independently adaptive Tuesday
Development and Saturday Endurance progression tracks.

### 3.3.4 Deload and Return-to-Training Validation — COMPLETE

- [x] Revalidate the deload template against the finalized steady-state strength
  and conditioning structure.
- [x] Update deload incline-treadmill/cardio activity types and labels.
- [x] Remove stale deload references to fixed Friday adaptive intervals.
- [x] Keep aerobic work easy during deload weeks.
- [x] Validate strength-volume reduction against the finalized Gym A / B / C
  templates.
- [x] Define return-to-training behavior after illness.
- [x] Define return-to-training behavior after travel.
- [x] Define return-to-training behavior after a prolonged training break.
- [x] Avoid automatically returning to full steady-state load when recent
  training history indicates that a short re-ramp is more appropriate.
- [x] Preserve historical performance and progression data when a re-ramp is
  required.

**Completed outcome:** deload and return-to-training behavior reuse the finalized
training structure while preserving historical progression state.

## 3.4 Adaptive Scheduling

### 3.4.1 Activity Rescheduling — COMPLETE

- [x] Allow a scheduled activity to be moved to another day.
- [x] Preserve the original training activity identity when rescheduled.
- [x] Record the original date and rescheduled date.
- [x] Ensure a legitimately rescheduled activity is not counted as a missed
  adherence requirement on its original day.
- [x] Update Today's Mission and the remaining weekly schedule after an accepted
  move.

### 3.4.2 Schedule Conflict Evaluation — COMPLETE

- [x] Detect conflicts created by moving strength, running, aerial, or recovery
  activities.
- [x] Preserve appropriate spacing between strength sessions where practical.
- [x] Account for aerial load when moving adjacent upper-body/strength work.
- [x] Account for running load when rearranging strength and endurance days.
- [x] Avoid unnecessarily stacking hard sessions on consecutive days.
- [x] Distinguish situations where moving, substituting, shortening, or skipping
  an activity is the better option.

### 3.4.3 Adaptive Schedule Recommendations — COMPLETE

- [x] Recommend an appropriate revised week when the planned day is unavailable.
- [x] Explain why the proposed rearrangement is appropriate.
- [x] Let the user accept or reject the proposed schedule change.
- [x] Preserve user control rather than silently rearranging the program.
- [x] Integrate backup/home/shortened workouts when substitution is preferable
  to rescheduling.
- [x] Recalculate downstream weekly recommendations after an accepted schedule
  change.

**Completed outcome:** adaptive scheduling turns real-life availability
constraints into explicit, user-reviewed schedule recommendations while
preserving canonical training-plan identity.

**Milestone: COMPLETE:** Fitness OS adapts training load, running progression,
recovery, and weekly scheduling rather than merely moving through a fixed
calendar.

## Workout Execution UX Follow-up

These items improve workout preparation and input consistency without changing
the canonical training-plan or progression systems.

- [x] Inspect the active-workout, template, history, and progression architecture
  before introducing warm-up records.
- [x] Add an explicit general/session warm-up experience before working sets.
- [x] Support exercise-specific ramp-up sets where appropriate.
- [x] Keep warm-up and ramp-up sets distinct from working sets so they do not
  affect prescribed working-set completion, training volume, PR detection, or
  progression decisions.

**Session warm-up checkpoint:** Active strength workouts now show a concrete
three-step preparation card before exercise working sets: easy cardio, one
movement round, and a light practice set for the first main exercise. Completion
or an intentional skip persists on the canonical workout session and can be
reopened. Session warm-up state is stored outside `ExerciseSet`, so it cannot
enter prescribed set counts, volume, PRs, or progression. TypeScript, the
production build, initial/completed states, and persistence after refresh passed.

**Exercise ramp-up checkpoint:** Externally weighted repetition exercises now
offer up to three optional, editable ramp-up sets stored under a separate
`rampUpSets` collection. Defaults scale conservatively from the first working
load at approximately 50% × 8, 70% × 5, and 85% × 3. The verified 210 lb Leg
Press example produced 105×8, 145×5, and 180×3; completion styling worked while
the workout header remained at 0/19 working sets. Ramp-up records persist with
the canonical workout session but are not read by working-set completion,
volume, progression, or PR logic. A deliberately extreme ramp-up regression
confirmed PR isolation; all tests, TypeScript, and the production build passed.
- [x] Define one canonical RPE scale and explanation for Fitness OS.
- [x] Add a lightweight reusable RPE legend/help component anywhere RPE is
  entered or interpreted, including strength workouts and running. Prefer a
  compact help button that opens a popup or mobile-friendly sheet rather than
  permanently adding height to workout cards.
- [x] Use consistent reps-in-reserve guidance, including RPE 10 as maximal
  effort/no reps remaining, RPE 9 as approximately one rep remaining, RPE 8 as
  approximately two, and RPE 7 as approximately three.
- [x] Ensure existing stored RPE values remain compatible if the input UX or
  explanatory component changes.
- [x] Activate the existing exercise-card expansion contract so each exercise
  can be collapsed or expanded independently during an active workout.
- [x] Keep a compact exercise header visible when collapsed, including exercise
  position and completed/total set progress.
- [x] Give completed exercises a clear pale-green card/header state while
  keeping them reopenable for review or correction.
- [x] Preserve entered set state and allow exercises to be completed out of
  program order when equipment or machine availability requires jumping around.
- [x] Initially expand the first incomplete exercise without forcing the user to
  follow workout order or restricting multiple manually expanded cards.
- [x] Verify completion styling and the first-incomplete exercise remain correct
  after adding/removing sets, substituting an exercise, and completing exercises
  out of order.
- [x] Evaluate a compact sticky exercise navigator or exercise-list sheet after
  collapsible cards are implemented; add it only if jumping between distant
  exercises still requires excessive scrolling.

**Exercise navigator checkpoint:** Long active workouts now include a compact
sticky horizontal navigator with workout-order numbering and live completed/
total working-set progress. Selecting an exercise expands it when needed and
scrolls directly to its card; completed exercises receive a distinct success
state without changing the existing free-order completion model. Jumping from
Leg Press to Shoulder Press, sticky behavior, the fixed bottom navigation, and
the production build passed in the browser.

---

# Phase 4 — Body Composition and Goal Progress

**Priority: COMPLETE**

Fat loss is the primary outcome, so Fitness OS needs to measure whether training
and lifestyle are actually moving body composition in the desired direction.

Phase 4 establishes longitudinal body-composition tracking, goal projection, and
progress review while preserving the distinction between raw measurements,
higher-quality assessments such as DEXA, and long-term trends.

## 4.0 Body-Composition Storage Foundation — CORE COMPLETE / FOLLOW-UP REMAINS

- [x] Define persistent data models for goals, measurements, DEXA records,
  weekly check-ins, and progress-photo metadata.
- [x] Add authenticated cloud-backed storage for DEXA report files and progress
  photos.
- [x] Keep uploaded files separate from structured Fitness OS record data.
- [x] Associate uploaded-file metadata with user-owned structured records.
- [x] Enforce per-user access controls for uploaded files.
- [x] Define basic file replacement and deletion behavior.
- [x] Ensure deleting a DEXA record intentionally removes its associated uploaded
  report.
- [x] Define and implement DEXA recovery behavior when report upload succeeds but
  structured record persistence fails, or when report upload fails before
  structured persistence begins.
- [x] Verify DEXA records remain usable when an optional uploaded report is
  unavailable.

**Core foundation complete:** structured body-composition records and private
uploaded-file storage are implemented and support the completed Phase 4
workflows.

Remaining progress-photo hardening and file-isolation verification are tracked
under the Phase 4 Enhancement & Hardening Backlog rather than keeping the
user-facing Phase 4 milestone open.

## 4.1 Goal Profile — COMPLETE

- [x] Add user goal configuration.
- [x] Support fat-loss/body-composition goal as the primary goal.
- [x] Store target/goal context without overemphasizing a single scale number.
- [x] Support optional goal weight.
- [x] Support optional goal body-fat percentage.
- [x] Support relevant performance/hobby goals.
- [x] Store goal effective/start date.
- [x] Preserve historical goals when goals change.
- [x] Support expected rate of change.
- [x] Calculate projected goal completion date.
- [x] Recalculate projection from observed progress trends.
- [x] Compare actual rate of progress with expected rate.
- [x] Identify plateaus or unusually rapid changes without automatically changing
  training or nutrition targets.

**Completed outcome:** goal profiles can be created and changed while retaining
historical goal records and effective dates.

## 4.2 Measurements and Body Composition — COMPLETE

- [x] Add body-weight logging.
- [x] Add waist measurement logging.
- [x] Add optional body-fat percentage logging.
- [x] Add optional lean-mass logging.
- [x] Support additional useful body-composition measurements:
  - Neck.
  - Shoulders.
  - Chest.
  - Abdomen.
  - Hips.
  - Left/right upper arms.
  - Left/right thighs.
  - Left/right calves.
  - Fat mass.
- [x] Record measurement date and optional notes.
- [x] Track measurement source/provenance:
  - Manual measurement.
  - Home scale/device.
  - DEXA.
- [x] Preserve historical measurements rather than overwriting prior entries.
- [x] Distinguish raw measurements from calculated trend values.
- [x] Use rolling trends rather than reacting to daily weight noise.
- [x] Support comparison between measurements from selected dates.

**Completed outcome:** raw measurement history remains separate from derived
analysis and supports multiple measurement sources.

## 4.3 DEXA Records — COMPLETE

- [x] Support optional DEXA scan records.
- [x] Store scan date.
- [x] Support upload and storage of the original DEXA report.
- [x] Store relevant DEXA-derived metrics when available.
- [x] Preserve DEXA as a distinct measurement source.
- [x] Support manual entry of DEXA values.
- [x] Treat automatic DEXA report extraction as an optional later enhancement.
- [x] Support comparison between DEXA scans.

**Completed outcome:** DEXA scans can be created, edited, deleted, and compared
while remaining a distinct body-composition measurement source. Original reports
remain private and are stored separately from structured record data.

## 4.4 Weekly Progress Check-In — COMPLETE

- [x] Add an optional weekly progress check-in.
- [x] Reference body weight from the preferred Body Measurement recorded on the
  check-in date.
- [x] Reference waist measurement when available.
- [x] Reference body-fat measurement when available.
- [x] Record optional notes.
- [x] Support optional weekly progress photos:
  - Front.
  - Side.
  - Back.
- [x] Associate progress photos with the check-in date.
- [x] Allow measurements or photos to be skipped without preventing check-in
  completion.
- [x] Show change since the previous check-in.
- [x] Show rolling weight trend rather than relying on a single measurement.
- [x] Show progress toward the current goal.
- [x] Keep Body Measurements as the canonical measurement source rather than
  duplicating measurement values inside weekly check-ins.
- [x] Prefer Manual measurements, then Home Scale measurements, when resolving
  the same-date measurement for a check-in while preserving DEXA as a distinct
  measurement source.

**Completed outcome:** Weekly Progress Check-In provides a lightweight review
layer over the canonical body-composition system.

## 4.5 Progress Summary and Dashboard — COMPLETE

- [x] Add body-weight trend visualization.
- [x] Add waist trend visualization.
- [x] Add body-fat trend visualization when sufficient data is available.
- [x] Add lean-mass trend visualization when sufficient data is available.
- [x] Clearly distinguish raw measurements from trend values.
- [x] Show progress toward the current goal.
- [x] Show expected versus actual rate of progress.
- [x] Show projected goal completion date.
- [x] Track meaningful progress milestones.
- [x] Add DEXA comparison view.
- [x] Add progress-photo timeline.
- [x] Add side-by-side progress-photo comparison.
- [x] Combine body-composition trend with strength retention/progression.
- [x] Combine running/cardio trend.
- [x] Combine training adherence.
- [x] Highlight whether the current approach appears to be working.
- [x] Avoid automatic training changes from a single measurement or short-term
  fluctuation.

**Milestone: COMPLETE:** Fitness OS can answer **“Is this program actually
getting me toward the outcome I want?”** using body-composition trends, goal
progress, training performance, cardio progress, and adherence.

## Phase 4 Enhancement & Hardening Backlog

These items extend or harden the completed Phase 4 workflows without reopening
the Phase 4 core milestone.

### Progress-photo hardening

- [ ] Ensure deleting a progress check-in intentionally removes its associated
  uploaded progress photos.
- [ ] Define and implement progress-photo recovery behavior for partial
  upload/structured-record failures.
- [ ] Verify weekly check-in records remain usable when optional progress photos
  are unavailable.
- [ ] Verify uploaded-file isolation using separate authenticated accounts or an
  appropriate integration-test environment.

### Progress-photo UX

- [ ] Add in-app preview for progress photos.
- [ ] Show photo thumbnails in weekly check-in history.
- [ ] Allow opening a larger photo preview without downloading the original file.
- [ ] Support HEIC/HEIF photos with a browser-compatible preview representation.
- [ ] Preserve the original uploaded photo in private storage.
- [ ] Keep progress-photo previews private and authenticated.

### Body-measurement UX

- [ ] Add an optional interactive body-map measurement interface.
- [ ] Show measurement locations on a front/back body silhouette.
- [ ] Allow a measurement location to be selected directly from the body map.
- [ ] Show current and previous values/change for the selected measurement.
- [ ] Preserve the conventional measurement form as an efficient alternative for
  complete measurement entry.
- [ ] Ensure body-map entry supports historical dates using the existing
  measurement date model.
- [ ] Support date-to-date body-map comparison.
- [ ] Keep the body map as an alternate interface over canonical Phase 4
  `BodyMeasurement` records rather than introducing a second measurement model.

### Optional later enhancement

- [ ] Consider automatic extraction of supported DEXA values from uploaded
  reports if it provides enough value to justify the added complexity.

---

# Phase 5 — Nutrition and Daily Activity

**Priority: COMPLETE**

Nutrition and daily movement materially affect the primary fat-loss goal, but
Fitness OS should avoid becoming a cumbersome food diary.

Phase 5 owns lightweight lifestyle tracking, adherence calculations, and the
multi-week evidence needed to contextualize goal progress. It should produce
canonical reusable evidence; Phase 6 owns periodic interpretation and review.

## 5.1 Nutrition Targets — COMPLETE

- [x] Add configurable calorie target.
- [x] Add configurable protein target.
- [x] Preserve historical targets when targets change.
- [x] Record target effective dates.
- [x] Add simple daily nutrition adherence input.
- [x] Track weekly protein adherence.
- [x] Track weekly calorie adherence where data is available.
- [x] Distinguish target values from actual/adherence data.

### Nutrition Target Recommendation Follow-up — COMPLETE

- [x] Add an optional `Calculate suggested targets` flow during nutrition-target
  setup rather than requiring users to already know calorie and protein values.
- [x] Estimate maintenance calories from sex, age, height, weight, and activity
  level using a documented standard BMR/TDEE method.
- [x] Support lose, maintain, and gain goals with a user-reviewable goal rate or
  calorie adjustment.
- [x] Recommend protein primarily from body weight, or recent lean-mass data when
  a suitable DEXA/body-composition record is available.
- [x] Present calculated values as recommendations that the user must confirm or
  edit; never silently replace canonical nutrition targets.
- [x] Keep the existing effective-dated nutrition-target system canonical after
  the user accepts or edits a recommendation.

**Calculator foundation:** A pure recommendation engine now uses the
Mifflin–St Jeor method plus an explicit activity multiplier to estimate
maintenance calories, then applies a reviewable lose/maintain/gain rate or
direct calorie adjustment. Protein uses recent lean mass when supplied and
otherwise uses body weight. The engine validates inputs and returns suggestions
without writing targets; production build passed. Keep the follow-up items open
until the optional setup flow lets the user review, edit, and explicitly save
the suggested values through the canonical effective-dated target system.

**Calculator setup checkpoint:** The nutrition-target editor now offers an
optional calculator that keeps suggestions separate from saving and requires an
explicit `Use These Suggestions` step before populating the canonical editable
fields. It prefills the latest stored body weight, latest DEXA lean mass, and
active goal direction/rate while leaving currently unstored profile inputs
manual. A separate canonical metabolic-rate record preserves dated measured
or estimated RMR values, source provenance, test-time weight, and notes; it is
included in cloud sync. Settings now provides RMR entry and history, and the
calculator immediately prefers the latest stored RMR while retaining Mifflin-St
Jeor as its explicit fallback. Entry, history, calculator consumption, deletion
fallback, and the production build were verified. Protein recommendations use a
range-based cross-check that avoids an abrupt lean-mass-versus-body-weight result.

**Protein recommendation checkpoint:** Protein now uses a bounded useful range
with one editable starting recommendation rather than treating lean mass as the
literal gram target. Recent lean mass refines the range and body weight
cross-checks it; body weight supplies the range when lean mass is unavailable.
For the verified 196 lb body-weight and 125 lb lean-mass example, the calculator
shows a 135–175 g useful range with a 150 g starting recommendation. Accepting
the suggestion still populates only the editable canonical target field. The
calculation tests and production build passed.

**Completed outcome:** Fitness OS supports effective-dated calorie and protein
targets with preserved target history. Daily nutrition remains intentionally
lightweight: users can record calorie totals, protein totals, and optional notes
without entering individual foods or meals.

Nutrition targets, actual daily intake, and derived adherence remain separate
data layers. Daily adherence compares intake against the target that was active
on that date.

Protein adherence tracks whether the daily minimum was met while separately
showing average intake relative to target. Higher-protein days therefore do not
mathematically compensate for days below target.

Calorie adherence tracks whether daily intake remained within the configured
target range while separately showing average intake relative to target.

Current-week nutrition adherence is surfaced in Weekly Progress with explicit
data coverage so unlogged days are not silently treated as adherence failures.

### Previous-Day Finalization

- [x] Prompt on Today when yesterday contains provisional nutrition or step
  totals.
- [x] Allow the user to confirm the displayed values or correct and confirm them
  together.
- [x] Keep unconfirmed yesterday data out of Reflect lifestyle evidence.
- [x] Preserve existing history by treating records older than the one-day
  confirmation window as settled.

**Finalization checkpoint:** Canonical daily nutrition and step records now
support an optional confirmation timestamp. Today displays a compact Confirm
Yesterday card with calories, protein, and steps when yesterday has unresolved
data. Confirm and Edit continue through the existing canonical storage hooks;
no parallel daily dataset was introduced. Reflect excludes unresolved yesterday
records, while the grace rule leaves older and legacy history usable. The
provisional/confirmed/grace regression, TypeScript, production build, populated
Today state, Confirm action, and persistence after refresh passed.

## 5.2 Steps / General Activity — COMPLETE

- [x] Add configurable daily step target.
- [x] Preserve historical step targets when targets change.
- [x] Add daily step logging/completion.
- [x] Track weekly step adherence.
- [x] Track general-activity trends where useful.
- [x] Design the daily-activity model so future imported step data can preserve
  source/provenance without creating a second steps dataset.
- [x] Defer automatic health-platform step import to Phase 8.

**Completed outcome:** Fitness OS now supports effective-dated daily step targets
with preserved target history and lightweight daily step logging.

Daily step records use one canonical record per calendar date. Existing records
can be edited or intentionally cleared, and manual records preserve source
metadata so future health-platform imports can extend the same daily-activity
domain rather than creating a parallel steps dataset.

Weekly Progress evaluates step adherence using the target that was active for
each eligible date. Adherence tracks whether each logged day met its daily
target, while average step volume is shown separately so unusually high-step
days do not compensate for lower-step days.

Unlogged days are not silently treated as failures. Data coverage is surfaced
explicitly so adherence can be interpreted in the context of how much of the
week was actually recorded.

Progress also includes a recent daily-activity view with the current target,
14-day logged-day average, data coverage, target consistency, and step trend.
Short-term low-step days remain visible without being treated as meaningful
goal-progress evidence by themselves.

## 5.3 Goal-Progress Evidence — COMPLETE

- [x] Combine nutrition adherence with Phase 4 body-composition trends.
- [x] Combine general-activity adherence with Phase 4 body-composition trends.
- [x] Use multiple weeks of evidence before identifying nutrition/activity as a
  likely contributor to slower or faster progress.
- [x] Compare observed body-composition progress with the expected rate
  established by the active goal.
- [x] Identify persistent patterns that may explain goal-progress trends.
- [x] Preserve evidence strength/coverage so missing data is not interpreted as
  failure.
- [x] Avoid drawing conclusions from individual high-calorie days, low-step days,
  isolated scale measurements, or other short-term noise.
- [x] Produce reusable derived evidence for Phase 6 Reflect rather than embedding
  review/presentation logic inside Phase 5.

**Completed outcome:** Fitness OS now combines canonical body-composition
progress with nutrition and daily-activity adherence as supporting lifestyle
evidence.

Lifestyle evidence is evaluated across multiple weeks and preserves explicit
data coverage so missing nutrition or step records are not interpreted as
failures. Short-term events such as an individual high-calorie day, low-step
day, or isolated body-weight measurement are not used to explain progress.

When sufficient history exists, persistent nutrition and daily-activity patterns
can provide context for whether observed body-composition progress is faster,
slower, or consistent with the rate established by the active goal. These
patterns remain contextual evidence rather than proof of causation and do not
automatically change training or lifestyle targets.

When evidence is insufficient, Fitness OS explicitly reports that more data is
needed rather than manufacturing an explanation.

The resulting goal-progress evidence is reusable by Phase 6 Reflect without
requiring Reflect to duplicate canonical Phase 4, nutrition, or daily-activity
analysis.

**Milestone: COMPLETE:** Today's Mission and Weekly Progress include real
nutrition and step data, and Fitness OS has reliable multi-week nutrition and
daily-activity evidence available for goal-progress analysis without becoming a
full food diary.

---

# Phase 6 — Reflect: Reviews and Better Progress Insights

**Priority: HIGH — CURRENT**

Phase 6 turns the canonical data and derived evidence established by the
training system, Phase 4 body-composition tracking, and Phase 5
nutrition/activity tracking into concise periodic reflection.

Reflect should interpret existing data rather than duplicate the underlying
tracking dashboards or recalculate canonical domain logic.

## 6.1 Weekly Review — COMPLETE

- [x] Add a structured weekly review.
- [x] Summarize scheduled vs completed training.
- [x] Summarize strength progress.
- [x] Summarize running/cardio progress.
- [x] Summarize recovery trend.
- [x] Summarize body-composition trend when sufficient data is available.
- [x] Summarize nutrition and daily-activity adherence when available.
- [x] Compare current progress with the active goal and expected rate.
- [x] Explain the next week's training decision.
- [x] Highlight one or two useful observations rather than dumping metrics.
- [x] Distinguish meaningful trends from normal short-term noise.
- [x] Explicitly acknowledge when insufficient data exists to draw a useful
  conclusion.
- [x] Use the current week for adherence reporting, but require multi-week
  evidence before attributing body-composition progress to nutrition or daily
  activity.

**Completed outcome:** Reflect now provides a concise current-week review using
current training adherence, training quality, recovery support, and the next
week's provisional training decision. What Stands Out remains current-week
focused, while longer-term body-composition, strength, running, recovery,
nutrition, and daily-activity evidence is reserved for Longer-Term Review or
kept under Still Learning until it is sufficient.

**Training-week boundary correction:** Fitness OS now uses Sunday–Saturday as
the canonical training week so Sunday can serve as recovery, planning, and the
start of the upcoming schedule. Active-week Reflect is labeled `Week So Far`,
counts only required opportunities due to date, and keeps the next-week decision
pending until the boundary closes. Automatic progression continues to persist
only completed-week decisions. Existing dated activity history remains unchanged;
legacy evaluated-week identifiers receive Sunday aliases to prevent duplicate
evaluation, while finalized decision records remain preserved as originally
recorded. The migration, schedule ordering, history retention, current-week
presentation, production build, and boundary regression tests passed.

## 6.2 Longer-Term Progress Review

Longer-term reviews should consume canonical Phase 4 progress analysis and
existing training/cardio history rather than reimplementing their calculations.

**Reflect interpretation handoff:**

- [x] Separate what historical measurements show from conclusions about whether
  the current approach is working.
- [x] Account for evidence freshness, including when the most recent relevant
  measurement occurred.
- [x] Identify whether the available evidence represents the current training
  program period rather than relying on measurements that substantially predate
  it.
- [x] Require sufficient elapsed time and relevant evidence under the current
  approach before evaluating its effectiveness.
- [x] Prefer an explicit conclusion such as `Too early to evaluate the current
  approach` when the active program has not accumulated enough relevant
  evidence, while still allowing older historical trends to be described as
  context.
- [x] Ensure any Reflect interpretation of training quality, fatigue, or
  progression uses the same canonical RPE definition shown during data entry;
  do not draw confident conclusions from inconsistently defined effort data.

- [x] Support useful longer-term review periods.
- [x] Compare current body-composition progress with earlier periods.
- [x] Summarize strength retention/progression during fat loss.
- [x] Summarize cardiovascular progress.
- [x] Summarize adherence over the review period.
- [ ] Surface meaningful milestones and PR/history highlights.
- [x] Incorporate DEXA comparisons when available.
- [ ] Incorporate progress-photo comparisons when useful.
- [x] Evaluate whether the current approach appears to be moving toward the
  active goal.
- [x] Avoid treating any single metric as the definition of success.

**Implemented checkpoint:** Longer-Term Review supports 4-week, 12-week,
6-month, 1-year, and all-history periods over canonical body-composition,
whole-program strength, running, recovery, adherence, milestone, and DEXA data.
Each domain retains its own evidence requirements, DEXA comparisons use scans
contained within the selected period, and insufficient evidence is reported
without manufacturing a conclusion. Current Approach now evaluates only the
active-program period across body composition, whole-program strength, cardio,
and adherence; it requires multiple available signals, treats missing evidence
as unavailable rather than positive, and explicitly defers conclusions when the
program is too new.

**Pending real-data verification:**

- Keep milestone/PR highlights open until an exercise has at least two completed
  performances and a later performance exceeds its prior estimated-strength
  best. Verify the PR appears only in review periods containing its achievement
  date while earlier history remains the comparison baseline.
- Keep progress-photo comparison integration open until at least two weekly
  check-ins contain the same photo view. Verify the observation appears only in
  eligible review periods, reports the correct earliest/latest comparison dates
  and shared views, and links to the existing private Progress Photo Comparison
  workflow.

**Implemented highlight foundation:** Longer-Term Review now derives
estimated-strength PRs against all earlier completed history while including an
observation only when its achievement date falls inside the selected period. It
also identifies the earliest and latest in-period progress check-ins sharing at
least one photo view and links the resulting observation to the existing private
photo-comparison workflow. Focused regression tests cover historical PR
baselines, period filtering, shared-view comparison selection, and the no-valid-
comparison state. All 13 project tests, the TypeScript check, the production
build, and the current insufficient-evidence browser state pass; keep the two
feature items open for the real-data cases above.

## 6.3 Review and Progress UX

Extend existing Progress views where richer visualization is useful. Reflect
should link, summarize, or consume those canonical views rather than creating
parallel dashboards.

**Progress cleanup handoff:**

- [x] Clarify the Progress information hierarchy so the page leads with a
  concise reflection and makes supporting detail progressively available rather
  than presenting every section with equal visual weight.
- [x] Reduce repeated conclusions and metrics across Weekly Review, outcome
  summaries, and domain-specific progress sections so each insight has one clear
  primary home.
- [x] Move target-setting out of Progress while continuing to display relevant
  targets as context for trends and outcomes. Keep quick daily inputs such as
  weight entry on Today, keep reflection and comparison in Progress / Reflect,
  and place target configuration in the most appropriate existing Goals, Plan,
  or Settings architecture rather than creating a parallel Goals system.
  Outcome, nutrition, and step-target editors now live together under Settings
  → Goals & Targets; Today shows a compact read-only target summary before the
  related daily inputs, while canonical Progress views continue consuming the
  active targets as analysis context.
- [x] Plot time-series observations using their actual measurement date/time on
  the x-axis so unequal collection intervals receive proportional visual
  spacing.
- [x] Define an intentional chart-density and history strategy as data
  accumulates, such as a recent default window, selectable 3M / 6M / 1Y / All
  ranges, and aggregation or downsampling for dense periods.
- [x] Preserve the complete underlying history even when a chart range or
  density strategy does not render every individual observation.

**Time-axis audit:** Every current time-series visualization maps its underlying
observation date to a numeric timestamp and uses a proportional time scale.

**History-range audit:** Body-composition, recovery, and strength charts use the
shared 3M / 6M / 1Y / All display-range model with a recent default window.
Filtering is presentation-only; canonical measurements, performance history,
and all-history strength summaries remain intact.
This covers body weight, body measurements, and exercise-strength progress, so
unequal intervals are not rendered as equally spaced categories. Running and
adherence currently provide summaries rather than time-series charts. Future
charts must retain this timestamp-based convention and reuse the shared history
range model where a selectable time window is useful.
- [x] Replace alphabetical first-exercise defaults with one reusable,
  evidence-based strength-exercise selection mechanism across Longer-Term
  Review, Strength Retention, and Exercise Progress. When no exercise has enough
  repeated evidence, show a neutral `Choose exercise` state instead of implying
  that an arbitrary exercise is representative.

**Verified cleanup checkpoint:** Progress now leads with Weekly Review and
Longer-Term Review, followed by the single Current Approach outcome summary and
then supporting domain detail. The duplicated embedded outcome, strength,
cardio, and adherence summaries were removed from Body Composition Progress.
Longer-Term Review now evaluates whole-program strength evidence rather than
defaulting to one arbitrary exercise; the obsolete embedded Strength Retention
selector was removed; and Exercise Progress starts in a neutral `Choose
exercise` state while preserving its canonical per-exercise history after a
manual selection. Production build and browser verification passed.

**Time-axis verification checkpoint:** Weight, measurement/activity, and
per-exercise strength charts now retain timestamps and use continuous time
scales rather than equally spaced date categories. Production build passed, and
weight and step spacing were verified in the browser. The strength chart uses
the same continuous-time contract; its richer point-detail interaction remains
pending real data with at least two performances for one exercise.

**Body-composition history-range checkpoint:** Body-weight, waist, body-fat,
and lean-mass charts now share one 3-month, 6-month, 1-year, or all-history
display range, defaulting to 6 months. Filtering changes only the rendered chart
points; canonical measurements and rolling-trend calculations continue using
the complete stored history. Production build and all available range states
were verified in the browser. Strength and recovery now reuse the same range
model, completing the current chart-density/history strategy.

**Recovery visualization checkpoint:** Recovery now charts canonical calculated
readiness over actual elapsed time and reuses the shared 3-month, 6-month,
1-year, and all-history display-range control. Range filtering affects only the
rendered trend while the complete check-in history and existing history list
remain intact. Production build and the available five-check-in trend were
verified in the browser.

**Running visualization checkpoint:** Running Progress now includes a
pace-over-time chart using actual elapsed dates and the shared 3-month, 6-month,
1-year, and all-history display ranges. Lower pace is rendered higher, and each
point retains its underlying distance, duration, pace, and RPE context. The
production build and no-data state passed; keep the broader running
visualization item open until at least two runs with valid duration and distance
allow the trend, range states, and point details to be verified in the browser.

**Pending adherence verification:** Historical adherence visualization remains
open until the active plan has at least one complete evaluated training week.
Use the canonical complete-week adherence results when that evidence exists;
do not chart the current partial week as historical adherence.

**Adherence visualization checkpoint:** Progress now has a dedicated Training
Consistency section that keeps current-week completion distinct from a
range-selectable complete-week adherence chart. The chart consumes canonical
evaluated-week results and intentionally excludes the current partial week. The
production build and current-week metrics passed, followed by browser
verification of the completed Aug 23–29 Sunday–Saturday week at 100%. The
current partial week remains excluded from the historical chart. Current-week
tiles use the same due-so-far boundary as Reflect, so future required and
optional opportunities are not counted prematurely; the Sunday 0/0 state and
production build were verified in the browser.

- [ ] Improve strength trend visualization.
- [ ] Improve running trend visualization.
- [x] Improve recovery trend visualization.
- [x] Improve adherence trend visualization.
- [x] Integrate Phase 4 body-composition views without duplicating them.
- [x] Integrate Phase 5 nutrition/activity context where useful.
- [ ] Add meaningful PR/history highlights.
- [x] Make related progress signals easy to compare over the same time period.

**Verified integration checkpoint:** Progress renders canonical Phase 4
body-composition records, trends, comparisons, milestones, and photo workflows
without recreating their storage or calculations. Phase 5 nutrition and
daily-activity evidence feeds Weekly Review and Current Approach, while Daily
Activity Progress and Today retain their appropriate tracking roles.
Longer-Term Review applies one selected period boundary across body composition,
strength, running, recovery, and adherence while preserving each domain's own
evidence requirements. Production builds and the available period/range states
were verified in the browser.

## 6.4 Guide Feedback Loop

Guide integration is the final stage of the evidence pipeline:

1. Canonical systems produce data.
2. Phase 5/other domains produce reusable multi-week evidence.
3. Reflect interprets that evidence.
4. Guide uses appropriate persistent patterns as context for recommendations.

- [x] Make Guide aware of the latest completed review.
- [ ] Use persistent multi-week patterns as context for future recommendations.
- [x] Distinguish observations from actionable recommendations.
- [x] Use nutrition/activity adherence as coaching context, not punishment.
- [x] Avoid compensatory exercise recommendations for individual high-calorie
  days.
- [x] Avoid automatically increasing training load to compensate for nutrition
  adherence.
- [x] Avoid changing training from body-composition data alone.
- [x] Require training/recovery evidence before body-composition trends influence
  training-load decisions.
- [x] Surface persistent trends only when evidence is sufficient.
- [x] Explain when available evidence is insufficient to determine why progress
  is faster or slower than expected.
- [x] Preserve explicit user control over meaningful goal, calorie, protein, and
  activity-target changes.
- [x] Once sufficient intake and body-weight history exists, compare observed
  multi-week weight change against current intake before recommending a target
  adjustment; explain when the current intake is already producing the intended
  rate and no change is recommended.

**Adaptive nutrition-feedback checkpoint:** Canonical 28-day evidence now
includes average logged and target calories. After at least 21 days of adequate
calorie and body-weight evidence, Guide explains when observed progress is close
enough to the intended rate that no target change is recommended. A persistent
mismatch produces only a conservative 100–250 calorie/day review suggestion;
targets never change without confirmation. On-plan, slower, and faster trend
regressions, TypeScript, and the production build passed.

**Guide review-context foundation:** The Guide can now receive the latest
persisted weekly progression decision as optional completed-review context. The
context is displayed separately from the daily recommendation and explicitly
cannot override today's schedule or recovery guidance. Current no-review
behavior remains unchanged. The production build and populated Today state were
verified with the completed review for the week of 2026-08-23 displayed under
Observations while the independent Recovery Day recommendation remained intact.

**Guide persistent-pattern foundation:** Guide now evaluates persisted weekly
progression decisions for a repeated final outcome. Only two or more consecutive
completed reviews with the same advance/hold result produce a Persistent Pattern
observation. The observation is displayed separately and cannot modify today's
recommendation, schedule, or recovery guidance. The production build and
no-pattern Today state passed; keep the broader pattern item open until repeated
completed reviews allow the observation to be verified with real history.

**Guide observation/action contract:** Coach recommendations are explicitly
labeled as today's recommendation, while completed-review and persistent-pattern
context use a separate typed observation collection and dedicated Observations
section. Observations are explanatory and cannot override today's schedule or
recovery guidance. The production build and recommendation-only Today state
passed in the browser; observation rendering remains covered by the same pending
real-review verification above.

**Guide lifestyle-context guardrail:** Guide now consumes the canonical 28-day
nutrition/activity evidence model only after its existing minimum eligible-day
and logging-coverage requirements are met. Ready protein, calorie-range, and
step signals are summarized as neutral observations; individual days and sparse
logging are suppressed. Lifestyle context never enters daily recommendation
selection and explicitly cannot prescribe compensatory exercise or a
training-load increase. The production build and insufficient-evidence Today
state passed; keep populated observation verification pending until enough
nutrition/activity history exists.

When the canonical evidence model is not ready, Guide now surfaces a neutral
`Still learning` observation naming the missing body-composition, nutrition, or
activity coverage instead of silently suppressing context. The observation is
explanatory only and cannot change training or targets. The sparse-evidence state,
regression test, and production build passed.

**Guide decision-boundary audit:** Daily recommendation selection receives
today's schedule, completion state, and recovery inputs—not raw body-composition
changes. Completed-review, persistent-pattern, and lifestyle evidence is
attached only after the actionable recommendation has been selected. Persistent
patterns require repeated completed decisions, lifestyle context retains its
multi-week coverage thresholds, and observation objects have no target-writing
capability. Any future body-composition-informed training decision must first
arrive through a canonical multi-signal review with supporting training or
recovery evidence and explicit user control.

**Guide completion-awareness correction:** Coach now consumes the same
canonical scheduled-activity completion status used by Today. Completed
activities are removed from the remaining recommendation inputs, partially
completed days focus only on unfinished activities, and a fully completed day
shows `Training Complete` without a stale workout action. Rest and Recovery
activities remain non-completable. Production build and the completed Gym B
state were verified in the browser.

**Milestone:** Reflect explains what changed, why it may have changed, and what
matters next, and those insights improve future Guide decisions.

---

# Phase 7 — Personalization and Training Guidance

**Future — post-Core-v1**

Phase 7 adds user-specific preferences and execution guidance on top of the
established Fitness OS coaching system.

Personalization should configure existing planning, scheduling, completion, and
guidance systems rather than create parallel training logic.

## 7.1 Training Participation and Preferences

Training preferences provide constraints and ranking signals to the existing
training-plan and adaptive-scheduling systems. They do not directly replace
scheduled activities or create a parallel schedule.

- [x] Add configurable training modalities/activities the user participates in.
- [x] Allow users to disable supported training modalities that do not apply to
  them.
  - Example: a user who does not participate in aerials should not have aerial
    scheduled by the training plan.
- [x] Add preferred training days for enabled modalities.
- [x] Add preferred aerial days when aerial is enabled.
- [x] Add running availability/preferences when running is enabled.
- [x] Add available home/gym equipment and setup capabilities.
- [x] Add typical session-duration constraints.
- [x] Distinguish hard availability constraints from soft preferences.
- [x] Allow preferences to influence training-plan construction, adaptive
  scheduling, and workout alternatives without creating a parallel planning
  system.
- [x] Preserve the distinction between persistent preferences, temporary
  schedule constraints, and recovery-driven modifications.

**Training-participation checkpoint:** Settings now stores effective-dated
Strength, Running, and Aerial participation preferences in the canonical
training-plan state. The canonical schedule resolver applies the preference for
the requested date, so Today, weekly schedules, adherence, progression, and
schedule adjustments agree while support activities such as walking, mobility,
recovery, and rest remain available. Changes apply from their effective date
forward and do not rewrite earlier schedules or adherence. Disabling and
re-enabling Aerial was verified in the browser, including preservation of an
existing moved activity; 26 regressions, TypeScript, and the production build
passed.

**Preferred training-day checkpoint:** Each enabled modality now accepts
optional Sunday-through-Saturday preferred days in Training Preferences.
Selections are stored on the same effective-dated participation record, so
earlier preferences and history retain their original interpretation. These
are explicitly soft planning signals: saving or refreshing preserves the
selection, but does not rewrite the current schedule or disturb manual activity
moves. Strength and Aerial selections, persistence, unchanged current-week
scheduling, 26 regressions, TypeScript, and the production build were verified.

**Recurring aerial-session checkpoint:** Aerial preferences now distinguish
named recurring classes and open-studio sessions, including their weekday and
whether each is a fixed weekly commitment or a flexible opportunity. Session
details remain effective-dated with the participation record and add their days
to Aerial's preferred-day signals without rewriting the current schedule.
Tuesday Building Blocks and Thursday Lyra were verified as fixed commitments,
with Saturday open studio verified as flexible; persistence, 26 regressions,
TypeScript, and the production build passed.

**Running-preferences checkpoint:** When Running is enabled, Training
Preferences now combines preferred weekdays with an outdoor/treadmill setting
and a run/walk/continuous-format preference. The choices are effective-dated
planning signals and explicitly remain subordinate to recovery and adaptive
running-progression safeguards. Outdoor and run/walk preferences were verified
in the browser; persistence regression coverage, 26 tests, TypeScript, and the
production build passed.

**Equipment-profile checkpoint:** The Strength preference card now captures
separate Home and Gym equipment plus safe setup capabilities using the same
canonical equipment vocabulary already used by workout variants and exercise
substitutions. Defaults preserve the application's existing assumptions, while
saved profiles are effective-dated with the rest of the training preferences.
The controls were verified inside the Strength section, with persistence
coverage, 26 tests, TypeScript, and the production build passing; live workout
alternative consumption remains part of the later preference-influence item.

**Session-duration checkpoint:** Each enabled training modality now accepts an
optional typical session length and maximum available time. Values are stored
on the effective-dated training-preference record, and the editor keeps the
maximum from contradicting the typical duration. A 45-minute typical and
60-minute maximum Strength session was verified in the browser; persistence
coverage, 26 tests, TypeScript, and the production build passed. Schedule and
workout adaptation remain part of the later preference-influence item.

**Workout preference-consumption checkpoint:** The live workout screen now
resolves the effective Home/Gym equipment profile for the scheduled session
date. Workout-version availability and exercise substitutions use that profile
instead of hard-coded equipment assumptions. Home exercise selection was
verified using only configured equipment, and removing the required setup made
the Home Gym C variant unavailable while Full Gym and Short Gym remained.
Twenty-six tests, TypeScript, and the production build passed. Keep the broader
preference-influence item open until plan construction and adaptive scheduling
also consume the relevant preference signals.

**Adaptive preference-ranking checkpoint:** The canonical weekly
rearrangement evaluator now applies a small preference cost to proposed moves.
Unavailable dates and recovery/training-load conflicts remain dominant; among
otherwise safe choices, enabled-modality preferred days rank higher, fixed
Aerial commitments rank above flexible opportunities, and dates outside the
saved preferences rank lower. Existing schedules and manual moves are not
rewritten. Preference-penalty regression coverage, 26 tests, TypeScript, and
the production build passed. Keep the broader preference-influence item open
until initial plan construction also consumes these signals.

**Persistent-preference boundary checkpoint:** Training preferences now have a
dedicated cloud-synced record rather than being owned by the active plan. The
hook automatically migrates existing effective-dated preferences, keeps them
editable without an active plan, preserves them through plan reset, and injects
them when a new plan starts. Plan construction therefore begins with modality
constraints, adaptive rearrangement uses day/commitment ranking, and workout
alternatives use equipment/setup profiles, while manual reschedules and
recovery-driven modifications remain separate overlays. Existing preferences
survived migration, save, and refresh in the browser; 26 tests, TypeScript, and
the production build passed.

## 7.2 Coaching and Interaction Preferences

Coaching preferences influence recommendation ranking, explanation, and
discretionary choices. They must not silently override required training,
progression rules, recovery safeguards, or the active goal.

- [x] Add preferred training emphasis for discretionary coaching decisions.
- [x] Add preferred balance between strength, running/cardio, and enabled active
  hobbies.
- [ ] Add coaching aggressiveness/conservatism preferences where appropriate.
- [ ] Add preferred reminder/check-in behavior where appropriate.
- [ ] Keep goal configuration owned by Phase 4.
- [ ] Keep nutrition and activity targets owned by Phase 5.

**Coaching-preference source checkpoint:** Settings now provides a dedicated,
cloud-synced Coaching Preferences record. Users can choose an overall
discretionary focus (Balanced, Performance, Consistency, Recovery, or
Enjoyment) and independently set lower, standard, or higher optional emphasis
for Strength, Running/Cardio, and Active Hobbies. The UI explicitly states that
these signals cannot override the active goal, required training, progression,
or recovery safeguards. Consistency focus with higher Active Hobbies emphasis
was saved and verified after refresh; 26 tests, TypeScript, and the production
build passed. Coach consumption remains the next slice.

## 7.3 Exercise Guidance

Exercise guidance should extend canonical exercise definitions/metadata used by
workout execution rather than maintaining a separate exercise-guidance catalog.

- [ ] Extend canonical exercise metadata with guidance rather than creating a
  parallel exercise catalog.
- [ ] Add an optional exercise demo/details view.
- [ ] Show concise setup and execution instructions.
- [ ] Add visual demonstrations where they materially improve exercise
  understanding.
- [ ] Surface exercise-specific guidance such as unilateral/per-side execution.
- [ ] Keep guidance unobtrusive during normal workout logging.

## 7.4 Mobility & Flexibility Guidance

Mobility and stretching should remain a focused training-support feature, not
expand Fitness OS into a general yoga application.

Mobility routines prescribed as training-plan activities must use the canonical
training-activity completion system. Optional standalone mobility may retain
additional routine-level history only where useful beyond canonical completion.

- [ ] Add structured mobility and stretching guidance rather than relying on
  open-ended recovery labels.
- [ ] Add a small library of stretches and mobility drills with concise setup,
  execution, target-area, and safety cues.
- [ ] Support guided routines with explicit duration and per-side timing where
  appropriate.
- [ ] Provide useful default routines such as Full Body Recovery, Post-Run,
  Post-Strength, and Post-Aerial.
- [ ] Support routine duration targets such as 10, 15, and 20 minutes.
- [ ] Allow favorite and custom mobility/stretching routines.
- [ ] Allow tight/sore-area context to influence the recommended routine without
  automatically changing the underlying training plan.
- [ ] Route any training-plan modification caused by soreness through the
  existing recovery/Guide/adaptive-scheduling systems.
- [ ] Record completed prescribed mobility/stretching work through canonical
  training-activity completion.
- [ ] Allow mobility routine selection/content to evolve with demonstrated
  tolerance, preferences, and needs without creating an independent
  training-load progression system.

**Milestone:** Fitness OS can adapt how training is scheduled, balanced,
explained, and executed to the user's preferences while preserving canonical
training-plan, goal, progress, and adherence systems.

---

# Phase 8 — Health Data Integrations

**Future**

Health platforms are external data sources, not alternate Fitness OS data
models. Imported data should enter the existing canonical Fitness OS domain
wherever an equivalent record already exists.

Integrations should begin as read/import-only. Bidirectional writes should be
added only where a concrete user benefit justifies the added ownership and
conflict complexity.

## 8.1 Integration Foundation

- [ ] Evaluate Apple Health / Health Connect integration.
- [ ] Define source-of-truth/conflict rules before enabling bidirectional writes.
- [ ] Preserve imported source/provenance metadata.
- [ ] Define stable external-record identity so repeated imports of the same
  source record do not create duplicates.
- [ ] Define source-precedence rules for analysis when multiple legitimate
  records represent the same metric near the same time.
- [ ] Preserve legitimate conflicting observations rather than silently
  overwriting or deleting them.

## 8.2 Steps and Measurements

- [ ] Import step data into the canonical Phase 5 daily-activity model.
- [ ] Import weight/body-composition values into canonical Phase 4
  `BodyMeasurement` history.
- [ ] Prevent duplicate measurements when the same external record is imported
  repeatedly.
- [ ] Preserve Phase 4 measurement history rather than silently overwriting
  manually entered records.
- [ ] Keep DEXA-derived measurements distinct by provenance even when they
  represent equivalent metrics.

## 8.3 Recovery Inputs

- [ ] Import sleep/recovery inputs where useful.
- [ ] Preserve subjective Morning Check-In data as a distinct canonical input.
- [ ] Treat imported sleep/readiness metrics as supplemental recovery evidence
  rather than replacements for the user's subjective recovery report.

## 8.4 Running and Activity Import

- [ ] Import running/activity history only where it improves rather than
  duplicates Fitness OS.
- [ ] Match imported running/activity records against canonical Fitness OS
  workout/run history before creating new records.
- [ ] Prevent a Fitness OS-recorded run and the same health-platform workout from
  being counted twice.
- [ ] Do not automatically credit an imported run against a scheduled run unless
  explicit matching rules establish that relationship.

**Milestone:** Health integrations reduce manual entry while preserving one
canonical Fitness OS history and clear provenance for every imported record.

---

# Phase 9 — Social & Challenges

**Future major feature**

Fitness OS remains private by default. Social features operate through
purpose-built shared data rather than exposing raw canonical Fitness OS records.

Social features should consume intentionally generated shareable
projections/summaries rather than granting social access to private training,
recovery, nutrition, body-composition, or file-storage records.

## 9.1 Social Foundation

- [ ] Add a purpose-built social profile identity separate from authentication
  and internal account metadata.
- [ ] Add public/shareable profile fields.
- [ ] Add friend relationships and/or private groups.
- [ ] Add privacy controls.
- [ ] Add dedicated social database tables and RLS policies.
- [ ] Make sharing explicit by field/event category.
- [ ] Ensure joining a challenge or adding a friend does not implicitly broaden
  access to unrelated Fitness OS data.
- [ ] Treat body-composition measurements, DEXA reports, progress photos,
  nutrition data, recovery data, and other sensitive health-related data as
  private unless explicitly selected for sharing.

## 9.2 Challenges

### Flagship mode

- [ ] **Plan Consistency** — compete on percentage of each person's own planned
  training completed.
- [ ] Consume canonical Fitness OS training-plan/adherence results rather than
  independently deciding whether activities count as completed.

### Additional challenge modes

- [ ] Total workouts.
- [ ] Running distance.
- [ ] Steps.
- [ ] Strength volume.
- [ ] Plan-adherence or goal-specific streaks that do not penalize scheduled
  rest/recovery days.
- [ ] Balanced Fitness OS score.

### Challenge design rules

- [ ] Clearly identify raw-volume challenge modes as comparisons of absolute
  activity rather than program-relative adherence.
- [ ] Define the Balanced Fitness OS score transparently before implementation.
- [ ] Avoid opaque scoring that rewards unnecessary volume or penalizes
  appropriate recovery.
- [ ] Ensure challenge scoring does not pressure users to override recovery
  guidance, train through inappropriate conditions, or add junk volume solely
  for leaderboard position.

## 9.3 Competition UX

- [ ] Challenge creation/joining.
- [ ] Defined challenge periods.
- [ ] Leaderboards.
- [ ] Weekly bonuses/group milestones where appropriate.
- [ ] Optional activity feed with intentionally shared events.
- [ ] Achievements/badges only if they support motivation without making the core
  product feel like social media.

**Milestone:** Friends can compete fairly despite having different programs and
fitness levels while each person's private health/training data remains private
unless intentionally shared.

---

# Phase 10 — Advanced Platform & Coaching Capabilities

**Later / as justified**

## 10.1 Advanced Synchronization

- [ ] Active-workout cross-device conflict handling.
- [ ] Active-run cross-device conflict handling.
- [ ] Near-live synchronization only if actual usage demonstrates a need.

## 10.2 Proactive Guidance

- [ ] Notifications/reminders.
- [ ] Calendar/travel awareness.
- [ ] Feed calendar/travel availability context into existing training-planning
  and adaptive-scheduling systems rather than independently modifying the
  schedule.

## 10.3 Advanced Coaching

- [ ] Improve coaching models where additional evidence produces materially
  better recommendations while preserving explainability, user control, and
  canonical domain rules.
- [ ] Add support for additional training modalities where justified.
- [ ] Integrate additional modalities into canonical training-load, scheduling,
  completion, and progression systems rather than creating isolated mini-apps.

## 10.4 Product Maturity

- [ ] Broader multi-user onboarding/product polish.

---

# Cross-Cutting Technical Debt and Maintenance

These items should be addressed opportunistically when related code is already
being modified. They should not displace core roadmap work unless they create
correctness, privacy, data-loss, security, or significant maintainability risk.

## Storage and Persistence

- [ ] Consolidate `lib/storage/keys.ts` and
  `lib/storage/fitnessOsStorageKeys.ts` into one canonical storage-key registry.
- [ ] Replace remaining duplicated/local string storage keys with references to
  the canonical registry.
- [x] Establish a project-owned Supabase migration/policy structure for DEXA
  report and progress-photo file storage.
- [x] Document the boundary between structured synchronized data and uploaded
  binary files.
- [ ] Review startup cloud hydration/conflict behavior as additional cross-device
  editable datasets are introduced.
- [ ] Add explicit recovery/error handling for partial cloud/file operations.
- [ ] Complete storage-key consolidation before Phase 7 introduces another major
  group of persistent preference/settings data.

## Shared Utilities

- [ ] Consolidate duplicated `createId()` helpers into a shared utility.
- [ ] Consolidate canonical local-date/calendar helpers used for persisted
  date-only values and training-week calculations.
- [ ] Keep timestamp handling distinct where time-of-day matters.
- [ ] Prefer shared typed persistence helpers over feature-specific
  `localStorage` parsing for new persistent data.
- [ ] Keep serialization, synchronization, and storage mechanics in shared
  persistence utilities while feature/domain modules remain responsible for
  record semantics and validation.

## Development Tooling

- [ ] Create a production-gated `/dev/*` route namespace for reusable development
  and diagnostic pages.
- [ ] Add a small `/dev` tools index when multiple development utilities exist.
- [ ] Move `/settings/cloud-test` to `/dev/cloud-test`.
- [ ] Keep reusable diagnostics under `/dev`; delete truly one-time repair
  utilities after use.

## Code and UI Hygiene

- [ ] Audit for malformed Tailwind utility strings and accidental class
  concatenation.
- [ ] Audit remaining mojibake/encoding artifacts such as broken multiplication
  signs, arrows, bullets, and em dashes.
- [ ] Keep mobile form controls at iOS-safe font sizes.
- [ ] Continue validating fixed-navigation, modal, and safe-area behavior on
  physical mobile devices.

## Data Model Maintenance

- [ ] Preserve backward compatibility when extending historical persisted
  records.
- [ ] Add explicit migrations only when older persisted data cannot be safely
  interpreted by the current model.
- [ ] Preserve provenance/source metadata when multiple measurement sources
  represent equivalent metrics.

## Platform & Data Management

These items are important product/platform work but are not part of Phase 7
personalization.

- [ ] Clear sign-out/account switching UX.
- [ ] Review first-time-user behavior.
- [ ] Review empty-account onboarding.
- [ ] Add data export.
- [ ] Include body-composition measurements and goal history in data export.
- [ ] Include nutrition, activity, training, recovery, and relevant preference
  data in export where appropriate.
- [ ] Define export behavior for uploaded DEXA reports and progress photos.
- [ ] Add intentional account/data deletion flow.
- [ ] Ensure deletion covers uploaded DEXA reports and progress photos.
- [ ] Review cloud-sync status/error UX.
- [ ] Review storage/error UX for uploaded files.
- [ ] Ensure sensitive body-composition files and progress photos remain private
  by default.

---

# Near-Term Execution Order

Work should proceed in this order unless a bug, safety issue, data-loss risk, or
significant architectural problem interrupts it.

## Complete

1. Dynamic Today Mission.
2. Real Weekly Progress.
3. Reset Plan UX.
4. Strength workout completion validation.
5. Guide integration with live training/readiness.
6. Backup/home and shortened workout system.
7. In-workout exercise substitution.
8. Coach-recommended workout modification.
9. Strength progression improvements.
10. Phase 3.2 — Adaptive Weekly Programming.
11. Phase 3.3 — Steady-State Programming.
12. Phase 3.4 — Adaptive Scheduling.
13. Workout execution UX polish.
14. **Phase 4 — Body Composition and Goal Progress — COMPLETE.**
15. **Phase 5 — Nutrition and Daily Activity — COMPLETE.**
    - 5.1 Nutrition Targets — COMPLETE
    - 5.2 Steps / General Activity — COMPLETE
    - 5.3 Goal-Progress Evidence — COMPLETE

## Current

16. **Phase 6 — Reflect: Reviews and Better Progress Insights — CURRENT**

## Later

17. **Phase 7 — Personalization and Training Guidance**
18. **Phase 8 — Health Data Integrations**
19. **Phase 9 — Social & Challenges**
20. **Phase 10 — Advanced Platform & Coaching Capabilities**

Personalization, health integrations, social features, and advanced platform work
remain mapped for later and should not displace the core coaching loop.

---

# Definition of Core Fitness OS v1

Core v1 is reached when **Phases 1–6 are complete** and the user can open Fitness
OS and, without independently designing the day, understand:

1. **What should I do today?**
2. **Why is that the right choice today?**
3. **What should I do if the original plan is not practical?**
4. **How do I execute and record it?**
5. **Did I follow the plan this week?**
6. **Should the program progress, hold, or recover?**
7. **Are nutrition and daily activity supporting the goal consistently enough to
   evaluate progress?**
8. **Am I moving toward better body composition while maintaining/improving
   useful fitness?**

Phases 1–3 establish intelligent training and execution.

Phase 4 measures outcomes.

Phase 5 measures lightweight lifestyle adherence and produces supporting
multi-week evidence.

Phase 6 interprets the combined evidence and closes the core feedback loop.

**Core Fitness OS v1 ends at Phase 6.** Phase 7 and later phases expand
personalization, integrations, social capabilities, and platform maturity after
the core product can already answer its central coaching questions reliably.
