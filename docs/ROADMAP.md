# Fitness OS Roadmap

## North Star

Fitness OS exists to answer one question:

> ****What should I do next to make meaningful progress toward my
> fitness goals?****

The project began as a way to rebuild a sustainable training routine
after an extended period of travel and inconsistent gym attendance. The
product must remain anchored to that problem rather than becoming only a
workout logger.

### Primary outcome

Improve body composition through sustainable fat loss, with reducing
abdominal fat as the practical goal. Scale weight is a useful trend, not
the sole definition of success.

### Secondary outcomes

-   Retain and build useful muscle. - Maintain strength and capacity for
    aerials, snowboarding, hiking, and other active hobbies. - Improve
    cardiovascular fitness. - Build a training routine that survives
    travel, schedule disruption, and missed gym days. - Reduce the
    amount of day-to-day planning required from the user.

### Target routine

The long-term default rhythm is:

-   ****Monday:**** Gym - ****Tuesday:**** Optional aerial /
    recovery - ****Wednesday:**** Gym - ****Thursday:****
    Optional aerial / recovery - ****Friday:**** Gym -
    ****Weekend:**** Running, walking, hiking, recovery, or other
    appropriate conditioning

The system should build toward that rhythm gradually rather than
assuming full training volume immediately.

### Product requirement

Fitness OS should not merely record what happened. It should
increasingly use training history, adherence, recovery, and progress to
recommend the most appropriate action today.

**---**

# Development Principles

1.  ****Finish the core coaching loop before expanding scope.**** 2.
    ****Prefer adherence over theoretical perfection.**** A plan the
    user follows is better than a more aggressive plan they abandon. 3.
    ****Progress gradually.**** Strength, running, and overall
    weekly load should ramp safely. 4. ****Treat aerials and active
    hobbies as real training load.****
2.  ****A missed gym day should have a useful fallback, not become a
    failed day.**** 6. ****Persistent user data should remain
    authenticated, private, and cloud-backed.**** 7. ****Active
    workout/run sessions remain device-local until conflict handling is
    deliberately designed.**** 8. ****Social features must expose
    only intentionally shared data, never raw private Fitness OS
    storage.**** 9. Every major feature should pass the Vision test:
     > Does this help the user make a better decision today?

**---**

# Current State

## Completed Foundation

### Application platform
- [x] Next.js application structure
- [x] Responsive/mobile-first
    interface
- [x] Installable PWA
- [x] Offline application
    shell
- [x] Supabase authentication
- [x] Per-user cloud data
    isolation
- [x] Persistent-data cloud synchronization
- [x] Sync
    on persistent writes
- [x] Cloud hydration before page
    initialization
- [x] Cross-device PC -> cloud -> phone
    synchronization verified
- [x] Cross-device phone -> cloud -> PC
    synchronization verified
- [x] Active workout and active run
    intentionally remain device-local

### Strength training
- [x] Exercise library
- [x] Custom exercises
- [x] Editable
    workout templates
- [x] Gym A / Gym B / Gym C templates
- [x] Active workout sessions
- [x] Set, weight, rep, RPE, and notes
    logging
- [x] Rest timer
- [x] Exercise targets based on
    previous performance
- [x] Exercise-level increase / repeat /
    regression decisions
- [x] RPE-aware target decisions
- [x] Personal-record recognition using estimated 1RM
- [x] Workout
    history
- [x] Exercise progress views
- [x] Persistent workout
    history cloud sync
- [x] Exercise-type-aware workout inputs and history formatting
- [x] Per-side repetition labeling for unilateral exercises
- [x] Resistance-band load tracking with band-specific resistance selection
- [x] Mobile-friendly workout numeric inputs without unwanted input zoom
- [x] Empty numeric fields remain editable instead of forcing zero during entry

### Training plan
- [x] Structured return-to-training ramp
- [x] Week 0 Return phase
- [x] Progressive ramp weeks
- [x] Steady-state training phase
- [x] Deload support
- [x] Scheduled strength, running, walking,
    aerial, mobility, rest, and recovery activities
- [x] Training
    activity completion tracking
- [x] Weekly adherence evaluation
- [x] Automatic advance / advance-with-warning / hold decisions
- [x] Recovery-aware weekly progression decisions
- [x] Strength-quality-aware weekly progression decisions
- [x] Running-load-aware weekly progression decisions
- [x] Calendar-week rollover with fresh weekly completion counters
- [x] Training-plan state persistence and cloud sync

### Running
- [x] Scheduled and manually started runs
- [x] Duration, distance,
    RPE, and notes
- [x] Run/walk prescription support
- [x] Run
    history
- [x] Running progress views
- [x] Scheduled run
    completion integration
- [x] Persistent run history cloud sync

### Recovery and guidance
- [x] Morning check-in
- [x] Energy, sleep, mood, stress, and
    soreness inputs
- [x] Readiness calculation
- [x] Basic Coach
    recommendation engine
- [x] Recovery progress views
- [x] Morning check-in cloud sync

**---**

# Phase 1 --- Complete the Core Daily Coaching Loop

****Priority: NOW****

The current Today screen mixes live training data with
placeholder/static Mission and Weekly Progress data. The next milestone
is to make Today a trustworthy control center driven entirely by real
Fitness OS state.

## 1.1 Dynamic Today Mission --- COMPLETE
- [x] Remove dependency on static `today` fixture data for the live
    Today experience.
- [x] Derive today's mission from the active
    training plan and actual date.
- [x] Derive workout/activity
    status from real completion records.
- [x] Remove placeholder
    protein and step goals until real/configurable data sources exist.
- [x] Clearly distinguish required and optional activities.
- [x] Handle rest/recovery days intentionally.
- [x] Handle days with no
    active training plan.
- [x] Remove obsolete Today fixture
    data/types after live consumers are migrated.

****Completed outcome:**** every item shown under Today's Mission is
derived from real, current Fitness OS state. Protein and step goals
return in Phase 5 once their data sources are real.

## 1.2 Real Weekly Progress --- COMPLETE
- [x] Replace static weekly progress values.
- [x] Calculate
    required training activities scheduled this week.
- [x] Calculate
    completed required activities.
- [x] Show strength-session
    adherence.
- [x] Show overall plan adherence.
- [x] Surface
    current-week progression status using the same adherence/progression
    rules as automatic progression.
- [x] Show optional training
    separately without counting it against required adherence.
- [x] Respect substitution-group requirements.
- [x] Do not show
    protein/step streak data until those data sources are real.
- [x] Verify workout completion updates Mission and Weekly Progress
    immediately without a page reload.

****Completed outcome:**** the weekly card reflects the same real
completion records and adherence rules used by automatic progression.

**Manual verification completed (August 2026):**
- [x] 25% adherence with 1/2 strength sessions reports below
    progression target.
- [x] 50% adherence with 2/2 strength sessions
    remains below target because overall required adherence is
    insufficient.
- [x] 75% adherence with 2/2 strength sessions
    reports likely advancement with reduced adherence.
- [x] 100%
    adherence with 2/2 strength sessions reports on track to advance.
- [x] Optional training is tracked separately and does not reduce
    required adherence.
- [x] Week rollover advances Week 0 Return to
    Week 1 Restart, resets current-week counters, preserves history, and
    carries forward exercise targets.

## 1.3 Reset Plan UX --- COMPLETE
- [x] Rename `Reset` to `Reset Plan`.
- [x] Add confirmation before clearing plan state.
- [x] Explicitly state that workout history, run history, check-ins,
    and completed historical data are preserved.
- [x] Verify reset clears the active training-plan
    schedule/progression while preserving historical data.
- [x] Verify the user can start Week 0 again after resetting.

**Completed outcome:** resetting the plan is now a deliberate, confirmed
action that resets active plan state without deleting historical Fitness
OS data.

## 1.4 Strength Workout Completion Validation --- COMPLETE
- [x] Prevent an empty strength session from satisfying a scheduled
    strength activity.
- [x] Require meaningful workout input before recording scheduled
    strength completion (initial rule: at least one completed working
    set).
- [x] Keep cancel/discard behavior separate from completion.
- [x] Support intentionally shortened or recovery-modified strength
    sessions under the current minimum-valid-session rule.
- [x] Ensure invalid/empty sessions do not increase weekly
    required-training, strength-session, or adherence counts.
- [x] Show a clear validation message when a user attempts to finish
    with zero completed working sets.
- [x] Verify an invalid zero-set session is not written to workout
    history.

**Completed outcome:** a strength workout now requires at least one
completed working set before it can be finished. Empty sessions remain
active, are not written to history, and cannot record scheduled strength
completion. Legitimate shortened sessions remain possible.

## 1.5 Guide Integration --- COMPLETE
- [x] Make Coach/Guide aware of today's actual scheduled activity.
- [x] Combine readiness with training type when giving advice.
- [x] Distinguish normal training, reduced-effort training,
    recovery, and substitution recommendations.
- [x] Explain
    recommendations briefly and calmly.
- [x] Avoid recommendations
    that silently alter the long-term program.

****Milestone:**** Opening Today reliably answers ****"What should
I do today?"****

**---**

# Phase 2 --- Flexible Execution and Backup Workouts

****Priority: CORE****

This phase directly addresses the original requirement that missing the
gym should not automatically mean missing training.

## 2.1 Backup Workout Model --- COMPLETE
- [x] Define a substitute-workout data model.
- [x] Create home
    equivalents for Gym A, Gym B, and Gym C.
- [x] Support
    equipment-aware substitutions where useful.
- [x] Create
    abbreviated gym sessions for time-constrained days.
- [x] Preserve
    the training intent of the scheduled workout rather than copying
    exercises mechanically.
- [x] Represent movement roles explicitly
    so substitute sessions preserve training purpose rather than relying
    on one-for-one exercise replacement.
- [x] Separate available
    equipment from setup capabilities so owning equipment does not imply
    every exercise using it is executable.
- [x] Model the current
    home environment as bodyweight, yoga mat, resistance bands, floor
    space, and a high anchor.
- [x] Add availability logic that
    validates both required equipment and required setup capabilities.

**Completed outcome:** Gym A, Gym B, and Gym C now each have structured
Full Gym, Short Gym, and Home pathways. Short Gym variants preserve
required movement roles with reduced volume, while Home variants use
bands/bodyweight/mat work and explicitly account for setup requirements
such as a high anchor. The model is ready for the Today substitution
flow to expose only appropriate executable alternatives.

## 2.2 Today Substitution Flow --- COMPLETE
- [x] Add a `Need another option?` action for scheduled strength
    workouts.
- [x] Offer Full Gym, Short Gym, and Home pathways while
    preserving the scheduled Gym A / Gym B / Gym C identity.
- [x] Let
    the user explicitly choose the workout variant before starting.
- [x] Expose the same Full Gym / Short Gym / Home choice when
    manually starting Gym A / Gym B / Gym C from the Workout tab.
- [x] Filter backup options using current equipment and
    setup-capability availability.
- [x] Record the performed variant
    separately from the underlying scheduled workout identity.
- [x] Credit an appropriate Short Gym or Home substitute against the
    original scheduled strength activity.
- [x] Count valid
    substitutes toward weekly adherence and strength-session progression
    requirements.
- [x] Treat a strength substitution group as one
    strength requirement and only award strength credit when a Strength
    alternative is completed.
- [x] Preserve the actual performed
    variant in workout history while maintaining backwards compatibility
    with older history entries.

**Completed outcome:** a scheduled Gym A / Gym B / Gym C session can now
be executed as Full Gym, Short Gym, or an available Home variant without
breaking the training-plan identity. The performed variant is retained
in workout history, the original scheduled activity receives completion
credit, and valid substitutions count correctly toward adherence and
weekly strength-session progression. Manual workouts expose the same
variant choices from the Workout tab.

## 2.2A In-Workout Exercise Substitution --- COMPLETE
- [x] Add a per-exercise `Need another option?` action during an
    active strength workout.
- [x] Recommend ranked alternatives that
    preserve the exercise's movement role/training intent.
- [x] Prefer alternatives executable with the equipment and setup
    currently available.
- [x] Support common gym constraints such as
    a machine or station being occupied or unavailable.
- [x] Let the
    user explicitly choose the replacement rather than silently changing
    the workout.
- [x] Replace only the affected exercise while
    preserving the rest of the active workout and prescribed set
    count.
- [x] Use the replacement exercise's own target and
    performance history.
- [x] Support repeated substitutions during
    the same active workout.
- [x] Record the exercise actually
    performed in workout history.
- [x] Preserve the underlying Gym A
    / Gym B / Gym C and workout-variant identity.
- [x] Preserve
    useful progression continuity when exercises are substituted.

**Completed outcome:** active strength workouts now support explicit,
ranked per-exercise substitutions without changing the rest of the
programmed session. Alternatives preserve movement intent and respect
equipment/setup availability. Replacements retain the programmed slot
and set count while using their own exercise target/history, can be
substituted again if needed, and workout history records what was
actually performed without losing the underlying workout identity.

## 2.3 Coach-Recommended Modification --- COMPLETE
- [x] Allow low readiness to recommend reduced volume/intensity.
- [x] Allow high soreness to influence exercise/session
    recommendations.
- [x] Avoid turning every imperfect check-in into
    a skipped workout.
- [x] Keep user override available.

**Completed outcome:** the coach now turns readiness and soreness
check-ins into proportional training guidance, including normal
training, modified exercise selection, shortened sessions, and
recovery-first recommendations. Imperfect check-ins do not automatically
cancel training, and users can still view workout options and override
the recommendation.

****Milestone:**** Schedule disruption produces a useful alternative
instead of a failed training day.

**---**

# Phase 3 --- Mature the Adaptive Training Plan

****Priority: CORE****

The existing plan can advance or hold based on adherence. This phase
makes adaptation reflect performance and recovery as well.

## 3.1 Strength Progression — COMPLETE
- [x] Formalize exercise-level progression rules.
- [x] Use
    completed sets/reps/RPE to recommend next-session loads.
- [x] Distinguish successful progression, repeat, and regression.
- [x] Handle incomplete prescribed set counts without granting
    progression.
- [x] Handle exercise substitutions without losing
    progression history.
- [x] Surface estimated-strength PRs without
    encouraging unnecessary max-effort testing.
- [x] Persist
    next-session targets across workouts and calendar-week rollover.

**Completed outcome:** completed working sets now produce an explained
next-workout target. Full top-of-range performance can increase load,
high RPE can hold the target, below-range performance can reduce load,
and incomplete exercises retain the current target. Estimated 1RM
records appear in the completion summary and exercise progress views.

## 3.2 Weekly Training Decisions — COMPLETE

- [x] Use required adherence and minimum strength-session counts to
  advance, advance with reduced adherence, or hold.
- [x] Explain the current weekly decision on the Today screen.
- [x] Apply the decision during calendar-week rollover while
  preserving history.
- [x] Incorporate recent recovery alongside adherence.
- [x] Incorporate strength-session quality where appropriate.
- [x] Incorporate running completion/load.
- [x] Treat aerial participation as meaningful training load.
- [x] Complete unified advance / hold / deload explanations, including
  all contributing load and recovery factors.
- [x] Allow manual override with a clear record of the decision.

**Completed outcome:** weekly progression now combines required adherence
and minimum strength-session completion with recovery, strength-session
quality, scheduled running load, and scheduled aerial participation.
Recovery and training-quality inputs can make an otherwise valid advance
more conservative or hold the week. Scheduled running evaluates actual
duration against the prescription and uses RPE as load context, while
manual runs remain history without altering plan progression. Scheduled
aerial participation is recognized as meaningful weekly training load
without being treated mechanically as another required strength session.

Advance, advance-with-warning, hold, and deload behavior now use a unified
decision model with persisted reasons and contributing factors. Applied
weekly decisions are recorded in training-plan state so the automatic
recommendation remains auditable. The most recent eligible decision can
be manually overridden in either direction, with the original automatic
decision preserved alongside the final decision, optional override reason,
and override timestamp. Overrides also correctly reverse or apply the
associated repeated-week, steady-state success-count, and deload scheduling
effects.

## 3.3 Steady-State Programming

Establish the long-term training structure used after the return-to-training
ramp. Steady state should provide a sustainable default while leaving room for
recovery, aerial participation, running progression, and real-life schedule
changes.

### 3.3.1 Steady-State Strength Programming — COMPLETE

- [x] Validate Monday / Wednesday / Friday as the long-term strength structure.
- [x] Validate Gym A / Gym B / Gym C as full-body sessions distributed across
  the week.
- [x] Review weekly movement-pattern balance and strength volume.
- [x] Add a true hip-hinge pattern to Gym C using Dumbbell Romanian Deadlift.
- [x] Preserve editable workout templates and existing exercise progression.
- [x] Keep gym-day conditioning separate from the strength exercise templates.

**Completed outcome:** steady-state strength uses three nonconsecutive full-body
sessions on Monday, Wednesday, and Friday. Gym C now includes a true hip-hinge
movement so the weekly program is not dependent entirely on squat/leg-press and
leg-curl patterns for lower-body development.

### 3.3.2 Weekly Conditioning Structure — COMPLETE

- [x] Validate running/cardio placement around strength and aerial training.
- [x] Treat Monday and Wednesday post-strength cardio as incline treadmill
  walking at Zone 2 rather than scheduled running.
- [x] Preserve Tuesday as Aerial OR a programmed run.
- [x] Preserve Thursday as Aerial OR recovery-oriented activity.
- [x] Remove fixed Friday adaptive intervals so Gym C is not immediately
  followed by a hard running session before Saturday endurance work.
- [x] Preserve Saturday as the primary long-endurance day.
- [x] Preserve Sunday as recovery.
- [x] Keep supplemental gym-day aerobic work distinct from the running program.

**Completed outcome:** the default steady-state week now separates supplemental
Zone 2 conditioning from actual running. Monday and Wednesday pair strength with
short incline-treadmill Zone 2 work, Tuesday provides an aerial/running slot,
Thursday provides an aerial/recovery slot, Friday is strength only, Saturday is
the primary endurance day, and Sunday is recovery.

### 3.3.3 Adaptive Running Progression — COMPLETE

- [x] Define the steady-state running progression model after the initial ramp.
- [x] Generate an appropriate Tuesday run prescription when running is selected
  instead of aerial.
- [x] Progress Tuesday running between easy and interval development work based
  on current running capacity and completed performance.
- [x] Define a progressive Saturday endurance-duration prescription rather than
  leaving long endurance completely open-ended.
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

**Completed outcome:** steady-state running now uses two independently adaptive
progression tracks. The optional Tuesday Development run begins with controlled
easy running, progresses duration to a 35-minute easy-run ceiling, and can then
advance through conservative interval prescriptions (2:2, 3:2, 4:2, 5:2, and
5:1 run/recovery ratios) when completed performance supports progression.
Acceptable or limited sessions repeat the current prescription, while poor
performance regresses the prescription and can return introductory intervals
to easy running.

Saturday Endurance remains an easy aerobic session and progresses duration
independently in five-minute increments based on completed duration and RPE.
Scheduled runs snapshot their prescriptions for historical evaluation, while
manual runs remain useful history without automatically advancing the program.
Choosing aerial instead of the optional Tuesday run does not count as failed
running progression. Updated prescriptions persist in training-plan state,
survive calendar-week rollover and repeated weeks, and are consumed by future
scheduled runs.

### 3.3.4 Deload and Return-to-Training Validation — COMPLETE

- [x] Revalidate the deload template against the finalized steady-state strength
  and conditioning structure.
- [x] Update deload incline-treadmill/cardio activity types and labels where
  necessary.
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

**Completed outcome:** deload weeks now use the finalized steady-state movement
structure while reducing fatigue intentionally. Monday and Wednesday use short
incline-treadmill Zone 2 walks, Friday contains strength only, aerobic work stays
easy, and scheduled Gym A / B / C deload sessions reduce normal working-set
volume to approximately 60% while preserving the normal exercise selection and
movement patterns.

Training interruptions now use a structured return-to-training model rather than
automatically resuming full steady-state load. Short interruptions can resume
steady state directly, while longer interruptions select an appropriate existing
ramp re-entry point based on time away. Travel, illness, and prolonged breaks
therefore reuse the established Week 0–6 ramp instead of creating a separate
program.

Return ramps act as a temporary schedule overlay rather than resetting the
training plan. The original plan start date, workout history, weekly progression
history, deload history, and adaptive running prescriptions remain preserved.
Held weeks can pause a return ramp, and once steady state is reached again the
stored Development and Endurance running prescriptions resume normally.

## 3.4 Adaptive Scheduling

Allow the prescribed week to respond to real-life availability without changing
the underlying training goals.

### 3.4.1 Activity Rescheduling

- [x] Allow a scheduled activity to be moved to another day.
- [x] Preserve the original training activity identity when rescheduled.
- [x] Record the original date and rescheduled date.
- [x] Ensure a legitimately rescheduled activity is not counted as a missed
  adherence requirement on its original day.
- [x] Update Today's Mission and the remaining weekly schedule after an accepted
  move.

**Completed:** Activity rescheduling is implemented as a persisted schedule
overlay rather than a mutation of the underlying training-plan templates.
Individual occurrences retain their original activity identity and original
calendar-week ownership while adopting a new scheduled date. Rescheduled
activities are reflected in Today, the training-week schedule, weekly adherence,
and automatic progression evaluation, including cross-week moves.

### 3.4.2 Schedule Conflict Evaluation

- [x] Detect conflicts created by moving strength, running, aerial, or recovery
  activities.
- [x] Preserve appropriate spacing between strength sessions where practical.
- [x] Account for aerial load when moving adjacent upper-body/strength work.
- [x] Account for running load when rearranging strength and endurance days.
- [x] Avoid unnecessarily stacking hard sessions on consecutive days.
- [x] Distinguish situations where moving, substituting, shortening, or skipping
  an activity is the better option.

**Completed:** Schedule conflict evaluation now classifies training load across
strength, running, aerial, walking, mobility, recovery, and rest activities;
detects same-day and adjacent-day conflicts; evaluates proposed same-week and
cross-week moves against the resolved training schedule; and warns only about
conflicts introduced by the proposed change rather than conflicts already present
in the current or prescribed schedule. Conflict types are also mapped to
appropriate resolution categories such as move, shorten, substitute, or skip,
without yet choosing a specific revised schedule.

### 3.4.3 Adaptive Schedule Recommendations — COMPLETE

- [x] Recommend an appropriate revised week when the planned day is unavailable.
- [x] Explain why the proposed rearrangement is appropriate.
- [x] Let the user accept or reject the proposed schedule change.
- [x] Preserve user control rather than silently rearranging the program.
- [x] Integrate backup/home/shortened workouts when substitution is preferable
  to rescheduling.
- [x] Recalculate downstream weekly recommendations after an accepted schedule
  change.

**Completed outcome:** adaptive scheduling now turns real-life availability
constraints into an explicit proposed schedule rather than silently changing the
training plan. Whole-day unavailability can trigger a bounded search for a
lower-conflict rearrangement of required activities, with optional
substitution-group conflicts resolved through explicit skip/substitute
recommendations where appropriate.

Strength-specific constraints can preserve the planned training day instead of
unnecessarily rearranging the week. Gym unavailability can recommend an
executable Home variant, while a time constraint can recommend the Short Gym
variant. Accepted occurrence-specific variant choices are persisted separately
from the underlying Gym A / Gym B / Gym C identity and remain attached to the
occurrence through schedule resolution and rescheduling.

The user reviews the recommendation and explanation before applying it. Accepted
moves, optional occurrence adjustments, and strength-variant overrides are
persisted as schedule overlays, after which Today, the weekly schedule,
adherence/progression evaluation, and scheduled workout launch consume the
updated resolved state. Rejected recommendations leave the plan unchanged.

**Milestone:** Fitness OS adapts training load, running progression, recovery,
and weekly scheduling rather than merely moving through a fixed calendar.

**---**

# Phase 4 — Body Composition and Goal Progress

****Priority: CORE****

Fat loss is the primary outcome, so Fitness OS needs to measure whether
training and lifestyle are actually moving body composition in the
desired direction.

Phase 4 establishes longitudinal body-composition tracking, goal
projection, and progress review while preserving the distinction between
raw measurements, higher-quality assessments such as DEXA, and
long-term trends.

## 4.0 Body-Composition Storage Foundation — IN PROGRESS

- [x] Define persistent data models for goals, measurements, DEXA records,
      weekly check-ins, and progress-photo metadata.
- [x] Add authenticated cloud-backed storage for DEXA report files and
      progress photos.
- [x] Keep uploaded files separate from structured Fitness OS record data.
- [x] Associate uploaded-file metadata with user-owned structured records.
- [x] Enforce per-user access controls for uploaded files.
- [x] Define basic file replacement and deletion behavior.
- [ ] Ensure deleting a DEXA record/check-in intentionally removes its
      associated uploaded files.
- [ ] Define and implement recovery behavior when metadata sync succeeds but
      file upload fails, or vice versa.
- [ ] Verify user-facing records remain usable when optional files are
      unavailable.
- [ ] Verify uploaded-file isolation using separate authenticated accounts.

**Current state:** Phase 4 has a persistent body-composition data foundation
for goals, measurements, DEXA records, weekly check-ins, and progress-photo
metadata. Structured records use the existing authenticated Fitness OS
synchronization model, while DEXA reports and progress photos use private
authenticated file storage with user-scoped paths and access policies.

The private-file upload/download/delete path has been verified for an
authenticated user. Record-level file cleanup, partial-failure recovery,
offline/missing-file behavior, and cross-account verification remain to be
completed as the DEXA and progress-photo workflows are implemented.

## 4.1 Goal Profile — IN PROGRESS

- [x] Add user goal configuration.
- [x] Support fat-loss/body-composition goal as the primary goal.
- [x] Store target/goal context without overemphasizing a single scale number.
- [x] Support optional goal weight.
- [x] Support optional goal body-fat percentage.
- [ ] Support relevant performance/hobby goals.
- [x] Store goal effective/start date.
- [x] Preserve historical goals when goals change.
- [x] Support expected rate of change.
- [ ] Calculate projected goal completion date.
- [ ] Recalculate projection from observed progress trends.
- [ ] Compare actual rate of progress with expected rate.
- [ ] Identify plateaus or unusually rapid changes without automatically
      changing training or nutrition targets.

**Current state:** goal profiles can be created and changed while retaining
historical goal records and effective dates. Goals can describe fat loss, body composition, maintenance, or performance
and can include optional weight, body-fat, expected-rate, and notes context.
Specific performance/hobby goal entry remains to be added.
Projection and observed-progress analysis remain to be implemented after
sufficient measurement trend support exists.

## 4.2 Measurements and Body Composition — IN PROGRESS

- [x] Add body-weight logging.
- [x] Add waist measurement logging.
- [x] Add optional body-fat percentage logging.
- [x] Add optional lean-mass logging.
- [x] Support additional useful body-composition measurements.
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
- [x] Track measurement source/provenance.
      - Manual measurement.
      - Home scale/device.
      - DEXA.
- [x] Preserve historical measurements rather than overwriting prior entries.
- [ ] Distinguish raw measurements from calculated trend values.
- [ ] Use rolling trends rather than reacting to daily weight noise.
- [ ] Support comparison between measurements from selected dates.

**Current state:** manual body-composition records can be created, edited,
deleted, and reviewed historically. Core weight, waist, and body-fat fields
are supplemented by detailed circumference measurements and optional
lean/fat-mass values. Measurement provenance is preserved so future manual, device-derived, and
DEXA-derived records can coexist. Trend calculations and date comparison
remain to be implemented.

## 4.3 DEXA Records

- [ ] Support optional DEXA scan records.
- [ ] Store scan date.
- [ ] Support upload and storage of the original DEXA report.
- [ ] Store relevant DEXA-derived metrics when available.
      - Body weight.
      - Body-fat percentage.
      - Fat mass.
      - Lean mass.
      - Other useful metrics supported by the report.
- [ ] Preserve DEXA as a distinct measurement source rather than treating
      it as interchangeable with home-scale estimates.
- [ ] Support manual entry of DEXA values.
- [ ] Treat automatic DEXA report extraction as an optional later enhancement.
- [ ] Support comparison between DEXA scans.

## 4.4 Weekly Progress Check-In

- [ ] Add an optional weekly progress check-in.
- [ ] Record current body weight.
- [ ] Record waist measurement when available.
- [ ] Record optional body-fat measurement.
- [ ] Record optional notes.
- [ ] Support optional weekly progress photos.
      - Front.
      - Side.
      - Back.
- [ ] Associate progress photos with the check-in/measurement date.
- [ ] Allow measurements or photos to be skipped without preventing
      check-in completion.
- [ ] Show change since the previous check-in.
- [ ] Show rolling weight trend rather than relying on a single measurement.
- [ ] Show progress toward the current goal.

## 4.5 Progress Summary and Dashboard

- [ ] Add body-weight trend visualization.
- [ ] Add waist trend visualization.
- [ ] Add body-fat trend visualization when sufficient data is available.
- [ ] Add lean-mass trend visualization when sufficient data is available.
- [ ] Clearly distinguish raw measurements from trend values.
- [ ] Show progress toward the current goal.
- [ ] Show expected versus actual rate of progress.
- [ ] Show projected goal completion date.
- [ ] Track meaningful progress milestones.
- [ ] Add DEXA comparison view.
- [ ] Add progress-photo timeline.
- [ ] Add side-by-side progress-photo comparison.
- [ ] Combine body-composition trend with strength retention/progression.
- [ ] Combine running/cardio trend.
- [ ] Combine training adherence.
- [ ] Highlight whether the current approach appears to be working.
- [ ] Avoid automatic training changes from a single measurement or
      short-term fluctuation.

****Milestone:**** Fitness OS can answer ****"Is this program actually
getting me toward the outcome I want?"**** using body-composition trends,
goal progress, training performance, cardio progress, and adherence.

**---**

# Phase 5 --- Nutrition and Daily Activity

****Priority: HIGH, after core training loop****

Nutrition and daily movement materially affect the primary fat-loss
goal, but Fitness OS should avoid becoming a cumbersome food diary.

Phase 5 adds enough nutrition and general-activity context to explain
body-composition progress without turning Fitness OS into a full
calorie-tracking application.

## 5.1 Nutrition Targets

- [ ] Add configurable calorie target.
- [ ] Add configurable protein target.
- [ ] Preserve historical targets when targets change.
- [ ] Record target effective dates.
- [ ] Add simple daily nutrition adherence input.
- [ ] Track weekly protein adherence.
- [ ] Track weekly calorie adherence where data is available.
- [ ] Distinguish target values from actual/adherence data.

## 5.2 Steps / General Activity

- [ ] Add configurable daily step target.
- [ ] Preserve historical step targets when targets change.
- [ ] Add daily step logging/completion.
- [ ] Track weekly step adherence.
- [ ] Track general-activity trends where useful.
- [ ] Consider automatic health-platform import later.

## 5.3 Goal-Progress Integration

- [ ] Combine nutrition adherence with Phase 4 body-composition trends.
- [ ] Combine general-activity adherence with Phase 4 body-composition trends.
- [ ] Use multiple weeks of evidence before identifying nutrition/activity
      as a likely contributor to slower or faster progress.
- [ ] Compare observed body-composition progress with the expected rate
      established by the active goal.
- [ ] Surface persistent patterns that may explain goal-progress trends.
- [ ] Avoid drawing conclusions from individual high-calorie days,
      low-step days, or isolated scale measurements.

## 5.4 Guide Integration

- [ ] Use nutrition/activity adherence as coaching context, not punishment.
- [ ] Avoid compensatory exercise recommendations for individual
      high-calorie days.
- [ ] Avoid automatically increasing training load to compensate for
      nutrition adherence.
- [ ] Surface persistent trends that materially affect the goal.
- [ ] Explain when available evidence is insufficient to determine why
      progress is faster or slower than expected.
- [ ] Keep explicit user control over calorie, protein, and activity targets.

****Milestone:**** Today's Mission and Weekly Progress can include real
protein and step data, and Fitness OS can use nutrition and daily-activity
context to better explain body-composition progress without becoming a
full food diary.

**---**

# Phase 6 --- Reflect: Reviews and Better Progress Insights

****Priority: HIGH****

Phase 6 turns the data established by the training system, Phase 4
body-composition tracking, and Phase 5 nutrition/activity tracking into
concise periodic reflection.

Reflect should interpret existing data rather than duplicate the
underlying tracking dashboards.

## 6.1 Weekly Review

- [ ] Add a structured weekly review.
- [ ] Summarize scheduled vs completed training.
- [ ] Summarize strength progress.
- [ ] Summarize running/cardio progress.
- [ ] Summarize recovery trend.
- [ ] Summarize body-composition trend when sufficient data is available.
- [ ] Summarize nutrition and daily-activity adherence when available.
- [ ] Compare current progress with the active goal and expected rate.
- [ ] Explain the next week's training decision.
- [ ] Highlight one or two useful observations rather than dumping metrics.
- [ ] Distinguish meaningful trends from normal short-term noise.
- [ ] Explicitly acknowledge when insufficient data exists to draw a useful
      conclusion.

## 6.2 Longer-Term Progress Review

- [ ] Support useful longer-term review periods.
- [ ] Compare current body-composition progress with earlier periods.
- [ ] Summarize strength retention/progression during fat loss.
- [ ] Summarize cardiovascular progress.
- [ ] Summarize adherence over the review period.
- [ ] Surface meaningful milestones and PR/history highlights.
- [ ] Incorporate DEXA comparisons when available.
- [ ] Incorporate progress-photo comparisons when useful.
- [ ] Evaluate whether the current approach appears to be moving toward
      the active goal.
- [ ] Avoid treating any single metric as the definition of success.

## 6.3 Progress UX

- [ ] Improve strength trend visualization.
- [ ] Improve running trend visualization.
- [ ] Improve recovery trend visualization.
- [ ] Improve adherence trend visualization.
- [ ] Integrate Phase 4 body-composition views without duplicating them.
- [ ] Integrate Phase 5 nutrition/activity context where useful.
- [ ] Add meaningful PR/history highlights.
- [ ] Make related progress signals easy to compare over the same time period.

## 6.4 Guide Feedback Loop

- [ ] Make Guide aware of the latest completed review.
- [ ] Use persistent multi-week patterns as context for future recommendations.
- [ ] Distinguish observations from actionable recommendations.
- [ ] Avoid changing training from body-composition data alone.
- [ ] Require training/recovery evidence before body-composition trends
      influence training-load decisions.
- [ ] Preserve user control over meaningful goal or target changes.

****Milestone:**** Reflect explains what changed, why it may have changed,
and what matters next, and those insights improve future Guide decisions.

**---**

# Phase 7 --- Personalization and Exercise Guidance

## 7.1 Training Preferences
- [ ] Preferred gym days.
- [ ] Preferred aerial days.
- [ ] Running availability/preferences.
- [ ] Available home
    equipment.
- [ ] Typical session-duration constraints.

## 7.2 Coaching Preferences

- [ ] Add training emphasis/preferences.
- [ ] Add preferred balance between strength, running/cardio, and active hobbies.
- [ ] Add coaching aggressiveness/conservatism preferences where appropriate.
- [ ] Add preferred reminder/check-in behavior where appropriate.
- [ ] Keep goal configuration owned by Phase 4.
- [ ] Keep nutrition and activity targets owned by Phase 5.

## 7.3 Account, Privacy, and Data

- [ ] Clear sign-out/account switching UX.
- [ ] Review first-time-user behavior.
- [ ] Review empty-account onboarding.
- [ ] Add data export.
- [ ] Include body-composition measurements and goal history in data export.
- [ ] Define export behavior for uploaded DEXA reports and progress photos.
- [ ] Add intentional account/data deletion flow.
- [ ] Ensure deletion covers uploaded DEXA reports and progress photos.
- [ ] Review cloud-sync status/error UX.
- [ ] Review storage/error UX for uploaded files.
- [ ] Ensure sensitive body-composition files and progress photos remain
      private by default.

## 7.4 Exercise Guidance

- [ ] Add an optional exercise demo/details view.
- [ ] Show concise setup and execution instructions.
- [ ] Add visual demonstrations where they materially improve exercise understanding.
- [ ] Surface exercise-specific guidance such as unilateral/per-side execution.
- [ ] Keep guidance unobtrusive during normal workout logging.

## 7.5 Body Measurement UX

- [ ] Add an optional interactive body-map measurement interface.
- [ ] Show measurement locations on a front/back body silhouette.
- [ ] Allow a measurement location to be selected directly from the body map.
- [ ] Show current and previous values/change for the selected measurement.
- [ ] Preserve the conventional measurement form as an efficient alternative
      for complete measurement entry.
- [ ] Support historical-date entry.
- [ ] Support date-to-date body-map comparison.

**---**

# Phase 8 --- Health Data Integrations

****Future****
- [ ] Evaluate Apple Health / Health Connect integration.
- [ ] Steps import.
- [ ] Weight import where available.
- [ ] Sleep/recovery inputs where useful.
- [ ] Running/activity import
    where it improves rather than duplicates Fitness OS.
- [ ] Define
    source-of-truth/conflict rules before enabling bidirectional writes.
- [ ] Preserve imported measurement source/provenance.
- [ ] Prevent duplicate measurements when the same record is imported repeatedly.
- [ ] Define conflict/deduplication behavior between manually entered weight,
      device-imported weight, and DEXA-derived measurements.
- [ ] Preserve Phase 4 measurement history rather than silently overwriting
      manually entered records.

Integrations should reduce manual entry. They should not create a
second, conflicting training history.

**---**

# Phase 9 --- Social & Challenges

****Future major feature****

Fitness OS remains private by default. Social features operate through
purpose-built shared data rather than exposing raw `fitness_os_data`.

## 9.1 Social Foundation
- [ ] Public/shareable profile fields.
- [ ] Friend relationships
    and/or private groups.
- [ ] Privacy controls.
- [ ] Dedicated
    social database tables and RLS policies.
- [ ] Treat body-composition measurements, DEXA reports, progress photos,
      nutrition data, recovery data, and other sensitive health-related data
      as private unless explicitly selected for sharing.

## 9.2 Challenges

Flagship mode:
- [ ] ****Plan Consistency**** --- compete on percentage of each
    person's own planned training completed.

Additional challenge modes:
- [ ] Total workouts
- [ ] Running distance
- [ ] Steps
- [ ] Strength volume
- [ ] Streaks
- [ ] Balanced Fitness OS score

## 9.3 Competition UX
- [ ] Challenge creation/joining.
- [ ] Defined challenge periods.
- [ ] Leaderboards.
- [ ] Weekly bonuses/group milestones where
    appropriate.
- [ ] Optional activity feed with intentionally
    shared events.
- [ ] Achievements/badges only if they support
    motivation without making the core product feel like social media.

****Milestone:**** Friends can compete fairly despite having
different programs and fitness levels.

**---**

# Phase 10 --- Advanced Platform Work

****Later / as justified****
- [ ] Active-workout cross-device conflict handling.
- [ ] Active-run cross-device conflict handling.
- [ ] Near-live
    synchronization only if actual usage demonstrates a need.
- [ ] Notifications/reminders.
- [ ] Calendar/travel awareness.
- [ ] More sophisticated coaching models.
- [ ] Additional training
    modalities.
- [ ] Broader multi-user onboarding/product polish.

**---**

# Cross-Cutting Technical Debt and Maintenance

These items should be addressed opportunistically when related code is already
being modified. They should not displace core roadmap work unless they create
correctness, privacy, data-loss, security, or significant maintainability risk.

## Storage and Persistence

- [ ] Consolidate `lib/storage/keys.ts` and
      `lib/storage/fitnessOsStorageKeys.ts` into one canonical storage-key
      registry.
- [ ] Replace remaining duplicated/local string storage keys with references
      to the canonical registry.
- [x] Establish a project-owned Supabase migration/policy structure for
      DEXA report and progress-photo file storage.
- [x] Document the boundary between structured synchronized data and uploaded
      binary files.
- [ ] Review startup cloud hydration/conflict behavior as additional
      cross-device editable datasets are introduced.
- [ ] Add explicit recovery/error handling for partial cloud/file operations.

## Shared Utilities

- [ ] Consolidate duplicated `createId()` helpers into a shared utility.
- [ ] Consolidate duplicated local-date formatting/parsing helpers where
      practical.
- [ ] Prefer shared typed persistence helpers over feature-specific
      `localStorage` parsing for new persistent data.

## Development Tooling

- [ ] Create a production-gated `/dev/*` route namespace for reusable
      development and diagnostic pages.
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

# Near-Term Execution Order

Work should proceed in this order unless a bug or safety issue
interrupts it.

### Complete

1. Dynamic Today Mission
2. Real Weekly Progress
3. Reset Plan UX
4. Strength workout completion validation
5. Guide integration with live training/readiness
6. Backup/home and shortened workout system
7. In-workout exercise substitution
8. Coach-recommended workout modification
9. Strength progression improvements
10. Phase 3.2 — Adaptive Weekly Programming
    - Adherence and week rollover
    - Recovery input
    - Strength-session quality input
    - Running completion/load input
    - Aerial participation/load input
    - Unified advance / hold / deload decisions and explanations
    - Persisted weekly decision records
    - Reversible manual progression override

11. Phase 3.3 — Steady-State Programming
    - 3.3.1 Steady-State Strength Programming — COMPLETE
    - 3.3.2 Weekly Conditioning Structure — COMPLETE
    - 3.3.3 Adaptive Running Progression — COMPLETE
    - 3.3.4 Deload and Return-to-Training Validation — COMPLETE
12. Phase 3.4 — Adaptive Scheduling
    - 3.4.1 Activity Rescheduling — COMPLETE
    - 3.4.2 Schedule Conflict Evaluation — COMPLETE
    - 3.4.3 Adaptive Schedule Recommendations — COMPLETE
13. Workout execution UX polish — COMPLETE
    - Exercise-type-aware input and history formatting
    - Per-side repetition guidance
    - Resistance-band load tracking
    - Mobile numeric-input improvements

### Current

14. **Phase 4 — Body Composition and Goal Progress — IN PROGRESS**

### After Phase 4

15. Phase 5 — Nutrition and Daily Activity
16. Phase 6 — Weekly Review and Progress Improvements

Personalization, health integrations, social features, and advanced platform
work remain mapped for later and should not displace the core coaching loop.

------------------------------------------------------------------------

# Definition of Core Fitness OS v1

Core v1 is reached when the user can open Fitness OS and, without
independently designing the day, understand:

1.  ****What should I do today?**** 2. ****Why is that the right
    choice today?**** 3. ****What should I do if the original plan
    is not practical?**** 4. ****How do I execute and record
    it?**** 5. ****Did I follow the plan this week?**** 6.
    ****Should the program progress, hold, or recover?**** 7.
    ****Am I moving toward better body composition while
    maintaining/improving useful fitness?****

Until Fitness OS can answer those questions reliably, new feature areas
should generally remain secondary.
