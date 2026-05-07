"use client";

import dynamic from "next/dynamic";

const WorkoutDashboard = dynamic(
  () => import("@/components/workout-dashboard").then((module) => module.WorkoutDashboard),
  { ssr: false },
);

export function WorkoutDashboardShell() {
  return <WorkoutDashboard />;
}
