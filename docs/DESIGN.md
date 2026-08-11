# Fitness OS Design

## Design Goal

Fitness OS should feel calm, focused, and intentional.

The interface exists to make the next useful action obvious without
forcing the user to interpret a dense fitness dashboard.

The existing vision references the feel of Apple Health, Linear, and
Notion while explicitly avoiding the feel of social media, heavily
gamified fitness products, bodybuilding apps, and spreadsheet software.

## Experience Hierarchy

The application should reinforce the four product pillars:

1.  **Mission** --- what matters now.
2.  **Guide** --- why.
3.  **Execute** --- perform/log it.
4.  **Reflect** --- learn from it.

On the Today screen, the primary hierarchy should therefore be:

``` text
Guidance / today's decision
        ↓
Today's training/action
        ↓
Supporting mission items
        ↓
Recovery input/context
        ↓
Weekly progress/context
```

Exact ordering can evolve, but the user should not need to inspect
charts before understanding today's action.

## Visual Character

Prefer:

-   Light, neutral surfaces.
-   Strong but restrained blue accent for primary/active states.
-   Slate/gray text hierarchy.
-   White cards on a light page background.
-   Generous spacing.
-   Rounded cards and controls.
-   Clear section titles.
-   Minimal decorative noise.

The current application uses Tailwind/shadcn-style design tokens and
Geist typography.

## Typography

Use typography to communicate hierarchy rather than relying on excessive
borders or color.

General intent:

-   Page/title text: strong and concise.
-   Section/card headings: clearly differentiated from body text.
-   Body text: readable and neutral.
-   Supporting metadata: smaller/muted.
-   Primary actions: obvious without becoming visually aggressive.

Avoid shrinking important content merely to fit more information on one
screen.

## Color

Current application styling is predominantly neutral/slate with blue
used for primary/active emphasis.

Use semantic colors deliberately:

-   Blue: primary action/current navigation/emphasis.
-   Red/destructive: destructive actions or genuine error states.
-   Muted neutral: secondary information.
-   Additional semantic colors should be introduced only when they
    improve comprehension.

Do not turn readiness/progress into an unnecessarily alarming
traffic-light system.

## Cards and Surfaces

Cards should group a single coherent decision or task.

A good card answers one of:

-   What should I do?
-   What is my status?
-   What input is needed?
-   What changed?
-   What action can I take?

Avoid cards that become mini dashboards with many unrelated metrics.

## Navigation

The current primary mobile navigation is a fixed five-item bottom
navigation:

-   Today
-   Workout
-   Progress
-   Running
-   History

Settings is accessed outside the primary five-item flow.

Navigation should remain thumb-friendly and respect mobile safe-area
insets.

Future navigation changes should be driven by product hierarchy, not by
adding a tab for every new feature.

## Mobile First

The PWA is expected to be used heavily on a phone during real training.

Design for:

-   One-handed interaction where practical.
-   Large touch targets.
-   Readability at arm's length.
-   Minimal typing during workouts.
-   Fixed navigation that does not cover content.
-   Safe-area support.
-   Fast resume/start behavior.

Desktop layouts may use additional width but should not require
desktop-only interaction patterns.

## Forms and Logging

Workout/run/check-in entry should minimize friction.

Prefer:

-   Defaults from prior performance.
-   Sensible prefilled targets.
-   Tap/select controls where practical.
-   Short forms.
-   Progressive disclosure for notes/details.

Avoid requiring data that will not improve execution or future guidance.

## Coach / Guide

Guide should feel like a calm, competent training assistant.

Recommendations should generally include:

1.  The recommendation.
2.  A short reason.
3.  The next action.

Avoid:

-   Long motivational speeches.
-   Judgment.
-   Guilt.
-   Overconfident medical-style claims.
-   Constant warnings for ordinary variation.

## Progress and Charts

Charts should answer a question, not merely display data.

Examples:

-   Is strength being maintained while body weight falls?
-   Is running capacity improving?
-   Is recovery trending down?
-   Is adherence becoming more consistent?

Use clear time ranges, labels, and summaries. Prefer trends over noisy
single-day values.

## Empty and Transitional States

Empty states should tell the user what to do next.

Examples:

-   No active plan → start/select the training plan.
-   No workout history → complete a workout.
-   No measurement data → add the first measurement when that feature
    exists.

Do not display fabricated metrics to make an empty screen look
populated.

## Required vs Optional Training

The UI should clearly distinguish:

-   Required scheduled work.
-   Optional activity.
-   Recommended substitution.
-   Recovery/rest.

Optional activities should not visually read as failed requirements when
skipped.

## Destructive Actions

Destructive or reset actions should:

-   Be clearly named.
-   Explain scope.
-   Confirm when data/state loss is meaningful.
-   State what will be preserved when ambiguity is likely.

Example: `Reset Plan` should not imply workout history will be deleted.

## Social Design

Future social/challenge functionality should remain subordinate to the
core training experience.

Avoid:

-   Infinite feeds.
-   Engagement bait.
-   Public-by-default fitness data.
-   Competition that rewards unhealthy volume.

Competition should emphasize fair, intentional challenge structures such
as consistency against one's own plan.

## Accessibility

Maintain:

-   Semantic controls.
-   Visible focus states.
-   Sufficient text contrast.
-   Labels for form fields.
-   Touch targets appropriate for mobile.
-   Meaning that is not conveyed by color alone.

## Design Test

Before adding a visual element, ask:

> Does this make the next decision or action clearer?

If not, simplify.
