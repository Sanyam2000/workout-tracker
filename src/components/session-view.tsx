"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getChecklistLogs,
  getExerciseName,
  getSessionLogs,
  getWorkoutTypeName,
  getWorkoutTypeSessions,
} from "@/lib/analytics";
import { getCategoryLabel, groupExercisesByCategory } from "@/lib/routine";
import { getInitialData, saveData } from "@/lib/storage";
import { createId, formatDate } from "@/lib/utils";
import { Exercise, ExerciseLog, WorkoutData } from "@/types/workout";

type SessionViewProps = {
  sessionId: string;
};

type DropEntryDraft = {
  id: string;
  reps: string;
  weight: string;
};

type SetDraft = {
  id: string;
  reps: string;
  weight: string;
  kind: "normal" | "dropset" | "superset";
  supersetExerciseId: string;
  supersetReps: string;
  supersetWeight: string;
  dropEntries: DropEntryDraft[];
};

type LogDraft = {
  exerciseId: string;
  setEntries: SetDraft[];
};

function createSetDrafts(setCount: number): SetDraft[] {
  return Array.from({ length: setCount }, () => ({
    id: createId("draft-set"),
    reps: "10",
    weight: "0",
    kind: "normal",
    supersetExerciseId: "",
    supersetReps: "10",
    supersetWeight: "0",
    dropEntries: [],
  }));
}

function createDraftForExercise(exercise: Exercise | undefined): LogDraft {
  return {
    exerciseId: exercise?.id ?? "",
    setEntries: createSetDrafts(exercise?.defaultSets ?? 3),
  };
}

function getSetSummary(log: ExerciseLog, exercises: Exercise[]) {
  return log.setEntries
    .map((setEntry, index) => {
      const label =
        setEntry.kind === "dropset"
          ? "Dropset"
          : setEntry.kind === "superset"
            ? `Superset with ${getExerciseName(exercises, setEntry.supersetExerciseId ?? "")}`
            : `Set ${index + 1}`;

      const dropSummary =
        setEntry.kind === "dropset" && setEntry.dropEntries?.length
          ? ` -> ${setEntry.dropEntries.map((dropEntry) => `${dropEntry.weight} kg x ${dropEntry.reps}`).join(" -> ")}`
          : "";

      const supersetSummary =
        setEntry.kind === "superset" && setEntry.supersetExerciseId
          ? ` + ${getExerciseName(exercises, setEntry.supersetExerciseId)} ${setEntry.supersetWeight ?? 0} kg x ${setEntry.supersetReps ?? 0}`
          : "";

      return `${label}: ${setEntry.weight} kg x ${setEntry.reps}${supersetSummary}${dropSummary}`;
    })
    .join(" • ");
}

function createDropEntryDraft(): DropEntryDraft {
  return {
    id: createId("draft-drop"),
    reps: "8",
    weight: "0",
  };
}

function parseNumericInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SessionView({ sessionId }: SessionViewProps) {
  const router = useRouter();
  const [data, setData] = useState<WorkoutData>(() => getInitialData());
  const initialSession = data.sessions.find((session) => session.id === sessionId);
  const initialExercises = initialSession
    ? data.exercises.filter((exercise) => exercise.workoutTypeId === initialSession.workoutTypeId)
    : [];
  const initialPerformanceExercises = initialExercises.filter((exercise) => exercise.trackingMode === "performance");
  const initialSessionLogs = initialSession ? getSessionLogs(data.logs, initialSession.id) : [];
  const initialAvailableExercise = initialPerformanceExercises.find(
    (exercise) => !initialSessionLogs.some((log) => log.exerciseId === exercise.id),
  );
  const [draft, setDraft] = useState<LogDraft>(() => createDraftForExercise(initialAvailableExercise));

  useEffect(() => {
    saveData(data);
  }, [data]);

  const currentSession = useMemo(
    () => data.sessions.find((session) => session.id === sessionId),
    [data.sessions, sessionId],
  );

  const exercisesForWorkout = useMemo(() => {
    if (!currentSession) {
      return [];
    }

    return data.exercises.filter((exercise) => exercise.workoutTypeId === currentSession.workoutTypeId);
  }, [currentSession, data.exercises]);

  const performanceExercises = useMemo(
    () => exercisesForWorkout.filter((exercise) => exercise.trackingMode === "performance"),
    [exercisesForWorkout],
  );
  const checklistExercises = useMemo(
    () => exercisesForWorkout.filter((exercise) => exercise.trackingMode === "checklist"),
    [exercisesForWorkout],
  );

  const logsForCurrentSession = useMemo(() => {
    if (!currentSession) {
      return [];
    }

    return getSessionLogs(data.logs, currentSession.id);
  }, [currentSession, data.logs]);

  const checklistLogsForCurrentSession = useMemo(() => {
    if (!currentSession) {
      return [];
    }

    return getChecklistLogs(data.checklistLogs, currentSession.id);
  }, [currentSession, data.checklistLogs]);

  const availablePerformanceExercises = useMemo(() => {
    const loggedExerciseIds = new Set(logsForCurrentSession.map((log) => log.exerciseId));
    return performanceExercises.filter((exercise) => !loggedExerciseIds.has(exercise.id));
  }, [performanceExercises, logsForCurrentSession]);

  const selectedExercise = useMemo(
    () => availablePerformanceExercises.find((exercise) => exercise.id === draft.exerciseId) ?? availablePerformanceExercises[0],
    [availablePerformanceExercises, draft.exerciseId],
  );

  const checklistGroups = useMemo(
    () => groupExercisesByCategory(checklistExercises).filter((group) => group.exercises.length),
    [checklistExercises],
  );

  const completedChecklistIds = useMemo(
    () => new Set(checklistLogsForCurrentSession.map((log) => log.exerciseId)),
    [checklistLogsForCurrentSession],
  );

  const previousSessions = useMemo(() => {
    if (!currentSession) {
      return [];
    }

    return getWorkoutTypeSessions(data.sessions, currentSession.workoutTypeId).filter((session) => session.id !== sessionId);
  }, [currentSession, data.sessions, sessionId]);

  const performanceLogGroups = useMemo(
    () =>
      groupExercisesByCategory(
        logsForCurrentSession
          .map((log) => exercisesForWorkout.find((exercise) => exercise.id === log.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise)),
      ).filter((group) => group.exercises.length),
    [logsForCurrentSession, exercisesForWorkout],
  );

  function handleExerciseChange(exerciseId: string) {
    const exercise = availablePerformanceExercises.find((item) => item.id === exerciseId);
    setDraft(createDraftForExercise(exercise));
  }

  function handleSetChange(
    setId: string,
    field: "reps" | "weight" | "kind" | "supersetExerciseId" | "supersetReps" | "supersetWeight",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      setEntries: current.setEntries.map((setEntry) => {
        if (setEntry.id !== setId) {
          return setEntry;
        }

        if (field === "kind") {
          const nextKind = value as SetDraft["kind"];
          return {
            ...setEntry,
            kind: nextKind,
            supersetExerciseId: nextKind === "superset" ? setEntry.supersetExerciseId : "",
            supersetReps: nextKind === "superset" ? setEntry.supersetReps : "10",
            supersetWeight: nextKind === "superset" ? setEntry.supersetWeight : "0",
            dropEntries:
              nextKind === "dropset"
                ? setEntry.dropEntries.length
                  ? setEntry.dropEntries
                  : [createDropEntryDraft()]
                : [],
          };
        }

        return {
          ...setEntry,
          [field]: value,
        };
      }),
    }));
  }

  function handleAddDropEntry(setId: string) {
    setDraft((current) => ({
      ...current,
      setEntries: current.setEntries.map((setEntry) =>
        setEntry.id === setId
          ? {
              ...setEntry,
              dropEntries: [...setEntry.dropEntries, createDropEntryDraft()],
            }
          : setEntry,
      ),
    }));
  }

  function handleDropEntryChange(
    setId: string,
    dropEntryId: string,
    field: "reps" | "weight",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      setEntries: current.setEntries.map((setEntry) =>
        setEntry.id === setId
          ? {
              ...setEntry,
              dropEntries: setEntry.dropEntries.map((dropEntry) =>
                dropEntry.id === dropEntryId
                  ? {
                      ...dropEntry,
                      [field]: value,
                    }
                  : dropEntry,
              ),
            }
          : setEntry,
      ),
    }));
  }

  function handleRemoveDropEntry(setId: string, dropEntryId: string) {
    setDraft((current) => ({
      ...current,
      setEntries: current.setEntries.map((setEntry) =>
        setEntry.id === setId
          ? {
              ...setEntry,
              dropEntries: setEntry.dropEntries.filter((dropEntry) => dropEntry.id !== dropEntryId),
            }
          : setEntry,
      ),
    }));
  }

  function handleChecklistToggle(exerciseId: string, checked: boolean) {
    if (!currentSession) {
      return;
    }

    if (checked) {
      setData((current) => ({
        ...current,
        checklistLogs: [
          ...current.checklistLogs.filter(
            (log) => !(log.workoutSessionId === currentSession.id && log.exerciseId === exerciseId),
          ),
          {
            id: createId("check"),
            workoutSessionId: currentSession.id,
            exerciseId,
            completed: true,
          },
        ],
      }));
      return;
    }

    setData((current) => ({
      ...current,
      checklistLogs: current.checklistLogs.filter(
        (log) => !(log.workoutSessionId === currentSession.id && log.exerciseId === exerciseId),
      ),
    }));
  }

  function handleAddLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentSession || !selectedExercise) {
      return;
    }

    const log: ExerciseLog = {
      id: createId("log"),
      workoutSessionId: currentSession.id,
      exerciseId: selectedExercise.id,
        setEntries: draft.setEntries.map((setEntry) => ({
        id: createId("set"),
        reps: parseNumericInput(setEntry.reps),
        weight: parseNumericInput(setEntry.weight),
        kind: setEntry.kind,
        supersetExerciseId: setEntry.kind === "superset" ? setEntry.supersetExerciseId : undefined,
        supersetReps: setEntry.kind === "superset" ? parseNumericInput(setEntry.supersetReps) : undefined,
        supersetWeight: setEntry.kind === "superset" ? parseNumericInput(setEntry.supersetWeight) : undefined,
        dropEntries:
          setEntry.kind === "dropset"
            ? setEntry.dropEntries.map((dropEntry) => ({
                id: createId("drop"),
                reps: parseNumericInput(dropEntry.reps),
                weight: parseNumericInput(dropEntry.weight),
              }))
            : [],
      })),
    };

    const nextLogs = [log, ...data.logs];
    const nextLoggedExerciseIds = new Set(
      nextLogs.filter((entry) => entry.workoutSessionId === currentSession.id).map((entry) => entry.exerciseId),
    );
    const nextAvailableExercise = performanceExercises.find((exercise) => !nextLoggedExerciseIds.has(exercise.id));

    setData((current) => ({
      ...current,
      logs: [log, ...current.logs],
    }));

    setDraft(createDraftForExercise(nextAvailableExercise));
  }

  function handleRemarksChange(value: string) {
    setData((current) => ({
      ...current,
      sessions: current.sessions.map((session) => (session.id === sessionId ? { ...session, remarks: value } : session)),
    }));
  }

  if (!currentSession) {
    return (
      <main className="shell">
        <section className="panel stack-medium">
          <p className="section-label">Session not found</p>
          <h2>This workout session does not exist anymore.</h2>
          <Link className="primary-button secondary-button" href="/">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="shell stack-xl">
      <section className="hero slim-hero">
        <div className="stack-small">
          <p className="eyebrow">Workout session</p>
          <h1>
            {getWorkoutTypeName(data.workoutTypes, currentSession.workoutTypeId)} on {formatDate(currentSession.date)}
          </h1>
        </div>
        <p className="hero-copy">
          Main lifts stay detailed, while warm-up, cardio, abs, forearms, and post-work are tracked separately so the
          session feels organized instead of mashed together.
        </p>
        <div className="session-hero-strip">
          <span className="hero-chip">Live logging</span>
          <span className="hero-chip">{logsForCurrentSession.length} main lifts logged</span>
          <span className="hero-chip">{checklistLogsForCurrentSession.length} support items done</span>
        </div>
      </section>

      <section className="review-metrics">
        <article className="panel metric-panel spotlight-metric">
          <p className="section-label">Main Work</p>
          <h2>{logsForCurrentSession.length}</h2>
          <p className="section-note">Performance exercises logged</p>
        </article>
        <article className="panel metric-panel spotlight-metric success-metric">
          <p className="section-label">Routine Items</p>
          <h2>{checklistLogsForCurrentSession.length}</h2>
          <p className="section-note">Warm-up / cardio / recovery items completed</p>
        </article>
      </section>

      <section className="session-layout stacked-layout">
        <article className="panel stack-large">
          <div className="session-header">
            <div className="stack-small">
              <p className="section-label">Routine checklist</p>
              <h2>Tick off support work cleanly</h2>
            </div>
            <div className="action-row">
              <button className="primary-button" onClick={() => router.push("/")} type="button">
                Save workout
              </button>
              <Link className="text-link" href="/">
                Back to home
              </Link>
            </div>
          </div>

          {checklistGroups.length ? (
            <div className="routine-group-list">
              {checklistGroups.map((group) => (
                <article className="routine-group-card" key={group.category}>
                  <div className="stack-small">
                    <p className="section-label">{group.label}</p>
                    <h3>{group.exercises.length} item(s)</h3>
                  </div>
                  <div className="checklist-list">
                    {group.exercises.map((exercise) => (
                      <label className="check-item" key={exercise.id}>
                        <input
                          checked={completedChecklistIds.has(exercise.id)}
                          onChange={(event) => handleChecklistToggle(exercise.id, event.target.checked)}
                          type="checkbox"
                        />
                        <span>{exercise.name}</span>
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No checklist-based routine items for this workout type yet.</p>
          )}

          <div className="stack-small">
            <p className="section-label">Remarks</p>
            <textarea
              className="remarks-input"
              placeholder="What felt off, what to fix next time, cues to remember..."
              value={currentSession.remarks}
              onChange={(event) => handleRemarksChange(event.target.value)}
            />
          </div>
        </article>

        <article className="panel stack-large logging-panel">
          <div className="stack-small">
            <p className="section-label">Main lifts</p>
            <h2>Add performance exercise</h2>
          </div>

          <form className="stack-medium" onSubmit={handleAddLog}>
            {availablePerformanceExercises.length ? (
              <>
                <label className="field">
                  <span>Exercise</span>
                  <select value={draft.exerciseId} onChange={(event) => handleExerciseChange(event.target.value)}>
                    {availablePerformanceExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="quick-picks">
                  {availablePerformanceExercises.slice(0, 5).map((exercise) => (
                    <button
                      className={`chip-button ${draft.exerciseId === exercise.id ? "active" : ""}`}
                      key={exercise.id}
                      onClick={() => handleExerciseChange(exercise.id)}
                      type="button"
                    >
                      {exercise.name}
                    </button>
                  ))}
                </div>

                <div className="set-header">
                  <p className="section-note">
                    {selectedExercise
                      ? `${selectedExercise.defaultSets} set template from exercise library`
                      : "Choose an exercise"}
                  </p>
                </div>

                {selectedExercise ? (
                  <article className="selected-exercise-card">
                    <div className="stack-small">
                      <p className="section-label">Locked In</p>
                      <h3>{selectedExercise.name}</h3>
                    </div>
                    <div className="selected-exercise-meta">
                      <span className="hero-chip">{selectedExercise.defaultSets} planned sets</span>
                      <span className="hero-chip">Main workout focus</span>
                    </div>
                  </article>
                ) : null}

                <div className="set-entry-list">
                  {draft.setEntries.map((setEntry, index) => (
                    <article className={`set-entry-card set-entry-card-${setEntry.kind}`} key={setEntry.id}>
                      <div className="set-entry-title set-entry-header">
                        <div className="stack-small">
                          <strong>Set {index + 1}</strong>
                          <span className={`set-kind-badge set-kind-${setEntry.kind}`}>
                            {setEntry.kind === "normal"
                              ? "Standard set"
                              : setEntry.kind === "dropset"
                                ? "Dropset flow"
                                : "Superset pair"}
                          </span>
                        </div>
                      </div>

                      <div className="field-grid set-grid">
                        <label className="field">
                          <span>Set type</span>
                          <select
                            value={setEntry.kind}
                            onChange={(event) => handleSetChange(setEntry.id, "kind", event.target.value)}
                          >
                            <option value="normal">Normal</option>
                            <option value="dropset">Dropset</option>
                            <option value="superset">Superset</option>
                          </select>
                        </label>

                        {setEntry.kind === "superset" ? (
                          <label className="field">
                            <span>Superset exercise</span>
                            <select
                              value={setEntry.supersetExerciseId}
                              onChange={(event) =>
                                handleSetChange(setEntry.id, "supersetExerciseId", event.target.value)
                              }
                            >
                              <option value="">Choose paired exercise</option>
                              {performanceExercises
                                .filter((exercise) => exercise.id !== draft.exerciseId)
                                .map((exercise) => (
                                  <option key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ) : null}

                        <label className="field">
                          <span>Weight</span>
                          <input
                            inputMode="decimal"
                            placeholder="0"
                            type="text"
                            value={setEntry.weight}
                            onChange={(event) => handleSetChange(setEntry.id, "weight", event.target.value)}
                          />
                        </label>

                        <label className="field">
                          <span>Reps</span>
                          <input
                            inputMode="numeric"
                            placeholder="10"
                            type="text"
                            value={setEntry.reps}
                            onChange={(event) => handleSetChange(setEntry.id, "reps", event.target.value)}
                          />
                        </label>
                      </div>

                      {setEntry.kind === "superset" ? (
                        <div className="stack-medium dropset-block">
                          <div className="stack-small">
                            <p className="section-label">Superset Pair</p>
                            <p className="section-note">Choose the second exercise and log its own weight and reps.</p>
                          </div>

                          <div className="field-grid superset-grid">
                            <label className="field superset-grid-full">
                              <span>Second exercise</span>
                              <select
                                value={setEntry.supersetExerciseId}
                                onChange={(event) =>
                                  handleSetChange(setEntry.id, "supersetExerciseId", event.target.value)
                                }
                              >
                                <option value="">Choose paired exercise</option>
                                {performanceExercises
                                  .filter((exercise) => exercise.id !== draft.exerciseId)
                                  .map((exercise) => (
                                    <option key={exercise.id} value={exercise.id}>
                                      {exercise.name}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <label className="field">
                              <span>Second weight</span>
                              <input
                                inputMode="decimal"
                                placeholder="0"
                                type="text"
                                value={setEntry.supersetWeight}
                                onChange={(event) => handleSetChange(setEntry.id, "supersetWeight", event.target.value)}
                              />
                            </label>

                            <label className="field">
                              <span>Second reps</span>
                              <input
                                inputMode="numeric"
                                placeholder="10"
                                type="text"
                                value={setEntry.supersetReps}
                                onChange={(event) => handleSetChange(setEntry.id, "supersetReps", event.target.value)}
                              />
                            </label>
                          </div>
                        </div>
                      ) : null}

                      {setEntry.kind === "dropset" ? (
                        <div className="stack-medium dropset-block">
                          <div className="session-header compact-header">
                            <div className="stack-small">
                              <p className="section-label">Drops</p>
                              <p className="section-note">Add each reduced weight and the reps you got with it.</p>
                            </div>
                            <button
                              className="chip-button"
                              onClick={() => handleAddDropEntry(setEntry.id)}
                              type="button"
                            >
                              Add drop
                            </button>
                          </div>

                          <div className="set-entry-list">
                            {setEntry.dropEntries.map((dropEntry, dropIndex) => (
                              <article className="drop-entry-card" key={dropEntry.id}>
                                <div className="session-header compact-header">
                                  <strong>Drop {dropIndex + 1}</strong>
                                  {setEntry.dropEntries.length > 1 ? (
                                    <button
                                      className="danger-button ghost-danger-button"
                                      onClick={() => handleRemoveDropEntry(setEntry.id, dropEntry.id)}
                                      type="button"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>

                                <div className="field-grid two-up">
                                  <label className="field">
                                    <span>Weight</span>
                                    <input
                                      inputMode="decimal"
                                      placeholder="0"
                                      type="text"
                                      value={dropEntry.weight}
                                      onChange={(event) =>
                                        handleDropEntryChange(setEntry.id, dropEntry.id, "weight", event.target.value)
                                      }
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Reps</span>
                                    <input
                                      inputMode="numeric"
                                      placeholder="8"
                                      type="text"
                                      value={dropEntry.reps}
                                      onChange={(event) =>
                                        handleDropEntryChange(setEntry.id, dropEntry.id, "reps", event.target.value)
                                      }
                                    />
                                  </label>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>

                <button className="primary-button log-cta-button" type="submit">
                  Add exercise entry
                </button>
              </>
            ) : (
              <p className="empty-state">All main lift exercises for this workout have been logged already.</p>
            )}
          </form>
        </article>

        <article className="panel stack-large">
          <div className="stack-small">
            <p className="section-label">Current review</p>
            <h2>Session progress, grouped properly</h2>
          </div>

          {performanceLogGroups.length ? (
            <div className="review-section-list">
              {performanceLogGroups.map((group) => (
                <article className="review-section-card" key={group.category}>
                  <div className="stack-small">
                    <p className="section-label">{getCategoryLabel(group.category)}</p>
                    <h3>{group.exercises.length} logged exercise(s)</h3>
                  </div>
                  <div className="log-list">
                    {logsForCurrentSession
                      .filter((log) => group.exercises.some((exercise) => exercise.id === log.exerciseId))
                      .map((log) => (
                        <article className="log-card log-card-expanded" key={log.id}>
                          <div>
                            <h3>{getExerciseName(data.exercises, log.exerciseId)}</h3>
                            <p>{log.setEntries.length} sets logged</p>
                          </div>
                          <strong>{getSetSummary(log, data.exercises)}</strong>
                        </article>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No performance exercises logged yet.</p>
          )}

          {checklistGroups.length ? (
            <div className="review-section-list">
              {checklistGroups.map((group) => {
                const completed = group.exercises.filter((exercise) => completedChecklistIds.has(exercise.id));

                if (!completed.length) {
                  return null;
                }

                return (
                  <article className="review-section-card" key={`completed-${group.category}`}>
                    <div className="stack-small">
                      <p className="section-label">{group.label}</p>
                      <h3>{completed.length} completed item(s)</h3>
                    </div>
                    <div className="tag-list">
                      {completed.map((exercise) => (
                        <span className="tag-item" key={exercise.id}>
                          {exercise.name}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </article>

        <article className="panel stack-medium">
          <div className="stack-small">
            <p className="section-label">Past sessions</p>
            <h2>Previous dates for this split</h2>
          </div>

          {previousSessions.length ? (
            <div className="past-session-list">
              {previousSessions.map((session) => (
                <Link className="past-session-link" href={`/session/${session.id}`} key={session.id}>
                  {formatDate(session.date)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">Older sessions for this workout type will show here.</p>
          )}
        </article>
      </section>
    </main>
  );
}
