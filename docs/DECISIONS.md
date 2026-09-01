# Fitness OS Decisions

This file records durable product and architecture decisions that future
work should not casually reverse. Add a new entry when a decision
affects multiple features, establishes a constraint, or would otherwise
be easy to rediscover incorrectly.

------------------------------------------------------------------------

## D-001 --- Fitness OS is a decision system, not only a tracker

**Status:** Accepted

Fitness OS exists to help answer:

> **What should I do next?**

Logging, charts, and data collection are valuable only when they support
better training and health decisions.

**Consequence:** Core coaching/adaptation work takes priority over
unrelated feature expansion.

------------------------------------------------------------------------

## D-002 --- The core training objective is sustainable body-composition improvement with useful fitness

**Status:** Accepted

The training system should prioritize sustainable fat
loss/body-composition improvement while retaining or building useful
muscle and supporting activities such as aerials, snowboarding, hiking,
and running.

**Consequence:** Programming should not optimize for bodybuilding
volume, running performance, or scale weight in isolation.

------------------------------------------------------------------------

## D-003 --- Build gradually toward a Monday/Wednesday/Friday strength rhythm

**Status:** Accepted

The long-term target is three gym strength sessions per week, with
optional aerial activity on Tuesday or Thursday and appropriate
running/cardio around that schedule.

The system should ramp toward that routine rather than assume immediate
full-volume adherence after a break.

------------------------------------------------------------------------

## D-004 --- Missed gym access should produce a useful fallback

**Status:** Accepted

A day should not automatically become a failed training day because the
gym is unavailable.

**Consequence:** Backup/home and shortened workouts are part of the core
product roadmap, not an optional add-on.

------------------------------------------------------------------------

## D-005 --- Local-first persistence

**Status:** Accepted

The UI writes to local storage immediately. Cloud synchronization occurs
asynchronously.

**Why:** Fitness execution should remain responsive and usable even when
network access is unreliable.

**Consequence:** Network failure must not block normal
workout/run/check-in use.

------------------------------------------------------------------------

## D-006 --- Persistent user data syncs; active sessions remain device-local

**Status:** Accepted

Cloud-synced data currently includes:

-   Custom exercises
-   Workout templates
-   Training-plan state
-   Training activity completions
-   Morning check-ins
-   Workout history
-   Run history

Active workout and active run state remain device-local.

**Why:** Cross-device active-session synchronization requires explicit
conflict semantics. Syncing active sessions without those rules could
cause two devices to overwrite one another.

**Consequence:** Do not add `fitness-os-active-workout` or
`fitness-os-active-run` to `FITNESS_OS_SYNC_KEYS` until conflict
handling is deliberately designed.

------------------------------------------------------------------------

## D-007 --- Persistent mutations use centralized storage helpers

**Status:** Accepted

Normal user mutations to cloud-synced keys use:

-   `setFitnessOsStorage()`
-   `removeFitnessOsStorage()`

Direct `localStorage` operations are still appropriate for active
sessions, migrations/repair, corruption cleanup, cloud hydration, the
storage abstraction itself, and temporary diagnostic behavior.

**Consequence:** Do not perform blanket search-and-replace conversions
of `localStorage`.

------------------------------------------------------------------------

## D-008 --- Cloud hydration must complete before feature pages mount

**Status:** Accepted

`CloudSyncProvider` belongs above route/page components in the root
layout.

**Why:** When hydration occurred inside `AppShell`, page hooks could
read stale local values before the cloud download completed. Remote
changes then required a second reload to become visible.

**Consequence:** Initialization order is:

``` text
auth/session check
→ cloud download
→ local migrations
→ hydration complete
→ page/feature hooks mount
```

------------------------------------------------------------------------

## D-009 --- Sync on launch/write is sufficient for the current product

**Status:** Accepted

Fitness OS does not currently need real-time cross-device subscriptions.

**Why:** Simultaneous active use on multiple devices is not a primary
workflow, and real-time synchronization would add conflict and state
complexity without enough benefit.

**Consequence:** Revisit only if actual usage demonstrates a need.

------------------------------------------------------------------------

## D-010 --- Cloud data is isolated by authenticated user

**Status:** Accepted

Cloud persistence associates records with the authenticated `user_id`.
The same deployed application can therefore support multiple users with
separate data.

**Consequence:** Row Level Security and user ownership are part of the
security boundary and must be preserved.

------------------------------------------------------------------------

## D-011 --- Social data will be separate from private Fitness OS storage

**Status:** Accepted / Future-facing

Future Social & Challenges functionality must not expose raw
`fitness_os_data`.

Purpose-built shared structures should represent profiles,
groups/friendships, challenges, challenge membership, scores, and
intentionally shared activity events.

**Consequence:** Private recovery, history, and other Fitness OS data
remain private unless a specific social field/event is designed for
sharing.

------------------------------------------------------------------------

## D-012 --- Plan consistency is the preferred flagship competition mode

**Status:** Accepted / Future-facing

The primary social challenge should compare adherence to each person's
own plan rather than simply reward total workout volume.

**Why:** Friends can have different fitness levels, schedules, and
programs. Consistency creates a fairer competition.

------------------------------------------------------------------------

## D-013 --- Training plan definition and user progression state remain separate

**Status:** Accepted

The structured training plan is program definition. Training-plan state
records where the user is within that program and how progression has
been applied.

**Consequence:** Avoid embedding mutable user progress directly into the
static plan definition.

------------------------------------------------------------------------

## D-014 --- Weekly progression logic should remain decomposed

**Status:** Accepted

Weekly adherence evaluation, decision selection, and state transition
are separate concerns.

**Consequence:** As recovery/performance inputs are added, preserve
pure/testable logic boundaries rather than moving progression rules into
screen components.

------------------------------------------------------------------------

## D-015 --- Today must become a real-data control center

**Status:** Accepted

The current Today experience contains both live state and static fixture
data. The next core milestone is to eliminate fake user-state data from
the live Today experience.

**Consequence:** Dynamic Mission and real Weekly Progress precede
broader feature expansion.

------------------------------------------------------------------------

## D-016 --- Documentation distinguishes current behavior from roadmap behavior

**Status:** Accepted

`ARCHITECTURE.md` documents what exists. `ROADMAP.md` documents planned
work. `DECISIONS.md` documents accepted constraints and rationale.

**Consequence:** Do not describe planned systems as implemented
architecture.

------------------------------------------------------------------------

## D-017 --- Structured fitness data and uploaded files use separate persistence paths

**Status:** Accepted

Structured Fitness OS records remain part of the local-first persistence and
cloud synchronization model.

Large binary user files such as DEXA reports and progress photos must not be
embedded in `localStorage` or `fitness_os_data`.

Those files will use private authenticated object storage. Structured Fitness OS
records may contain metadata and storage references needed to associate those
files with goals, measurements, DEXA scans, or progress check-ins.

**Why:** Binary files have different storage, synchronization, privacy, and
failure-handling requirements from small structured application records.

**Consequence:** Features that accept uploaded files must preserve the existing
local-first behavior for structured data while treating file upload/download as
a separate persistence concern. Uploaded fitness files remain private by
default and must preserve authenticated user ownership.

------------------------------------------------------------------------

## D-018 --- Apple Health enters through a native read-only bridge

**Status:** Accepted / Implementation foundation

The browser/PWA runtime cannot read Apple Health directly. Fitness OS will use
an intentional iOS native container with a project-owned Swift bridge to
HealthKit. Capacitor is the selected container direction because it preserves
the existing web application while providing a supported native plugin API.
The iOS container and physical-device authorization flow still require
validation on macOS with Xcode before this decision is fully implemented.

The first bridge is read-only: check HealthKit availability, request step-count
read access, report limited-history access when detectable, and return
cumulative daily totals for a requested local-date range.

Health totals enter the canonical `DailyStepRecord` collection with
`AppleHealth` provenance. Local calendar date is the stable identity. Repeated
sync updates a Health-owned date; an explicit in-app entry or edit becomes a
`Manual` correction and later Health refreshes preserve it.

Fitness OS must not label absent results as "permission denied." HealthKit
intentionally makes denied read access indistinguishable from no accessible
samples, although limited-history authorization can be identified separately.

**Consequence:** Do not add browser-only Apple Health code, a parallel Health
steps dataset, or automatic overwrite of manual corrections. Initial sync is a
foreground import; background delivery is a later validated step.
