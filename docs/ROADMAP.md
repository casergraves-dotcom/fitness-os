**# Fitness OS Roadmap**

**## North Star**

Fitness OS exists to answer one question:

\> **\*\*What should I do next to make meaningful progress toward my fitness goals?\*\***

The project began as a way to rebuild a sustainable training routine after an extended period of travel and inconsistent gym attendance. The product must remain anchored to that problem rather than becoming only a workout logger.

**### Primary outcome**

Improve body composition through sustainable fat loss, with reducing abdominal fat as the practical goal. Scale weight is a useful trend, not the sole definition of success.

**### Secondary outcomes**

\- Retain and build useful muscle.
\- Maintain strength and capacity for aerials, snowboarding, hiking, and other active hobbies.
\- Improve cardiovascular fitness.
\- Build a training routine that survives travel, schedule disruption, and missed gym days.
\- Reduce the amount of day-to-day planning required from the user.

**### Target routine**

The long-term default rhythm is:

\- **\*\*Monday:\*\*** Gym
\- **\*\*Tuesday:\*\*** Optional aerial / recovery
\- **\*\*Wednesday:\*\*** Gym
\- **\*\*Thursday:\*\*** Optional aerial / recovery
\- **\*\*Friday:\*\*** Gym
\- **\*\*Weekend:\*\*** Running, walking, hiking, recovery, or other appropriate conditioning

The system should build toward that rhythm gradually rather than assuming full training volume immediately.

**### Product requirement**

Fitness OS should not merely record what happened. It should increasingly use training history, adherence, recovery, and progress to recommend the most appropriate action today.

**---**

**# Development Principles**

1\. **\*\*Finish the core coaching loop before expanding scope.\*\***
2\. **\*\*Prefer adherence over theoretical perfection.\*\*** A plan the user follows is better than a more aggressive plan they abandon.
3\. **\*\*Progress gradually.\*\*** Strength, running, and overall weekly load should ramp safely.
4\. **\*\*Treat aerials and active hobbies as real training load.\*\***
5\. **\*\*A missed gym day should have a useful fallback, not become a failed day.\*\***
6\. **\*\*Persistent user data should remain authenticated, private, and cloud-backed.\*\***
7\. **\*\*Active workout/run sessions remain device-local until conflict handling is deliberately designed.\*\***
8\. **\*\*Social features must expose only intentionally shared data, never raw private Fitness OS storage.\*\***
9\. Every major feature should pass the Vision test:
   > Does this help the user make a better decision today?

**---**

**# Current State**

**## Completed Foundation**

**### Application platform**

\- [x] Next.js application structure
\- [x] Responsive/mobile-first interface
\- [x] Installable PWA
\- [x] Offline application shell
\- [x] Supabase authentication
\- [x] Per-user cloud data isolation
\- [x] Persistent-data cloud synchronization
\- [x] Sync on persistent writes
\- [x] Cloud hydration before page initialization
\- [x] Cross-device PC -> cloud -> phone synchronization verified
\- [x] Cross-device phone -> cloud -> PC synchronization verified
\- [x] Active workout and active run intentionally remain device-local

**### Strength training**

\- [x] Exercise library
\- [x] Custom exercises
\- [x] Editable workout templates
\- [x] Gym A / Gym B / Gym C templates
\- [x] Active workout sessions
\- [x] Set, weight, rep, RPE, and notes logging
\- [x] Rest timer
\- [x] Exercise targets based on previous performance
\- [x] Workout history
\- [x] Exercise progress views
\- [x] Persistent workout history cloud sync

**### Training plan**

\- [x] Structured return-to-training ramp
\- [x] Week 0 Return phase
\- [x] Progressive ramp weeks
\- [x] Steady-state training phase
\- [x] Deload support
\- [x] Scheduled strength, running, walking, aerial, mobility, rest, and recovery activities
\- [x] Training activity completion tracking
\- [x] Weekly adherence evaluation
\- [x] Automatic advance / advance-with-warning / hold decisions
\- [x] Training-plan state persistence and cloud sync

**### Running**

\- [x] Scheduled and manually started runs
\- [x] Duration, distance, RPE, and notes
\- [x] Run/walk prescription support
\- [x] Run history
\- [x] Running progress views
\- [x] Scheduled run completion integration
\- [x] Persistent run history cloud sync

**### Recovery and guidance**

\- [x] Morning check-in
\- [x] Energy, sleep, mood, stress, and soreness inputs
\- [x] Readiness calculation
\- [x] Basic Coach recommendation engine
\- [x] Recovery progress views
\- [x] Morning check-in cloud sync

**---**

**# Phase 1 — Complete the Core Daily Coaching Loop**

**\*\*Priority: NOW\*\***

The current Today screen mixes live training data with placeholder/static Mission and Weekly Progress data. The next milestone is to make Today a trustworthy control center driven entirely by real Fitness OS state.

**## 1.1 Dynamic Today Mission — COMPLETE**

\- [x] Remove dependency on static \`today\` fixture data for the live Today experience.
\- [x] Derive today's mission from the active training plan and actual date.
\- [x] Derive workout/activity status from real completion records.
\- [x] Remove placeholder protein and step goals until real/configurable data sources exist.
\- [x] Clearly distinguish required and optional activities.
\- [x] Handle rest/recovery days intentionally.
\- [x] Handle days with no active training plan.
\- [x] Remove obsolete Today fixture data/types after live consumers are migrated.

**\*\*Completed outcome:\*\*** every item shown under Today's Mission is derived from real, current Fitness OS state. Protein and step goals return in Phase 5 once their data sources are real.

**## 1.2 Real Weekly Progress — COMPLETE**

\- [x] Replace static weekly progress values.
\- [x] Calculate required training activities scheduled this week.
\- [x] Calculate completed required activities.
\- [x] Show strength-session adherence.
\- [x] Show overall plan adherence.
\- [x] Surface current-week progression status using the same adherence/progression rules as automatic progression.
\- [x] Show optional training separately without counting it against required adherence.
\- [x] Respect substitution-group requirements.
\- [x] Do not show protein/step streak data until those data sources are real.
\- [x] Verify workout completion updates Mission and Weekly Progress immediately without a page reload.

**\*\*Completed outcome:\*\*** the weekly card reflects the same real completion records and adherence rules used by automatic progression.

**## 1.3 Reset Plan UX**

\- [ ] Rename \`Reset\` to \`Reset Plan\`.
\- [ ] Add confirmation before clearing plan state.
\- [ ] Explicitly state that workout history, run history, check-ins, and completed historical data are preserved.

**## 1.4 Strength Workout Completion Validation**

\- [ ] Prevent an empty strength session from satisfying a scheduled strength activity.
\- [ ] Require meaningful workout input before recording scheduled strength completion (initial rule: at least one completed working set).
\- [ ] Keep cancel/discard behavior separate from completion.
\- [ ] Define behavior for intentionally shortened or recovery-modified strength sessions.
\- [ ] Ensure invalid/empty sessions do not increase weekly required-training, strength-session, or adherence counts.

**\*\*Done when:\*\*** a zero-set/zero-exercise strength session cannot satisfy the training plan, while legitimate shortened sessions remain supportable.

**## 1.5 Guide Integration**

\- [ ] Make Coach/Guide aware of today's actual scheduled activity.
\- [ ] Combine readiness with training type when giving advice.
\- [ ] Distinguish normal training, reduced-effort training, recovery, and substitution recommendations.
\- [ ] Explain recommendations briefly and calmly.
\- [ ] Avoid recommendations that silently alter the long-term program.

**\*\*Milestone:\*\*** Opening Today reliably answers **\*\*"What should I do today?"\*\***

**---**

**# Phase 2 — Flexible Execution and Backup Workouts**

**\*\*Priority: CORE\*\***

This phase directly addresses the original requirement that missing the gym should not automatically mean missing training.

**## 2.1 Backup Workout Model**

\- [ ] Define a substitute-workout data model.
\- [ ] Create home equivalents for Gym A, Gym B, and Gym C.
\- [ ] Support equipment-aware substitutions where useful.
\- [ ] Create abbreviated gym sessions for time-constrained days.
\- [ ] Preserve the training intent of the scheduled workout rather than copying exercises mechanically.

**## 2.2 Today Substitution Flow**

\- [ ] Add \`Can't make the gym?\` / substitute action.
\- [ ] Offer the appropriate home or shortened workout.
\- [ ] Let the user explicitly choose the substitution.
\- [ ] Record the substitute against the scheduled activity.
\- [ ] Count an appropriate substitute toward adherence.
\- [ ] Preserve what was actually performed in history.

**## 2.3 Coach-Recommended Modification**

\- [ ] Allow low readiness to recommend reduced volume/intensity.
\- [ ] Allow high soreness to influence exercise/session recommendations.
\- [ ] Avoid turning every imperfect check-in into a skipped workout.
\- [ ] Keep user override available.

**\*\*Milestone:\*\*** Schedule disruption produces a useful alternative instead of a failed training day.

**---**

**# Phase 3 — Mature the Adaptive Training Plan**

**\*\*Priority: CORE\*\***

The existing plan can advance or hold based on adherence. This phase makes adaptation reflect performance and recovery as well.

**## 3.1 Strength Progression**

\- [ ] Formalize exercise-level progression rules.
\- [ ] Use completed sets/reps/RPE to recommend next-session loads.
\- [ ] Distinguish successful progression, repeat, and regression.
\- [ ] Handle exercise substitutions without losing progression history.
\- [ ] Surface PRs without encouraging unnecessary max-effort testing.

**## 3.2 Weekly Training Decisions**

\- [ ] Incorporate recent recovery alongside adherence.
\- [ ] Incorporate strength-session quality where appropriate.
\- [ ] Incorporate running completion/load.
\- [ ] Treat aerial participation as meaningful training load.
\- [ ] Explain why a week advanced, held, or deloaded.
\- [ ] Allow manual override with a clear record of the decision.

**## 3.3 Steady-State Programming**

\- [ ] Validate the long-term Mon/Wed/Fri strength structure.
\- [ ] Validate running placement around strength and aerials.
\- [ ] Define how optional Tue/Thu aerial sessions affect adjacent training.
\- [ ] Define long-term deload triggers.
\- [ ] Define return-to-training behavior after illness, travel, or a prolonged break.

**\*\*Milestone:\*\*** Fitness OS adapts the program rather than merely moving through a calendar.

**---**

**# Phase 4 — Body Composition and Goal Progress**

**\*\*Priority: CORE\*\***

Fat loss is the primary outcome, so Fitness OS needs to measure whether training and lifestyle are actually moving body composition in the desired direction.

**## 4.1 Goal Profile**

\- [ ] Add user goal configuration.
\- [ ] Support fat-loss/body-composition goal as the primary goal.
\- [ ] Store target/goal context without overemphasizing a single scale number.
\- [ ] Support relevant performance/hobby goals.

**## 4.2 Measurements**

\- [ ] Body-weight logging and trend.
\- [ ] Waist measurement logging and trend.
\- [ ] Optional body-composition entries when available.
\- [ ] Use rolling trends rather than reacting to daily weight noise.

**## 4.3 Progress Summary**

\- [ ] Combine body-composition trend with strength retention/progression.
\- [ ] Combine running/cardio trend.
\- [ ] Combine adherence.
\- [ ] Highlight whether the current approach appears to be working.
\- [ ] Avoid automatic training changes from a single measurement.

**\*\*Milestone:\*\*** Fitness OS can answer **\*\*"Is this program actually getting me toward the outcome I want?"\*\***

**---**

**# Phase 5 — Nutrition and Daily Activity**

**\*\*Priority: HIGH, after core training loop\*\***

Nutrition and daily movement materially affect the primary fat-loss goal, but Fitness OS should avoid becoming a cumbersome food diary.

**## 5.1 Nutrition Targets**

\- [ ] Configurable calorie target.
\- [ ] Configurable protein target.
\- [ ] Simple daily adherence input.
\- [ ] Weekly protein adherence.
\- [ ] Weekly calorie adherence where data is available.

**## 5.2 Steps / General Activity**

\- [ ] Configurable daily step target.
\- [ ] Daily step completion.
\- [ ] Weekly step adherence.
\- [ ] Consider automatic health-platform import later.

**## 5.3 Guide Integration**

\- [ ] Use nutrition/activity adherence as context, not punishment.
\- [ ] Avoid compensatory exercise recommendations for individual high-calorie days.
\- [ ] Surface persistent trends that materially affect the goal.

**\*\*Milestone:\*\*** Today's Mission and Weekly Progress can include real protein and step data instead of placeholders.

**---**

**# Phase 6 — Reflect: Reviews and Better Progress Insights**

**\*\*Priority: HIGH\*\***

**## 6.1 Weekly Review**

\- [ ] Summarize scheduled vs completed training.
\- [ ] Summarize strength progress.
\- [ ] Summarize running progress.
\- [ ] Summarize recovery trend.
\- [ ] Summarize body-composition trend when available.
\- [ ] Explain the next week's training decision.
\- [ ] Highlight one or two useful observations rather than dumping metrics.

**## 6.2 Progress UX**

\- [ ] Improve strength trend visualization.
\- [ ] Improve running trend visualization.
\- [ ] Improve recovery trend visualization.
\- [ ] Add body-composition trends.
\- [ ] Add adherence trends.
\- [ ] Add meaningful PR/history highlights.

**\*\*Milestone:\*\*** Reflect improves the next Guide decision.

**---**

**# Phase 7 — Settings and Personalization**

**## 7.1 Training Preferences**

\- [ ] Preferred gym days.
\- [ ] Preferred aerial days.
\- [ ] Running availability/preferences.
\- [ ] Available home equipment.
\- [ ] Typical session-duration constraints.

**## 7.2 Goals and Targets**

\- [ ] Protein target.
\- [ ] Step target.
\- [ ] Body-composition goal.
\- [ ] Training emphasis/preferences.

**## 7.3 Account and Data**

\- [ ] Clear sign-out/account switching UX.
\- [ ] Review first-time-user behavior.
\- [ ] Review empty-account onboarding.
\- [ ] Data export.
\- [ ] Intentional account/data deletion flow.
\- [ ] Review cloud-sync status/error UX.

**---**

**# Phase 8 — Health Data Integrations**

**\*\*Future\*\***

\- [ ] Evaluate Apple Health / Health Connect integration.
\- [ ] Steps import.
\- [ ] Weight import where available.
\- [ ] Sleep/recovery inputs where useful.
\- [ ] Running/activity import where it improves rather than duplicates Fitness OS.
\- [ ] Define source-of-truth/conflict rules before enabling bidirectional writes.

Integrations should reduce manual entry. They should not create a second, conflicting training history.

**---**

**# Phase 9 — Social & Challenges**

**\*\*Future major feature\*\***

Fitness OS remains private by default. Social features operate through purpose-built shared data rather than exposing raw \`fitness\_os\_data\`.

**## 9.1 Social Foundation**

\- [ ] Public/shareable profile fields.
\- [ ] Friend relationships and/or private groups.
\- [ ] Privacy controls.
\- [ ] Dedicated social database tables and RLS policies.

**## 9.2 Challenges**

Flagship mode:

\- [ ] **\*\*Plan Consistency\*\*** — compete on percentage of each person's own planned training completed.

Additional challenge modes:

\- [ ] Total workouts
\- [ ] Running distance
\- [ ] Steps
\- [ ] Strength volume
\- [ ] Streaks
\- [ ] Balanced Fitness OS score

**## 9.3 Competition UX**

\- [ ] Challenge creation/joining.
\- [ ] Defined challenge periods.
\- [ ] Leaderboards.
\- [ ] Weekly bonuses/group milestones where appropriate.
\- [ ] Optional activity feed with intentionally shared events.
\- [ ] Achievements/badges only if they support motivation without making the core product feel like social media.

**\*\*Milestone:\*\*** Friends can compete fairly despite having different programs and fitness levels.

**---**

**# Phase 10 — Advanced Platform Work**

**\*\*Later / as justified\*\***

\- [ ] Active-workout cross-device conflict handling.
\- [ ] Active-run cross-device conflict handling.
\- [ ] Near-live synchronization only if actual usage demonstrates a need.
\- [ ] Notifications/reminders.
\- [ ] Calendar/travel awareness.
\- [ ] More sophisticated coaching models.
\- [ ] Additional training modalities.
\- [ ] Broader multi-user onboarding/product polish.

**---**

**# Near-Term Execution Order**

Work should proceed in this order unless a bug or safety issue interrupts it:

1\. ~~**\*\*Dynamic Today Mission\*\***~~ — complete
2\. ~~**\*\*Real Weekly Progress\*\***~~ — complete
3\. **\*\*Reset Plan UX\*\***
4\. **\*\*Strength workout completion validation\*\***
5\. **\*\*Guide integration with live training/readiness\*\***
6\. **\*\*Backup/home and shortened workout system\*\***
7\. **\*\*Strength progression improvements\*\***
8\. **\*\*Adaptive weekly programming\*\***
9\. **\*\*Body-composition/goal tracking\*\***
10\. **\*\*Nutrition and step adherence\*\***
11\. **\*\*Weekly review and progress improvements\*\***

Social, integrations, and advanced sync remain mapped but should not displace the core coaching loop.

**---**

**# Definition of Core Fitness OS v1**

Core v1 is reached when the user can open Fitness OS and, without independently designing the day, understand:

1\. **\*\*What should I do today?\*\***
2\. **\*\*Why is that the right choice today?\*\***
3\. **\*\*What should I do if the original plan is not practical?\*\***
4\. **\*\*How do I execute and record it?\*\***
5\. **\*\*Did I follow the plan this week?\*\***
6\. **\*\*Should the program progress, hold, or recover?\*\***
7\. **\*\*Am I moving toward better body composition while maintaining/improving useful fitness?\*\***

Until Fitness OS can answer those questions reliably, new feature areas should generally remain secondary.