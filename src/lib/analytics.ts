import {
  BodyEntry,
  CalorieEntry,
  ChecklistLog,
  Exercise,
  ExerciseLog,
  WorkoutData,
  WorkoutSession,
  WorkoutType,
} from "@/types/workout";

export type BarPoint = {
  label: string;
  value: number;
};

export function getSessionLogs(logs: ExerciseLog[], sessionId: string) {
  return logs.filter((log) => log.workoutSessionId === sessionId);
}

export function getSessionVolume(logs: ExerciseLog[]) {
  return logs.reduce(
    (total, log) =>
      total +
      log.setEntries.reduce((setTotal, setEntry) => setTotal + setEntry.reps * setEntry.weight, 0),
    0,
  );
}

export function getWorkoutTypeName(workoutTypes: WorkoutType[], workoutTypeId: string) {
  return workoutTypes.find((workoutType) => workoutType.id === workoutTypeId)?.name ?? "Workout";
}

export function getExerciseName(exercises: Exercise[], exerciseId: string) {
  return exercises.find((exercise) => exercise.id === exerciseId)?.name ?? "Exercise";
}

export function getRecentSessionVolume(data: WorkoutData, limit = 6): BarPoint[] {
  return [...data.sessions]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(-limit)
    .map((session) => ({
      label: session.date.slice(5),
      value: getSessionVolume(getSessionLogs(data.logs, session.id)),
    }));
}

export function getBodyWeightTrend(bodyEntries: BodyEntry[], limit = 7): BarPoint[] {
  return [...bodyEntries]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(-limit)
    .map((entry) => ({
      label: entry.date.slice(5),
      value: entry.weight,
    }));
}

export function getCalorieTrend(calorieEntries: CalorieEntry[], limit = 7): BarPoint[] {
  return [...calorieEntries]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(-limit)
    .map((entry) => ({
      label: entry.date.slice(5),
      value: entry.calories,
    }));
}

export function getLatestWeight(bodyEntries: BodyEntry[]) {
  return [...bodyEntries].sort((first, second) => second.date.localeCompare(first.date))[0];
}

export function getLatestCalories(calorieEntries: CalorieEntry[]) {
  return [...calorieEntries].sort((first, second) => second.date.localeCompare(first.date))[0];
}

export function getWeeklyAverageCalories(calorieEntries: CalorieEntry[]) {
  const recent = [...calorieEntries].sort((first, second) => second.date.localeCompare(first.date)).slice(0, 7);

  if (!recent.length) {
    return 0;
  }

  return Math.round(recent.reduce((total, entry) => total + entry.calories, 0) / recent.length);
}

export function getBestLift(data: WorkoutData) {
  const heaviest = data.logs
    .flatMap((log) =>
      log.setEntries.map((setEntry) => ({
        exerciseId: log.exerciseId,
        reps: setEntry.reps,
        weight: setEntry.weight,
      })),
    )
    .sort((first, second) => second.weight - first.weight)[0];

  if (!heaviest) {
    return null;
  }

  return {
    exerciseName: getExerciseName(data.exercises, heaviest.exerciseId),
    weight: heaviest.weight,
    reps: heaviest.reps,
  };
}

export function getWorkoutTypeSessions(sessions: WorkoutSession[], workoutTypeId: string) {
  return [...sessions]
    .filter((session) => session.workoutTypeId === workoutTypeId)
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function getChecklistLogs(checklistLogs: ChecklistLog[], sessionId: string) {
  return checklistLogs.filter((log) => log.workoutSessionId === sessionId && log.completed);
}

export function getWorkoutDaysCount(sessions: WorkoutSession[]) {
  return new Set(sessions.map((session) => session.date)).size;
}

export function getDaysSinceLastWorkout(sessions: WorkoutSession[], workoutTypeId: string) {
  const latest = getWorkoutTypeSessions(sessions, workoutTypeId)[0];

  if (!latest) {
    return null;
  }

  const today = new Date();
  const workoutDate = new Date(`${latest.date}T00:00:00`);
  const diffMs = today.getTime() - workoutDate.getTime();

  return Math.max(Math.floor(diffMs / 86400000), 0);
}

export function getMissedWeeksForWorkoutType(sessions: WorkoutSession[], workoutTypeId: string) {
  const typeSessions = getWorkoutTypeSessions(sessions, workoutTypeId);

  if (!typeSessions.length) {
    return 0;
  }

  const weekKeys = new Set(
    typeSessions.map((session) => {
      const date = new Date(`${session.date}T00:00:00`);
      const start = new Date(date.getFullYear(), 0, 1);
      const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000);
      const week = Math.floor((dayOffset + start.getDay()) / 7);
      return `${date.getFullYear()}-${week}`;
    }),
  );

  const firstDate = new Date(`${typeSessions[typeSessions.length - 1].date}T00:00:00`);
  const latestDate = new Date(`${typeSessions[0].date}T00:00:00`);
  const totalWeeks = Math.max(Math.floor((latestDate.getTime() - firstDate.getTime()) / (86400000 * 7)) + 1, 1);

  return Math.max(totalWeeks - weekKeys.size, 0);
}

export function getWorkoutTypeImprovement(data: WorkoutData, workoutTypeId: string) {
  const sessions = getWorkoutTypeSessions(data.sessions, workoutTypeId);

  if (sessions.length < 2) {
    return null;
  }

  const firstSessionLogs = getSessionLogs(data.logs, sessions[sessions.length - 1].id);
  const latestSessionLogs = getSessionLogs(data.logs, sessions[0].id);
  const firstMax = Math.max(
    ...firstSessionLogs.flatMap((log) => log.setEntries.map((setEntry) => setEntry.weight)),
    0,
  );
  const latestMax = Math.max(
    ...latestSessionLogs.flatMap((log) => log.setEntries.map((setEntry) => setEntry.weight)),
    0,
  );

  return latestMax - firstMax;
}
