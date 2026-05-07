"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getInitialData, saveData } from "@/lib/storage";
import { createId } from "@/lib/utils";
import { WorkoutData } from "@/types/workout";

export function WorkoutTypeManager() {
  const router = useRouter();
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const [newWorkoutTypeName, setNewWorkoutTypeName] = useState("");

  useEffect(() => {
    saveData(data);
  }, [data]);

  function handleWorkoutTypeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newWorkoutTypeName.trim();

    if (!name) {
      return;
    }

    const nextWorkoutTypeId = createId("type");

    setData((current) => ({
      ...current,
      workoutTypes: [...current.workoutTypes, { id: nextWorkoutTypeId, name }],
    }));
    setNewWorkoutTypeName("");
    router.push(`/workout/manage/${nextWorkoutTypeId}`);
  }

  function handleWorkoutTypeUpdate(workoutTypeId: string, name: string) {
    setData((current) => ({
      ...current,
      workoutTypes: current.workoutTypes.map((type) => (type.id === workoutTypeId ? { ...type, name } : type)),
    }));
  }

  function handleWorkoutTypeDelete(workoutTypeId: string) {
    const sessionIds = new Set(data.sessions.filter((session) => session.workoutTypeId === workoutTypeId).map((session) => session.id));
    const exerciseIds = new Set(data.exercises.filter((exercise) => exercise.workoutTypeId === workoutTypeId).map((exercise) => exercise.id));

    setData((current) => ({
      ...current,
      workoutTypes: current.workoutTypes.filter((type) => type.id !== workoutTypeId),
      exercises: current.exercises.filter((exercise) => exercise.workoutTypeId !== workoutTypeId),
      sessions: current.sessions.filter((session) => session.workoutTypeId !== workoutTypeId),
      logs: current.logs.filter((log) => !sessionIds.has(log.workoutSessionId) && !exerciseIds.has(log.exerciseId)),
      checklistLogs: current.checklistLogs.filter(
        (log) => !sessionIds.has(log.workoutSessionId) && !exerciseIds.has(log.exerciseId),
      ),
    }));
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Workout Types</p>
          <h1>Create the splits you actually train.</h1>
        </div>
        <p className="hero-copy">
          Keep the workout dashboard focused on starting sessions and insights. Add, rename, or remove workout types
          from this dedicated setup page.
        </p>
      </section>

      <section className="panel stack-large">
        <div className="session-header">
          <div className="stack-small">
            <p className="section-label">Add Workout Type</p>
            <h2>Open a fresh page for workout setup</h2>
          </div>
          <Link className="text-link" href="/workout">
            Back to workout dashboard
          </Link>
        </div>

        <form className="add-type-form" onSubmit={handleWorkoutTypeSubmit}>
          <label className="field grow-field">
            <span>Workout type name</span>
            <input
              placeholder="Push, Pull, Legs, Upper, Arms..."
              type="text"
              value={newWorkoutTypeName}
              onChange={(event) => setNewWorkoutTypeName(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">
            Add workout type
          </button>
        </form>
      </section>

      <section className="type-grid">
        {data.workoutTypes.map((workoutType) => (
          <article className="panel type-manager-card stack-medium" key={workoutType.id}>
            <div className="stack-small">
              <p className="section-label">Workout Type</p>
              <input
                className="inline-edit-input type-name-input"
                type="text"
                value={workoutType.name}
                onChange={(event) => handleWorkoutTypeUpdate(workoutType.id, event.target.value)}
              />
            </div>
            <div className="card-action-stack">
              <Link className="primary-button secondary-ghost-button" href={`/workout/manage/${workoutType.id}`}>
                Open setup
              </Link>
              <Link className="text-link" href={`/history/${workoutType.id}`}>
                Review sessions
              </Link>
              <button className="danger-button" onClick={() => handleWorkoutTypeDelete(workoutType.id)} type="button">
                Delete workout type
              </button>
            </div>
          </article>
        ))}
      </section>

      {!data.workoutTypes.length ? (
        <section className="panel empty-state-card">
          <p className="empty-state">No workout types yet. Add one and then build the exercise library after that.</p>
        </section>
      ) : null}
    </main>
  );
}
