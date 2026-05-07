"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getDaysSinceLastWorkout,
  getWorkoutDaysCount,
  getWorkoutTypeImprovement,
  getWorkoutTypeSessions,
  getMissedWeeksForWorkoutType,
} from "@/lib/analytics";
import { getInitialData, getTodayDate, saveData } from "@/lib/storage";
import { createId, formatDate } from "@/lib/utils";
import { WorkoutData } from "@/types/workout";

export function WorkoutDashboard() {
  const router = useRouter();
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const [sessionDate, setSessionDate] = useState(getTodayDate());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const workoutCards = useMemo(
    () =>
      data.workoutTypes.map((workoutType) => {
        const sessions = getWorkoutTypeSessions(data.sessions, workoutType.id);
        const exercises = data.exercises.filter((exercise) => exercise.workoutTypeId === workoutType.id);

        return {
          ...workoutType,
          sessions,
          exercises,
          daysSinceLast: getDaysSinceLastWorkout(data.sessions, workoutType.id),
          missedWeeks: getMissedWeeksForWorkoutType(data.sessions, workoutType.id),
          improvement: getWorkoutTypeImprovement(data, workoutType.id),
        };
      }),
    [data],
  );

  const workoutDays = useMemo(() => getWorkoutDaysCount(data.sessions), [data.sessions]);
  const activeDaysLast30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    return new Set(
      data.sessions
        .filter((session) => new Date(`${session.date}T00:00:00`) >= cutoff)
        .map((session) => session.date),
    ).size;
  }, [data.sessions]);

  function handleCreateSession(workoutTypeId: string) {
    const session = {
      id: createId("session"),
      workoutTypeId,
      date: sessionDate,
      remarks: "",
    };

    const nextData = {
      ...data,
      sessions: [...data.sessions, session].sort((first, second) => second.date.localeCompare(first.date)),
    };

    setData(nextData);
    saveData(nextData);
    router.push(`/session/${session.id}`);
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Workout Dashboard</p>
          <h1>Start a workout, review the pattern, and keep editing out of the way.</h1>
        </div>
        <p className="hero-copy">
          This screen is now for launching sessions and understanding how consistent your training is, while exercise
          organization lives in its own dedicated manager.
        </p>
      </section>

      <section className="session-header top-nav-row">
        <Link className="text-link" href="/">
          Back to home
        </Link>
        <div className="button-row">
          <Link className="primary-button secondary-ghost-button" href="/workout/types">
            Manage workout types
          </Link>
          <Link className="primary-button secondary-ghost-button" href="/workout/manage">
            Manage workouts
          </Link>
        </div>
      </section>

      <section className="review-metrics">
        <article className="panel metric-panel">
          <p className="section-label">Workout Days</p>
          <h2>{workoutDays}</h2>
          <p className="section-note">Unique days trained</p>
        </article>
        <article className="panel metric-panel">
          <p className="section-label">Last 30 Days</p>
          <h2>{activeDaysLast30}</h2>
          <p className="section-note">Days you actually showed up</p>
        </article>
      </section>

      <section className="panel stack-large spotlight-panel">
        <div className="session-header">
          <div className="stack-small">
            <p className="section-label">Workout Types</p>
            <h2>Card-based split launcher</h2>
          </div>
          <label className="field inline-field">
            <span>Date</span>
            <input type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} />
          </label>
        </div>

        <div className="type-grid">
          {workoutCards.map((workoutType) => (
            <article className="type-card type-card-panel workout-card-panel" key={workoutType.id}>
              <div className="stack-medium">
                <div className="session-header compact-header">
                  <div className="stack-small">
                    <strong>{workoutType.name}</strong>
                    <p>{workoutType.sessions.length} sessions • {workoutType.exercises.length} routine items</p>
                  </div>
                  <span className="type-card-tag">Ready to log</span>
                </div>

                <div className="workout-card-insights">
                  <div>
                    <span className="mini-label">Last done</span>
                    <strong>{workoutType.sessions[0] ? formatDate(workoutType.sessions[0].date) : "Never"}</strong>
                  </div>
                  <div>
                    <span className="mini-label">Days since</span>
                    <strong>{workoutType.daysSinceLast ?? "—"}</strong>
                  </div>
                  <div>
                    <span className="mini-label">Missed weeks</span>
                    <strong>{workoutType.missedWeeks}</strong>
                  </div>
                  <div>
                    <span className="mini-label">Weight trend</span>
                    <strong>
                      {workoutType.improvement === null
                        ? "—"
                        : workoutType.improvement > 0
                          ? `+${workoutType.improvement} kg`
                          : `${workoutType.improvement} kg`}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="card-action-stack">
                <button className="primary-button" onClick={() => handleCreateSession(workoutType.id)} type="button">
                  Start workout
                </button>
                <Link className="text-link" href={`/history/${workoutType.id}`}>
                  Compare sessions
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!workoutCards.length ? (
          <div className="empty-state-card">
            <p className="empty-state">No workout types yet. Create them first, then come back here to launch sessions.</p>
            <Link className="text-link" href="/workout/types">
              Open workout types
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
