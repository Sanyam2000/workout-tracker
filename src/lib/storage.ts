import { initialWorkoutData } from "@/data/workouts";
import { ChecklistLog, Exercise, ExerciseLog, ExerciseSet, WorkoutData, WorkoutSession } from "@/types/workout";

const STORAGE_KEY = "workout-tracker-data";

function normalizeExercises(exercises: Exercise[]) {
  return exercises.map((exercise) => ({
    ...exercise,
    defaultSets: exercise.defaultSets ?? 3,
    category: exercise.category ?? "main",
    trackingMode: exercise.trackingMode ?? "performance",
  }));
}

type LegacyExerciseLog = Partial<ExerciseLog> & {
  sets?: number;
  reps?: number;
  weight?: number;
};

function createLegacySetEntries(log: LegacyExerciseLog): ExerciseSet[] {
  const setCount = Math.max(log.sets ?? 1, 1);

  return Array.from({ length: setCount }, (_, index) => ({
    id: `legacy-set-${index + 1}`,
    reps: log.reps ?? 0,
    weight: log.weight ?? 0,
    kind: "normal",
  }));
}

function normalizeLogs(logs: LegacyExerciseLog[]): ExerciseLog[] {
  return logs.map((log, index) => ({
    id: log.id ?? `migrated-log-${index + 1}`,
    workoutSessionId: log.workoutSessionId ?? "",
    exerciseId: log.exerciseId ?? "",
    setEntries: log.setEntries?.length
      ? log.setEntries.map((setEntry, setIndex) => ({
          id: setEntry.id ?? `migrated-set-${index + 1}-${setIndex + 1}`,
          reps: setEntry.reps,
          weight: setEntry.weight,
          kind: setEntry.kind ?? "normal",
          supersetExerciseId: setEntry.supersetExerciseId,
          supersetReps: setEntry.supersetReps,
          supersetWeight: setEntry.supersetWeight,
          dropEntries:
            setEntry.dropEntries?.map((dropEntry, dropIndex) => ({
              id: dropEntry.id ?? `migrated-drop-${index + 1}-${setIndex + 1}-${dropIndex + 1}`,
              reps: dropEntry.reps,
              weight: dropEntry.weight,
            })) ?? [],
        }))
      : createLegacySetEntries(log),
  }));
}

function normalizeChecklistLogs(checklistLogs: ChecklistLog[]) {
  return checklistLogs.map((log, index) => ({
    id: log.id ?? `migrated-check-${index + 1}`,
    workoutSessionId: log.workoutSessionId ?? "",
    exerciseId: log.exerciseId ?? "",
    completed: log.completed ?? true,
  }));
}

export function getInitialData(): WorkoutData {
  if (typeof window === "undefined") {
    return initialWorkoutData;
  }

  const rawData = window.localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    return initialWorkoutData;
  }

  try {
    const parsedData = JSON.parse(rawData) as WorkoutData;

    return {
      workoutTypes: parsedData.workoutTypes?.length ? parsedData.workoutTypes : initialWorkoutData.workoutTypes,
      exercises: normalizeExercises(parsedData.exercises?.length ? parsedData.exercises : initialWorkoutData.exercises),
      sessions: (parsedData.sessions ?? []).map((session) => ({
        ...session,
        remarks: session.remarks ?? "",
      })),
      logs: normalizeLogs(parsedData.logs ?? []),
      checklistLogs: normalizeChecklistLogs(parsedData.checklistLogs ?? []),
      calorieEntries:
        parsedData.calorieEntries?.map((entry) => ({
          ...entry,
          protein: entry.protein ?? 0,
          carbs: entry.carbs ?? 0,
          fats: entry.fats ?? 0,
          fiber: entry.fiber ?? 0,
        })) ?? [],
      bodyEntries: parsedData.bodyEntries ?? [],
      measurementEntries: parsedData.measurementEntries ?? [],
    };
  } catch {
    return initialWorkoutData;
  }
}

export function saveData(data: WorkoutData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function sortSessionsByDateDesc(sessions: WorkoutSession[]) {
  return [...sessions].sort((first, second) => second.date.localeCompare(first.date));
}
