import { Exercise, ExerciseCategory, ExerciseTrackingMode } from "@/types/workout";

export const categoryLabels: Record<ExerciseCategory, string> = {
  warmup: "Pre-workout",
  main: "Main workout",
  abs: "Abs",
  forearms: "Forearms",
  cardio: "Cardio",
  postworkout: "Post-workout",
};

export const trackingModeLabels: Record<ExerciseTrackingMode, string> = {
  performance: "Performance logging",
  checklist: "Checkbox only",
};

export function getCategoryLabel(category: ExerciseCategory) {
  return categoryLabels[category];
}

export function groupExercisesByCategory(exercises: Exercise[]) {
  return Object.entries(categoryLabels).map(([category, label]) => ({
    category: category as ExerciseCategory,
    label,
    exercises: exercises.filter((exercise) => exercise.category === category),
  }));
}
