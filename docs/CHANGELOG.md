# Fitness OS Changelog

This changelog records meaningful product and architecture milestones.
It is not intended to duplicate every Git commit.

## 2026-08 --- Cloud Sync Foundation

### Added

-   Supabase-backed authentication flow.
-   Per-user cloud persistence for Fitness OS data.
-   Central registry of persisted/synchronized storage keys.
-   Local-first cloud-aware storage helpers.
-   Cloud upload, download, deletion, and snapshot utilities.
-   Cloud-test tooling for synchronization verification.
-   Root-level cloud hydration before application page initialization.

### Synchronized data

-   Custom exercises.
-   Workout templates.
-   Training-plan state.
-   Training activity completions.
-   Morning check-ins.
-   Workout history.
-   Run history.

### Deliberately device-local

-   Active workout.
-   Active run.

### Verified

-   Production build/type checking.
-   PC → Supabase → phone synchronization.
-   Phone → Supabase → PC synchronization.
-   Remote changes appear after a single application launch/reload.

### Fixed

-   Cloud hydration previously occurred after route/page hooks could
    initialize from stale local storage, causing remote changes to
    require two reloads. `CloudSyncProvider` was moved to the root
    initialization boundary so hydration completes before page
    components mount.

------------------------------------------------------------------------

## 2026 --- Training Plan and Progression Foundation

### Added

-   Structured Fitness OS training plan with return/ramp and ongoing
    training phases.
-   Scheduled strength, run, walk, aerial, mobility, rest, and recovery
    activities.
-   Training-plan state persistence.
-   Training activity completion records.
-   Weekly adherence evaluation.
-   Automatic progression decisions including advance/hold behavior.
-   Training schedule resolution by calendar date.
-   Integration between completed scheduled workouts/runs and activity
    completion records.

------------------------------------------------------------------------

## 2026 --- Strength Training Foundation

### Added

-   Exercise library.
-   Custom exercises.
-   Workout template management.
-   Gym workout templates.
-   Active workout session flow.
-   Set/repetition/weight/RPE/notes logging.
-   Rest timer.
-   Previous-performance exercise targets.
-   Workout completion/history.
-   Workout deletion behavior.
-   Exercise progress views.
-   Exercise-ID migration support.

------------------------------------------------------------------------

## 2026 --- Running Foundation

### Added

-   Active run session flow.
-   Scheduled and manual runs.
-   Run/walk prescriptions.
-   Duration, distance, RPE, and notes logging.
-   Run history.
-   Run deletion.
-   Running progress views.
-   Scheduled training completion integration.

------------------------------------------------------------------------

## 2026 --- Recovery and Coach Foundation

### Added

-   Morning check-in.
-   Energy, sleep, mood, stress, and soreness ratings.
-   Readiness calculation.
-   Basic rule-based Coach recommendation engine.
-   Recovery progress views.

------------------------------------------------------------------------

## 2026 --- Application / PWA Foundation

### Added

-   Next.js App Router application.
-   Shared application shell.
-   Mobile bottom navigation.
-   Today, Workout, Running, Progress, History, and Settings routes.
-   Installable web app manifest and icons.
-   Service worker registration.
-   Mobile safe-area-aware layout behavior.

------------------------------------------------------------------------

## Next

See `ROADMAP.md`.

The current development milestone is **Complete the Core Daily Coaching
Loop**, beginning with replacing static Today Mission/Weekly Progress
data with real application state.
