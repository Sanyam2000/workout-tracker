"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { categoryLabels } from "@/lib/routine";
import { getInitialData, saveData } from "@/lib/storage";
import { createId } from "@/lib/utils";
import { Exercise, ExerciseCategory, ExerciseTrackingMode, WorkoutData } from "@/types/workout";

type WorkoutBuilderProps = {
  workoutTypeId: string;
};

type ExerciseDraft = {
  name: string;
  category: ExerciseCategory;
  trackingMode: ExerciseTrackingMode;
  defaultSets: string;
};

function getTrackingModeForCategory(category: ExerciseCategory): ExerciseTrackingMode {
  return category === "main" ? "performance" : "checklist";
}

export function WorkoutBuilder({ workoutTypeId }: WorkoutBuilderProps) {
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseDraft, setExerciseDraft] = useState<ExerciseDraft>({
    name: "",
    category: "main",
    trackingMode: "performance",
    defaultSets: "3",
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const workoutType = useMemo(
    () => data.workoutTypes.find((item) => item.id === workoutTypeId),
    [data.workoutTypes, workoutTypeId],
  );

  const exercises = useMemo(
    () => data.exercises.filter((exercise) => exercise.workoutTypeId === workoutTypeId),
    [data.exercises, workoutTypeId],
  );

  const groupedExercises = useMemo(
    () =>
      Object.entries(categoryLabels).map(([category, label]) => ({
        category: category as ExerciseCategory,
        label,
        exercises: exercises.filter((exercise) => exercise.category === category),
      })),
    [exercises],
  );

  function handleDraftCategoryChange(category: ExerciseCategory) {
    setExerciseDraft((current) => ({
      ...current,
      category,
      trackingMode: getTrackingModeForCategory(category),
      defaultSets: category === "main" ? current.defaultSets || "3" : "1",
    }));
  }

  function handleExerciseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workoutType || !exerciseDraft.name.trim()) {
      return;
    }

    setData((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          id: createId("exercise"),
          name: exerciseDraft.name.trim(),
          workoutTypeId,
          category: exerciseDraft.category,
          trackingMode: exerciseDraft.trackingMode,
          defaultSets: exerciseDraft.category === "main" ? Number(exerciseDraft.defaultSets) : 1,
        },
      ],
    }));

    setExerciseDraft({
      name: "",
      category: exerciseDraft.category,
      trackingMode: getTrackingModeForCategory(exerciseDraft.category),
      defaultSets: exerciseDraft.category === "main" ? exerciseDraft.defaultSets : "3",
    });
  }

  function handleExerciseUpdate(exerciseId: string, field: keyof Exercise, value: string) {
    setData((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (field === "category") {
          const category = value as ExerciseCategory;
          return {
            ...exercise,
            category,
            trackingMode: getTrackingModeForCategory(category),
            defaultSets: category === "main" ? exercise.defaultSets || 3 : 1,
          };
        }

        if (field === "defaultSets") {
          return {
            ...exercise,
            defaultSets: Number(value),
          };
        }

        return {
          ...exercise,
          [field]: value,
        };
      }),
    }));
  }

  function handleExerciseDelete(exerciseId: string) {
    setData((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== exerciseId),
      logs: current.logs.filter((log) => log.exerciseId !== exerciseId),
      checklistLogs: current.checklistLogs.filter((log) => log.exerciseId !== exerciseId),
    }));
  }

  if (!workoutType) {
    return (
      <main className="shell">
        <section className="panel stack-medium">
          <p className="section-label">Workout not found</p>
          <h2>This workout type does not exist anymore.</h2>
          <Link className="text-link" href="/workout/manage">
            Back to manage workouts
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Workout Setup</p>
          <h1>{workoutType.name}</h1>
        </div>
        <p className="hero-copy">
          Build the split properly: main workout items for set and rep logging, plus support sections like pre-workout,
          post-workout, cardio, abs, and forearms for simpler checkbox tracking.
        </p>
      </section>

      <section className="session-header top-nav-row">
        <Link className="text-link" href="/workout/manage">
          Back to manage workouts
        </Link>
        <Link className="primary-button secondary-ghost-button" href="/workout">
          Open workout dashboard
        </Link>
      </section>

      <section className="panel stack-large">
        <div className="stack-small">
          <p className="section-label">Add Exercise</p>
          <h2>Choose where the movement belongs in this workout</h2>
        </div>

        <form className="stack-medium" onSubmit={handleExerciseSubmit}>
          <div className="field-grid manager-grid">
            <label className="field">
              <span>Exercise name</span>
              <input
                placeholder="Bench Press, Lat Pulldown, Chest Stretch..."
                type="text"
                value={exerciseDraft.name}
                onChange={(event) => setExerciseDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label className="field">
              <span>Workout section</span>
              <select
                value={exerciseDraft.category}
                onChange={(event) => handleDraftCategoryChange(event.target.value as ExerciseCategory)}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tracking</span>
              <input disabled type="text" value={exerciseDraft.trackingMode === "performance" ? "Sets / reps / weight" : "Checkbox only"} />
            </label>

            <label className="field">
              <span>Default sets</span>
              <input
                disabled={exerciseDraft.category !== "main"}
                inputMode="numeric"
                min="1"
                step="1"
                type="number"
                value={exerciseDraft.category === "main" ? exerciseDraft.defaultSets : "1"}
                onChange={(event) => setExerciseDraft((current) => ({ ...current, defaultSets: event.target.value }))}
              />
            </label>
          </div>

          <button className="primary-button" type="submit">
            Add to {workoutType.name}
          </button>
        </form>
      </section>

      <section className="library-stack">
        {groupedExercises.map((group) => (
          <section className="library-block" key={group.category}>
            <div className="session-header compact-header">
              <div className="stack-small">
                <p className="section-label">{group.label}</p>
                <h2>
                  {group.category === "main"
                    ? "Main workout"
                    : group.category === "warmup"
                      ? "Pre-workout"
                      : group.label}
                </h2>
              </div>
              <span className="library-pill">{group.exercises.length} exercise(s)</span>
            </div>

            {group.exercises.length ? (
              <div className="exercise-card-grid">
                {group.exercises.map((exercise) => {
                  const isEditing = editingExerciseId === exercise.id;

                  return (
                    <article className="exercise-card" key={exercise.id}>
                      <div className="session-header compact-header">
                        <div className="stack-small">
                          <p className="exercise-card-title">{exercise.name}</p>
                          <div className="exercise-card-meta">
                            <span className="library-pill">
                              {exercise.trackingMode === "performance" ? `${exercise.defaultSets} sets` : "Checkbox"}
                            </span>
                          </div>
                        </div>
                        <button
                          className="small-action-button"
                          onClick={() => setEditingExerciseId((current) => (current === exercise.id ? null : exercise.id))}
                          type="button"
                        >
                          {isEditing ? "Close" : "Edit"}
                        </button>
                      </div>

                      {isEditing ? (
                        <div className="field-grid exercise-card-editor">
                          <label className="field">
                            <span>Name</span>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(event) => handleExerciseUpdate(exercise.id, "name", event.target.value)}
                            />
                          </label>

                          <label className="field">
                            <span>Section</span>
                            <select
                              value={exercise.category}
                              onChange={(event) => handleExerciseUpdate(exercise.id, "category", event.target.value)}
                            >
                              {Object.entries(categoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="field">
                            <span>Tracking</span>
                            <input
                              disabled
                              type="text"
                              value={exercise.trackingMode === "performance" ? "Sets / reps / weight" : "Checkbox only"}
                            />
                          </label>

                          <label className="field">
                            <span>Default sets</span>
                            <input
                              disabled={exercise.category !== "main"}
                              inputMode="numeric"
                              min="1"
                              step="1"
                              type="number"
                              value={exercise.category === "main" ? exercise.defaultSets : 1}
                              onChange={(event) => handleExerciseUpdate(exercise.id, "defaultSets", event.target.value)}
                            />
                          </label>
                        </div>
                      ) : (
                        <p className="section-note">
                          {exercise.category === "main"
                            ? "Shows up in workout logging with sets, reps, weight, dropsets, and supersets."
                            : "Shows up as a checkbox during logging and stays out of the session review table."}
                        </p>
                      )}

                      <button className="danger-button small-danger-button" onClick={() => handleExerciseDelete(exercise.id)} type="button">
                        Delete
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="empty-state">Nothing added here yet.</p>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
