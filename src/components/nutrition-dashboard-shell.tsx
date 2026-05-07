"use client";

import dynamic from "next/dynamic";

const NutritionDashboard = dynamic(
  () => import("@/components/nutrition-dashboard").then((module) => module.NutritionDashboard),
  { ssr: false },
);

export function NutritionDashboardShell() {
  return <NutritionDashboard />;
}
