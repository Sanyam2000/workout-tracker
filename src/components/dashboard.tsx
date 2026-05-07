"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getLatestCalories, getLatestWeight } from "@/lib/analytics";
import { getInitialData } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { WorkoutData } from "@/types/workout";

export function Dashboard() {
  const [data] = useState<WorkoutData>(() => getInitialData());

  const latestCalories = useMemo(() => getLatestCalories(data.calorieEntries), [data.calorieEntries]);
  const latestWeight = useMemo(() => getLatestWeight(data.bodyEntries), [data.bodyEntries]);
  const workoutSessions = data.sessions.length;
  const recentWorkout = useMemo(
    () =>
      [...data.sessions]
        .sort((first, second) => second.date.localeCompare(first.date))
        .slice(0, 1)[0],
    [data.sessions],
  );

  const workoutSummary = recentWorkout
    ? `${formatDate(recentWorkout.date)} • ${data.workoutTypes.find((type) => type.id === recentWorkout.workoutTypeId)?.name ?? "Workout"}`
    : "No workouts logged yet";

  const nutritionSummary = latestCalories
    ? `${latestCalories.calories} kcal on ${formatDate(latestCalories.date)}`
    : "No nutrition entries yet";

  const bodySummary = latestWeight
    ? `${latestWeight.weight} kg on ${formatDate(latestWeight.date)}`
    : "No weight entries yet";

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Home</p>
          <h1>Three clear dashboards. One place to keep the whole routine moving.</h1>
        </div>
        <p className="hero-copy">
          Workout, nutrition, and body tracking each have their own space now, so the homepage stays minimal and you
          can get where you need without sifting through every section at once.
        </p>
      </section>

      <section className="home-card-grid">
        <Link className="home-card panel" href="/workout">
          <div className="stack-medium">
            <div className="stack-small">
              <p className="section-label">Workout</p>
              <h2>Log training and review sessions</h2>
            </div>
            <p className="section-note">{workoutSummary}</p>
            <div className="card-kpi-row">
              <strong>{workoutSessions}</strong>
              <span>Total sessions</span>
            </div>
          </div>
        </Link>

        <Link className="home-card panel" href="/nutrition">
          <div className="stack-medium">
            <div className="stack-small">
              <p className="section-label">Nutrition</p>
              <h2>Track calories and macros</h2>
            </div>
            <p className="section-note">{nutritionSummary}</p>
            <div className="card-kpi-row">
              <strong>{data.calorieEntries.length}</strong>
              <span>Logged entries</span>
            </div>
          </div>
        </Link>

        <Link className="home-card panel" href="/body">
          <div className="stack-medium">
            <div className="stack-small">
              <p className="section-label">Body</p>
              <h2>Weight and measurement tracking</h2>
            </div>
            <p className="section-note">{bodySummary}</p>
            <div className="card-kpi-row">
              <strong>{data.measurementEntries.length}</strong>
              <span>Measurement check-ins</span>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
