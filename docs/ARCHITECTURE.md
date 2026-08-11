# Fitness OS Architecture

## Purpose

This document describes the architecture that exists in the codebase
today. Planned architecture belongs in `ROADMAP.md` unless a decision
has already been made and recorded in `DECISIONS.md`.

## High-Level Structure

Fitness OS uses a feature-oriented Next.js App Router structure.

``` text
Root Layout
├─ ServiceWorkerRegistration
└─ CloudSyncProvider
   └─ Route Page
      └─ Feature Screen
         └─ AppShell
            ├─ Authentication gate
            ├─ Header
            ├─ PageContainer
            └─ BottomNav
```

A key initialization requirement is that cloud hydration occurs **above
route page components**. This prevents feature hooks from reading stale
local data before cloud data has been downloaded.

## Application Layer

### `app/`

`app/` contains route entry points and the root layout.

Current routes include:

-   `/today`
-   `/workout`
-   `/running`
-   `/progress`
-   `/history`
-   `/settings`
-   `/settings/exercises`
-   `/settings/workouts`
-   `/settings/cloud-test`

The root layout remains a Server Component so it can export Next.js
metadata and viewport configuration. It renders the client-side
`CloudSyncProvider` around route children.

### `components/layout/`

Shared application framing lives here:

-   `AppShell.tsx` --- authentication gate and main application chrome.
-   `Header.tsx` --- top header/greeting/settings access.
-   `PageContainer.tsx` --- shared page sizing/padding.
-   `BottomNav.tsx` --- primary mobile navigation.

### `components/ui/`

Shared UI primitives and Fitness OS-level presentation components live
here. Feature-specific components should remain inside their feature
unless they are genuinely reusable across the application.

## Feature Layer

### `features/auth`

Owns authentication UI/state.

`useAuth()`:

1.  Loads the existing Supabase session.
2.  Subscribes to auth-state changes.
3.  Exposes `session`, `user`, and `loaded`.

`AppShell` waits for auth resolution and shows `SignInScreen` when there
is no authenticated user.

### `features/recovery`

Owns the morning check-in and readiness calculation.

Current check-in inputs include energy, sleep, mood, stress, and
soreness. Readiness utilities convert those ratings into a readiness
result used by guidance.

### `features/coach`

Owns the current recommendation engine and Coach UI. The current engine
is rule-based. The roadmap calls for progressively connecting it to real
scheduled training, recovery, adherence, and later progress context.

### `features/workout`

This is currently the largest domain and owns:

-   Exercise definitions/library
-   Custom exercises
-   Workout templates
-   Active workout sessions
-   Workout history
-   Exercise targets
-   Training plan
-   Training activity completion records
-   Weekly adherence evaluation
-   Weekly progression decisions
-   Training-plan state
-   One-time exercise-ID migration

Pure training/progression logic is kept under `features/workout/logic/`
where possible.

### `features/running`

Owns active run sessions, run history, scheduled-run integration, and
run execution UI.

### `features/today`

Owns the Today screen, Today's Training card, Mission card, and Weekly
Progress card.

This feature is currently transitional: training schedule/completion
state is live, while some Mission/Weekly Progress data still comes from
static fixture data. Removing that split is the next roadmap milestone.

### `features/progress`

Owns strength, running, and recovery progress views/charts.

## Training Plan Architecture

The training plan is represented as structured data in
`features/workout/trainingPlan.ts`.

A plan contains weeks; weeks contain days; days contain activities.
Activities can represent strength, running, walking, aerial, mobility,
rest, recovery, and related training types.

Training-plan state tracks the user's active plan and progression state
separately from the plan definition.

### Schedule resolution

`getTrainingScheduleForDate()` maps:

-   the training plan,
-   current training-plan state,
-   and a calendar date

to the applicable scheduled training day/activity set.

### Completion records

Scheduled activity completion is persisted independently through
training activity completion records. This allows adherence/progression
logic to reason about the plan without depending only on workout/run
history.

### Weekly progression

The progression pipeline is intentionally separated into logic modules:

``` text
Scheduled activities + completion records
                ↓
      evaluateWeeklyAdherence
                ↓
   getWeeklyProgressionDecision
                ↓
      applyTrainingProgression
                ↓
        TrainingPlanState
```

This separation should be preserved as adaptive logic becomes more
sophisticated.

## Persistence Architecture

### Local-first UI

`localStorage` remains the immediate persistence source for the current
application UI. User actions should not wait for network round trips.

### Central storage keys

`lib/storage/fitnessOsStorageKeys.ts` is the source of truth for
persisted Fitness OS keys.

Cloud-synced keys currently include:

``` text
fitness-os-custom-exercises
fitness-os-workout-templates
fitness-os-training-plan-state
fitness-os-training-activity-completions
fitness-os-morning-check-ins
fitness-os-workout-history
fitness-os-run-history
```

Device-local keys currently include:

``` text
fitness-os-active-workout
fitness-os-active-run
```

### Persistent mutation path

Persistent user mutations should use the centralized helpers in
`lib/storage/fitnessOsStorage.ts`.

``` text
Feature mutation
      ↓
setFitnessOsStorage / removeFitnessOsStorage
      ↓
localStorage changes immediately
      ↓
cloud upload/delete runs asynchronously
```

Network failure is logged and must not block normal local application
use.

### Cloud hydration path

At application initialization:

``` text
RootLayout
   ↓
CloudSyncProvider mounts
   ↓
Supabase session check
   ↓
downloadAllCloudData()
   ↓
cloud values written to localStorage
   ↓
local migrations run
   ↓
hydration marked complete
   ↓
route/page components mount
   ↓
feature hooks read hydrated localStorage
```

The placement of `CloudSyncProvider` above route pages is intentional.
When it was placed inside `AppShell`, page hooks could initialize before
hydration and required a second reload to show remote changes.

### Direct `localStorage` usage

Direct writes/removals still exist intentionally for:

-   Active workout/run state.
-   Load-time corruption cleanup.
-   One-time migrations/repairs.
-   Cloud-to-local hydration.
-   The storage abstraction itself.
-   Temporary cloud-test behavior.

Do not mechanically replace every direct `localStorage` call with
cloud-aware helpers.

## Cloud Data Model

Persistent data is stored in Supabase in `fitness_os_data`.

The synchronization layer associates records with the authenticated
`user_id` and a `data_key`. Upserts use the logical conflict key:

``` text
user_id + data_key
```

This allows the same deployed application to support multiple
authenticated users while keeping each user's Fitness OS records
separate.

Database Row Level Security is part of the privacy boundary and should
remain aligned with authenticated user ownership.

## Authentication and Multi-User Behavior

The client uses Supabase authentication. The current sign-in screen uses
email/password sign-in.

The storage architecture is multi-user capable because cloud records are
associated with authenticated users. Product-level multi-user polish
such as onboarding, account switching, profiles, and social sharing is
not yet complete.

## PWA Architecture

Fitness OS includes:

-   Web app manifest.
-   Standalone display mode.
-   App icons.
-   Service worker registration.
-   Mobile safe-area handling in key layout elements.

The PWA is intended to be a practical phone-first application while
retaining desktop usability.

## Data Ownership Boundaries

Private fitness data should remain private by default.

Future social/challenge features must use purpose-built shared records
rather than exposing raw `fitness_os_data`.

## Architecture Change Checklist

Before changing a foundational system, verify:

1.  Does this preserve local-first usability?
2.  Does it preserve per-user data isolation?
3.  Does it accidentally sync active/transient state?
4.  Does initialization still hydrate before feature hooks mount?
5.  Does the change keep pure progression logic separate from UI?
6.  Does it introduce a second source of truth?
7.  Is the decision important enough to record in `DECISIONS.md`?
