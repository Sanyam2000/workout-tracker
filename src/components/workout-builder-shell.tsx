"use client";

import dynamic from "next/dynamic";

const WorkoutBuilder = dynamic(
  () => import("@/components/workout-builder").then((module) => module.WorkoutBuilder),
  { ssr: false },
);

type WorkoutBuilderShellProps = {
  workoutTypeId: string;
};

export function WorkoutBuilderShell({ workoutTypeId }: WorkoutBuilderShellProps) {
  return <WorkoutBuilder workoutTypeId={workoutTypeId} />;
}
