"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getExerciseName, getSessionLogs, getWorkoutTypeName, getWorkoutTypeSessions } from "@/lib/analytics";
import { getCategoryLabel } from "@/lib/routine";
import { getInitialData } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { Exercise, ExerciseLog, WorkoutData } from "@/types/workout";

type HistoryViewProps = {
  workoutTypeId: string;
};

function getSetLabel(log: ExerciseLog, setIndex: number, exercises: Exercise[]) {
  const setEntry = log.setEntries[setIndex];

  if (setEntry.kind === "dropset") {
    return "DS";
  }

  if (setEntry.kind === "superset") {
    return `SS:${getExerciseName(exercises, setEntry.supersetExerciseId ?? "")}`;
  }

  return `S${setIndex + 1}`;
}

function getCellSummary(log: ExerciseLog | undefined, exercises: Exercise[]) {
  if (!log) {
    return "—";
  }

  return log.setEntries
    .map((entry, index) => {
      const dropSummary =
        entry.kind === "dropset" && entry.dropEntries?.length
          ? ` -> ${entry.dropEntries.map((dropEntry) => `${dropEntry.weight} x ${dropEntry.reps}`).join(" -> ")}`
          : "";

      const supersetSummary =
        entry.kind === "superset" && entry.supersetExerciseId
          ? ` + ${getExerciseName(exercises, entry.supersetExerciseId)} ${entry.supersetWeight ?? 0} x ${entry.supersetReps ?? 0}`
          : "";

      return `${getSetLabel(log, index, exercises)} ${entry.weight} x ${entry.reps}${supersetSummary}${dropSummary}`;
    })
    .join(" | ");
}

export function HistoryView({ workoutTypeId }: HistoryViewProps) {
  const [data] = useState<WorkoutData>(() => getInitialData());

  const sessions = useMemo(() => getWorkoutTypeSessions(data.sessions, workoutTypeId).slice(0, 6), [data.sessions, workoutTypeId]);
  const workoutTypeName = getWorkoutTypeName(data.workoutTypes, workoutTypeId);

  const performanceExerciseRows = useMemo(() => {
    const map = new Map<string, Exercise>();

    sessions.forEach((session) => {
      getSessionLogs(data.logs, session.id).forEach((log) => {
        const exercise = data.exercises.find((item) => item.id === log.exerciseId);

        if (exercise) {
          map.set(exercise.id, exercise);
        }
      });
    });

    return [...map.values()].sort((first, second) => first.name.localeCompare(second.name));
  }, [data.exercises, data.logs, sessions]);

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Workout History</p>
          <h1>{workoutTypeName} table review</h1>
        </div>
        <p className="hero-copy">
          The first column holds every exercise, and each date becomes its own comparison column so reviewing progress
          is quick and systematic.
        </p>
      </section>

      <section className="panel stack-large">
        <div className="session-header">
          <div className="stack-small">
            <p className="section-label">Performance Table</p>
            <h2>Exercises down the side, sessions across the top</h2>
          </div>
          <Link className="text-link" href="/workout">
            Back to workout dashboard
          </Link>
        </div>

        {sessions.length && performanceExerciseRows.length ? (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  {sessions.map((session) => (
                    <th key={session.id}>{formatDate(session.date)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {performanceExerciseRows.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <div className="table-exercise-cell">
                        <strong>{exercise.name}</strong>
                        <span>{getCategoryLabel(exercise.category)}</span>
                      </div>
                    </td>
                    {sessions.map((session) => {
                      const log = getSessionLogs(data.logs, session.id).find((entry) => entry.exerciseId === exercise.id);
                      return <td key={`${exercise.id}-${session.id}`}>{getCellSummary(log, data.exercises)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No performance logs yet for this workout type.</p>
        )}
      </section>

      <section className="panel stack-large">
        <div className="stack-small">
          <p className="section-label">Remarks Review</p>
          <h2>Notes from previous sessions</h2>
        </div>

        <div className="review-section-list">
          {sessions.map((session) => (
            <article className="review-section-card" key={`remark-${session.id}`}>
              <div className="stack-small">
                <p className="section-label">{formatDate(session.date)}</p>
                <h3>{session.remarks ? "Saved notes" : "No notes saved"}</h3>
              </div>
              <p className="section-note">{session.remarks || "You did not leave remarks for this workout."}</p>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
