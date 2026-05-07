# Workout Tracker

A dark, mobile-friendly workout tracker built with Next.js, React, TypeScript, and browser local storage.

The app is organized around three dashboards:

- `Workout`
- `Nutrition`
- `Body`

The workout flow is the core experience:

- create workout types
- build each workout type separately
- log main lifts with sets, reps, weight
- track support work like pre-workout and post-workout as checkboxes
- review past main workouts in a comparison table

## Tech Stack

- `Next.js 16` with App Router
- `React 19`
- `TypeScript`
- `ESLint`
- `CSS` via a single global stylesheet
- `localStorage` for persistence

## Main Features

- Dashboard hub for workout, nutrition, and body tracking
- Workout type management
- Separate workout builder for each split
- Main workout logging with:
  - normal sets
  - dropsets
  - supersets
- Support routine logging with checkboxes:
  - pre-workout
  - post-workout
  - abs
  - cardio
  - forearms
- Session remarks
- Workout history comparison by date
- Nutrition tracking:
  - calories
  - protein
  - carbs
  - fats
  - fiber
- Body tracking:
  - weight
  - body fat
  - measurements

## Routes

- `/`:
  Main dashboard hub
- `/workout`:
  Workout insights and launch screen
- `/workout/types`:
  Create, rename, and delete workout types
- `/workout/manage`:
  Workout setup overview
- `/workout/manage/[workoutTypeId]`:
  Build one workout type in detail
- `/session/[id]`:
  Log an active workout session
- `/history/[workoutTypeId]`:
  Review previous main workout sessions in table form
- `/nutrition`:
  Nutrition dashboard
- `/body`:
  Bodyweight and body measurement dashboard

## Project Structure

```text
.
├── README.md
├── docs
│   └── BUILD_GUIDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── src
│   ├── app
│   │   ├── body/page.tsx
│   │   ├── globals.css
│   │   ├── history/[workoutTypeId]/page.tsx
│   │   ├── layout.tsx
│   │   ├── nutrition/page.tsx
│   │   ├── page.tsx
│   │   ├── session/[id]/page.tsx
│   │   └── workout
│   │       ├── manage/[workoutTypeId]/page.tsx
│   │       ├── manage/page.tsx
│   │       ├── page.tsx
│   │       └── types/page.tsx
│   ├── components
│   │   ├── body-dashboard.tsx
│   │   ├── chart-card.tsx
│   │   ├── dashboard.tsx
│   │   ├── exercise-manager.tsx
│   │   ├── history-view.tsx
│   │   ├── nutrition-dashboard.tsx
│   │   ├── session-view.tsx
│   │   ├── workout-builder.tsx
│   │   ├── workout-dashboard.tsx
│   │   └── workout-type-manager.tsx
│   ├── data
│   │   └── workouts.ts
│   ├── lib
│   │   ├── analytics.ts
│   │   ├── routine.ts
│   │   ├── storage.ts
│   │   └── utils.ts
│   └── types
│       └── workout.ts
└── tsconfig.json
```

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production

```bash
npm run build
npm run start
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Data Storage

All user data is currently stored in browser `localStorage`.

That means:

- no backend is required
- data is device/browser-specific
- refreshing the page does not lose data
- clearing browser storage will remove saved entries

## Learn More

For a full end-to-end explanation of how the app is built, read:

- [docs/BUILD_GUIDE.md](/Users/sanyamsaluja/Documents/WorkoutTracker/docs/BUILD_GUIDE.md)
# workout-tracker
