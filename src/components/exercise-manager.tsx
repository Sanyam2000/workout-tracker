"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { categoryLabels } from "@/lib/routine";
import { getInitialData } from "@/lib/storage";
import { WorkoutData } from "@/types/workout";

export function ExerciseManager() {
  const [data] = useState<WorkoutData>(() => getInitialData());

  const workoutCards = useMemo(
    () =>
      data.workoutTypes.map((workoutType) => {
        const exercises = data.exercises.filter((exercise) => exercise.workoutTypeId === workoutType.id);
        const mainExercises = exercises.filter((exercise) => exercise.category === "main");
        const supportExercises = exercises.filter((exercise) => exercise.category !== "main");

        return {
          ...workoutType,
          totalExercises: exercises.length,
          mainExercises: mainExercises.length,
          supportExercises: supportExercises.length,
          sections: [...new Set(exercises.map((exercise) => categoryLabels[exercise.category]))],
        };
      }),
    [data],
  );

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Manage Workouts</p>
          <h1>Open each split and build it the way you actually train.</h1>
        </div>
        <p className="hero-copy">
          Main workout, pre-workout, post-workout, abs, cardio, and forearms all stay organized under each workout
          type. The dashboard remains for insights and session launch only.
        </p>
      </section>

      <section className="session-header top-nav-row">
        <Link className="text-link" href="/workout">
          Back to workout dashboard
        </Link>
        <Link className="primary-button secondary-ghost-button" href="/workout/types">
          Add workout type
        </Link>
      </section>

      <section className="type-grid">
        {workoutCards.map((workoutType) => (
          <article className="panel type-card-panel workout-card-panel" key={workoutType.id}>
            <div className="stack-medium">
              <div className="stack-small">
                <p className="section-label">Workout Setup</p>
                <h2>{workoutType.name}</h2>
                <p className="section-note">
                  {workoutType.totalExercises} total items • {workoutType.mainExercises} main • {workoutType.supportExercises} support
                </p>
              </div>

              <div className="workout-card-insights">
                <div>
                  <span className="mini-label">Main workout</span>
                  <strong>{workoutType.mainExercises}</strong>
                </div>
                <div>
                  <span className="mini-label">Support work</span>
                  <strong>{workoutType.supportExercises}</strong>
                </div>
                <div>
                  <span className="mini-label">Sections</span>
                  <strong>{workoutType.sections.length || 0}</strong>
                </div>
                <div>
                  <span className="mini-label">Includes</span>
                  <strong>{workoutType.sections.slice(0, 2).join(", ") || "Nothing yet"}</strong>
                </div>
              </div>
            </div>

            <div className="card-action-stack">
              <Link className="primary-button secondary-ghost-button" href={`/workout/manage/${workoutType.id}`}>
                Open setup
              </Link>
            </div>
          </article>
        ))}
      </section>

      {!workoutCards.length ? (
        <section className="panel empty-state-card">
          <p className="empty-state">No workout types yet. Add one first, then come back here to build the exercises inside it.</p>
        </section>
      ) : null}
    </main>
  );
}
