# Workout Tracker Build Guide

This document explains the app end to end:

- what tech stack it uses
- how the folders are organized
- how data flows through the app
- how workout logging works
- why certain implementation choices were made

The goal is not just to describe the code, but to help you understand how to think like the builder of the app.

## 1. Product Goal

The app is designed around a simple idea:

1. define workout types
2. build exercises inside each workout type
3. log a workout session quickly
4. review past main workout performance clearly

The design intentionally separates:

- `main workout`:
  detailed tracking with sets, reps, weight, dropsets, and supersets
- `support work`:
  simpler checkbox tracking for warm-up, post-workout, cardio, abs, and forearms

This separation keeps logging fast and reviews clean.

## 2. End-to-End Tech Stack

## Frontend framework

- `Next.js 16`
- `React 19`
- `TypeScript`

Why this is useful:

- `Next.js` gives routing, page structure, and build tooling
- `React` makes it easy to break the UI into reusable components
- `TypeScript` helps prevent data-shape mistakes while the app grows

## Styling

- plain `CSS` in `src/app/globals.css`

Why this was chosen:

- no extra UI library overhead
- fast to customize
- full control over the dark visual style

## State and persistence

- local component state with `useState`, `useMemo`, `useEffect`
- browser `localStorage` for persistence

Why this was chosen:

- simple setup
- no backend needed
- no Redux or heavy state framework needed
- perfect for a personal-use MVP

## Tooling

- `ESLint`
- `TypeScript compiler`
- `Next.js build pipeline`

These help catch:

- type mismatches
- invalid imports
- runtime-risky patterns
- broken production builds

## 3. Runtime Architecture

The app is a client-heavy Next.js application.

That means:

- routes are defined with App Router pages
- most meaningful UI logic lives inside client components
- data is loaded from `localStorage` in the browser

There is no database server and no API layer yet.

## 4. Routing Structure

The `src/app` folder defines pages.

## Core routes

- `src/app/page.tsx`
  Home dashboard
- `src/app/workout/page.tsx`
  Workout dashboard
- `src/app/workout/types/page.tsx`
  Workout type management
- `src/app/workout/manage/page.tsx`
  Manage workouts overview
- `src/app/workout/manage/[workoutTypeId]/page.tsx`
  Builder page for one workout type
- `src/app/session/[id]/page.tsx`
  One active workout session
- `src/app/history/[workoutTypeId]/page.tsx`
  Review table for a workout type
- `src/app/nutrition/page.tsx`
  Nutrition tracking
- `src/app/body/page.tsx`
  Body tracking

## What this teaches

In Next.js App Router, every `page.tsx` file becomes a route.

Examples:

- `src/app/workout/page.tsx` becomes `/workout`
- `src/app/session/[id]/page.tsx` becomes `/session/:id`

The square bracket syntax like `[id]` means a dynamic route parameter.

## 5. Component Architecture

The app separates route files from UI components.

For example:

- route file:
  `src/app/workout/page.tsx`
- UI component:
  `src/components/workout-dashboard.tsx`

Why this matters:

- route files stay small
- components are easier to reuse and reason about
- page-level code stays clean

There are also several `*-shell.tsx` files.

These shell components dynamically load client-side components.

That pattern helps because the app depends on browser-only features like `localStorage`, which do not exist during server rendering.

## 6. Data Model

The source of truth for the app’s types is:

- [src/types/workout.ts](/Users/sanyamsaluja/Documents/WorkoutTracker/src/types/workout.ts)

## Main entities

### WorkoutType

Represents a split such as:

- Push
- Pull
- Legs
- Upper
- Lower

Shape:

```ts
type WorkoutType = {
  id: string;
  name: string;
};
```

### Exercise

Represents one item inside a workout type.

Important fields:

- `workoutTypeId`
- `category`
- `trackingMode`
- `defaultSets`

This is what allows the app to know:

- which workout split an exercise belongs to
- whether it is `main`, `warmup`, `postworkout`, `abs`, `cardio`, or `forearms`
- whether it should be logged with full set data or just a checkbox

### WorkoutSession

Represents one workout on one date.

Important fields:

- `date`
- `workoutTypeId`
- `remarks`

### ExerciseLog

Represents one main-workout exercise logged inside a session.

It stores an array of `setEntries`.

This is more flexible than a single row because each set can behave differently.

### ExerciseSet

This is where the advanced training logic lives.

A set can be:

- `normal`
- `dropset`
- `superset`

It also supports:

- extra dropset entries
- second exercise weight/reps for supersets

### ChecklistLog

Used for support work like:

- pre-workout stretching
- post-workout stretching
- cardio
- abs
- forearms

This is intentionally lightweight.

## 7. Seed Data

The initial starter data is defined in:

- [src/data/workouts.ts](/Users/sanyamsaluja/Documents/WorkoutTracker/src/data/workouts.ts)

This file contains:

- default workout types
- example exercises
- category assignments
- tracking mode assignments

This is useful during development because the app opens with realistic sample structure instead of a blank state.

## 8. Persistence Layer

The storage logic lives in:

- [src/lib/storage.ts](/Users/sanyamsaluja/Documents/WorkoutTracker/src/lib/storage.ts)

## Important functions

### `getInitialData()`

Loads data from `localStorage`.

If there is no saved data yet, it falls back to `initialWorkoutData`.

### `saveData(data)`

Saves the full app state back into `localStorage`.

### Why normalization exists

The storage file also contains normalization and migration logic.

That means older saved data can still work after the schema evolves.

Example:

- older logs may only have simple set data
- newer logs may have dropsets and supersets

Instead of breaking old data, normalization upgrades it into the latest shape.

That is a very important real-world engineering lesson:

When data models evolve, good apps try to migrate old data forward instead of discarding it.

## 9. Workout Setup Flow

The workout setup system is split into two stages.

## Stage 1: create a workout type

Handled in:

- [src/components/workout-type-manager.tsx](/Users/sanyamsaluja/Documents/WorkoutTracker/src/components/workout-type-manager.tsx)

This page lets you:

- add workout types
- rename them
- delete them

When you create a workout type, the app pushes you into its builder page immediately.

That creates a better workflow:

1. create split
2. build split

## Stage 2: build the workout

Handled in:

- [src/components/workout-builder.tsx](/Users/sanyamsaluja/Documents/WorkoutTracker/src/components/workout-builder.tsx)

This page lets you assign exercises into sections like:

- pre-workout
- main workout
- abs
- forearms
- cardio
- post-workout

Design rule:

- `main` exercises use `performance` tracking
- support sections use `checklist` tracking

This is a smart product decision because not everything in training deserves full granular logging.

## 10. Workout Logging Flow

The main workout session experience lives in:

- [src/components/session-view.tsx](/Users/sanyamsaluja/Documents/WorkoutTracker/src/components/session-view.tsx)

This is one of the most important files in the project.

## What happens on the session screen

### Support work

The app loads all checklist-style exercises for that workout type and shows them as grouped checkboxes.

This covers:

- warm-up
- cardio
- abs
- forearms
- post-workout

### Main exercises

The app only allows adding main performance exercises that have not already been logged in that session.

This prevents duplicate normal entries for the same exercise.

### Set templates

When an exercise is chosen, the app creates draft sets using the exercise’s `defaultSets`.

This is why one exercise can start with 2 sets and another can start with 4.

### Dropsets

For a dropset:

- the main set has weight and reps
- extra drop rows appear underneath
- each drop row gets its own reduced weight and reps

This matches actual bodybuilding logging better than treating the whole exercise as one dropset label.

### Supersets

For a superset:

- the main exercise still has its own row
- the second exercise gets its own selector
- the paired exercise has separate weight and reps

This matches how supersets really work in training: two exercises performed one after another.

### Remarks

Each session includes a free-text remarks field.

This is useful for:

- noting technical mistakes
- recording fatigue or pain
- remembering cues for next time

## 11. Review and History

The history view lives in:

- [src/components/history-view.tsx](/Users/sanyamsaluja/Documents/WorkoutTracker/src/components/history-view.tsx)

This page intentionally focuses on `main workout` performance only.

That is a product choice, not an accident.

Why:

- reviewing every warm-up and stretch would create clutter
- the most important comparison is performance progression
- support work matters for compliance, but not for main comparison tables

## Table design

Rows:

- exercises

Columns:

- session dates

Cells:

- set summaries with weight and reps
- superset and dropset details when present

This format makes it easy to answer questions like:

- did my bench press improve?
- was I stronger this week than last week?
- what did I do last time before today?

## 12. Analytics Layer

Analytics helpers live in:

- [src/lib/analytics.ts](/Users/sanyamsaluja/Documents/WorkoutTracker/src/lib/analytics.ts)

These helpers compute things like:

- session logs for a specific session
- sessions for a workout type
- total workout days
- days since last workout
- missed weeks
- weight improvement trends

Why this matters:

You do not want analytics logic scattered across UI components.

Keeping it in a helper layer makes components easier to read and easier to test later.

## 13. Routine Helpers

Routine grouping lives in:

- [src/lib/routine.ts](/Users/sanyamsaluja/Documents/WorkoutTracker/src/lib/routine.ts)

This file helps map raw category codes into human labels like:

- `warmup` -> `Pre-workout`
- `main` -> `Main workout`

It also groups exercises by category for display.

This is a good example of small “domain logic” helpers keeping UI simpler.

## 14. UI and Styling Strategy

All styling is centralized in:

- [src/app/globals.css](/Users/sanyamsaluja/Documents/WorkoutTracker/src/app/globals.css)

## Visual direction

The design uses:

- dark glassmorphism-inspired surfaces
- bright cyan accent color
- high contrast typography
- strong card borders and glows
- larger hero sections and metric cards

## Important UI lesson

The app moved from “just functional” to “emotionally usable” by doing a few things:

1. stronger hierarchy
2. bigger clickable cards
3. less clutter on dashboard pages
4. more expressive session logging visuals
5. separation of setup pages from logging pages

This is a useful product lesson:

People do not fall in love with forms.
They fall in love with momentum, clarity, and feeling in control.

## 15. Why Local State Was Enough

You asked for simple state management and no Redux.

That was a good choice here.

Why `useState` works:

- this is a single-user app
- data volume is small
- most state is page-local
- persistence is simple
- there is no real-time syncing

If the app later grows into:

- multi-device sync
- team sharing
- backend auth
- offline conflict resolution

then a more structured data layer may become useful.

But for now, the simple approach is the right one.

## 16. What You Can Learn From This Project

Here are the biggest lessons hidden inside the build.

## Lesson 1: model the domain honestly

The biggest improvements came from changing the data model to match real training:

- not all exercises are the same
- not all sets are the same
- support work should not pollute performance review

When your data model matches reality, the UI gets easier to design.

## Lesson 2: separate setup from execution

Good apps do not make users configure things while trying to perform a task.

That is why:

- workout setup lives in builder pages
- workout logging lives in session pages
- analytics live on dashboards

## Lesson 3: build with future migration in mind

The normalization logic in storage is important.

Even for small apps, schemas change.
If you expect change early, you avoid painful rewrites later.

## Lesson 4: “minimal” does not mean boring

A minimal app can still feel premium.

Minimal should mean:

- less noise
- stronger priorities
- faster decisions

not:

- plain
- lifeless
- cramped

## 17. Current Limitations

The app is strong as a local MVP, but it still has natural limitations:

- data is only stored in the current browser
- no login system
- no cloud sync
- no import/export flow yet
- no exercise-level chart deep dive yet
- no native Apple Health integration yet

## 18. Good Next Steps

If you want to keep learning by extending the app, these are strong next projects:

### 1. Add export/import

Why:

- teaches file handling
- protects user data
- makes local apps more practical

### 2. Add a backend

For example:

- Supabase
- PostgreSQL
- SQLite with an API layer

Why:

- teaches persistence beyond the browser
- unlocks sign-in and multi-device sync

### 3. Add charts per exercise

Examples:

- bench press weight over time
- squat reps over time
- workout frequency over time

Why:

- teaches derived data and visualization design

### 4. Add authentication

Why:

- teaches protected user data
- useful if the tracker becomes shareable

### 5. Add tests

Good first targets:

- analytics helpers
- storage normalization
- exercise grouping logic

Why:

- teaches confidence and regression safety

## 19. Commands

### Start development

```bash
npm run dev
```

### Run lint

```bash
npm run lint
```

### Create production build

```bash
npm run build
```

### Run production server

```bash
npm run start
```

## 20. Final Mental Model

If you want one simple way to understand the entire app, think of it like this:

- `types/`
  defines the shape of the truth
- `data/`
  gives starter truth
- `storage/`
  loads and saves truth
- `analytics/` and `routine/`
  interpret truth
- `components/`
  display and edit truth
- `app/`
  maps truth to routes

That is the build in one sentence:

The app models training data honestly, stores it simply, and presents it through focused pages that separate setup, logging, and review.
