"use client";

import dynamic from "next/dynamic";

const WorkoutTypeManager = dynamic(
  () => import("@/components/workout-type-manager").then((module) => module.WorkoutTypeManager),
  { ssr: false },
);

export function WorkoutTypeManagerShell() {
  return <WorkoutTypeManager />;
}
