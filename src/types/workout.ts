export type ExerciseCategory =
  | "warmup"
  | "main"
  | "abs"
  | "forearms"
  | "cardio"
  | "postworkout";

export type ExerciseTrackingMode = "performance" | "checklist";

export type WorkoutType = {
  id: string;
  name: string;
};

export type Exercise = {
  id: string;
  name: string;
  workoutTypeId: string;
  defaultSets: number;
  category: ExerciseCategory;
  trackingMode: ExerciseTrackingMode;
};

export type WorkoutSession = {
  id: string;
  date: string;
  workoutTypeId: string;
  remarks: string;
};

export type ExerciseSet = {
  id: string;
  reps: number;
  weight: number;
  kind?: "normal" | "dropset" | "superset";
  supersetExerciseId?: string;
  supersetReps?: number;
  supersetWeight?: number;
  dropEntries?: {
    id: string;
    reps: number;
    weight: number;
  }[];
};

export type ExerciseLog = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  setEntries: ExerciseSet[];
};

export type ChecklistLog = {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  completed: boolean;
};

export type CalorieEntry = {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export type BodyEntry = {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
};

export type BodyMeasurementEntry = {
  id: string;
  date: string;
  chest?: number;
  waist?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
};

export type WorkoutData = {
  workoutTypes: WorkoutType[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  logs: ExerciseLog[];
  checklistLogs: ChecklistLog[];
  calorieEntries: CalorieEntry[];
  bodyEntries: BodyEntry[];
  measurementEntries: BodyMeasurementEntry[];
};
