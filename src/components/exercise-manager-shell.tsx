"use client";

import dynamic from "next/dynamic";

const ExerciseManager = dynamic(
  () => import("@/components/exercise-manager").then((module) => module.ExerciseManager),
  { ssr: false },
);

export function ExerciseManagerShell() {
  return <ExerciseManager />;
}
