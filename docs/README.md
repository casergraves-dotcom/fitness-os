# Fitness OS

Fitness OS is a personal training and recovery application designed to
answer a practical daily question:

> **What should I do next to make meaningful progress toward my fitness
> goals?**

It is being built as an operating system for training decisions rather
than only as a workout logger. The current product combines a structured
training plan, strength and running execution, recovery check-ins,
progression logic, history, progress views, authentication, and
cross-device cloud persistence.

## Product Direction

The core product is organized around four ideas:

-   **Mission** --- what matters today.
-   **Guide** --- why that is the right choice.
-   **Execute** --- make the activity easy to perform and record.
-   **Reflect** --- turn completed work into better future decisions.

The immediate development priority is to complete that loop with real
application data and adaptive guidance.

See:

-   `docs/VISION.md` for the product vision.
-   `docs/PRINCIPLES.md` for durable product principles.
-   `docs/ROADMAP.md` for planned development.
-   `docs/ARCHITECTURE.md` for the current technical structure.
-   `docs/DECISIONS.md` for important architectural/product decisions.
-   `docs/STANDARDS.md` for implementation conventions.
-   `docs/DESIGN.md` for UI/UX direction.
-   `docs/CHANGELOG.md` for completed milestones.

## Current Capabilities

### Training plan and Today

-   Structured return-to-training and progression plan.
-   Scheduled strength, running, walking, aerial, mobility, rest, and
    recovery activities.
-   Training activity completion tracking.
-   Weekly adherence evaluation and progression decisions.
-   Morning recovery check-in.
-   Basic Coach recommendation engine.
-   Today screen with training, mission, recovery, and weekly-progress
    surfaces.

Some Today content is still transitional/static. Replacing those
placeholders with real state is the current roadmap priority.

### Strength training

-   Exercise library and custom exercises.
-   Editable workout templates.
-   Active workout sessions.
-   Set, rep, weight, RPE, and notes logging.
-   Rest timer.
-   Exercise targets based on prior performance.
-   Workout history.
-   Strength/exercise progress views.

### Running

-   Scheduled and manually started runs.
-   Duration, distance, RPE, notes, and run/walk prescriptions.
-   Run history and running progress views.
-   Scheduled run completion integration.

### Platform

-   Next.js App Router.
-   React and TypeScript.
-   Tailwind CSS and shadcn/Base UI components.
-   Installable PWA behavior.
-   Supabase email/password authentication.
-   Per-user cloud persistence.
-   Sync on persistent writes.
-   Cloud hydration before application pages mount.
-   Verified PC-to-phone and phone-to-PC persistence.

## Technology

Current primary dependencies include:

-   Next.js 16
-   React 19
-   TypeScript 5
-   Supabase JS
-   Tailwind CSS 4
-   shadcn / Base UI
-   Recharts
-   Lucide React

See `package.json` for exact versions.

## Repository Structure

``` text
app/                  Next.js routes and root layout
components/
  layout/             Shared application shell/navigation
  pwa/                PWA registration
  sync/               Cloud initialization/hydration
  ui/                 Shared UI primitives
features/
  auth/               Authentication
  coach/              Recommendation engine and UI
  progress/           Strength/running/recovery progress
  recovery/           Morning check-in and readiness
  running/            Run sessions
  today/              Today/Mission/Weekly Progress
  workout/            Exercises, templates, sessions, plan, progression
lib/
  design/             Design tokens/helpers
  storage/            Local/cloud persistence layer
  supabase/           Supabase client/data helpers
docs/                 Project documentation
public/               PWA/static assets
```

## Local Development

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Build the production application:

``` bash
npm run build
```

Run linting:

``` bash
npm run lint
```

To test on a phone on the same network, see `docs/DEVELOPMENT.md`.

## Environment

The Supabase client expects these public environment variables:

``` text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Keep environment-specific values in `.env.local`; do not commit secrets
or local environment files.

## Persistence Model

Persistent Fitness OS data is written locally first and synchronized
asynchronously to Supabase. The current cloud-synced categories are:

-   Custom exercises
-   Workout templates
-   Training-plan state
-   Training activity completions
-   Morning check-ins
-   Workout history
-   Run history

Active workout and active run state are intentionally device-local until
cross-device conflict handling is designed.

See `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` before changing
persistence behavior.

## Current Development Priority

The next milestone is **Complete the Core Daily Coaching Loop**:

1.  Dynamic Today Mission
2.  Real Weekly Progress
3.  Safer Reset Plan UX
4.  Guide integration with live training and readiness
5.  Backup/home and shortened workouts

The product should become increasingly capable of telling the user what
to do today, why, and what to do when the original plan is impractical.
