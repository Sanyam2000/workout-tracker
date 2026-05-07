"use client";

import dynamic from "next/dynamic";

const BodyDashboard = dynamic(
  () => import("@/components/body-dashboard").then((module) => module.BodyDashboard),
  { ssr: false },
);

export function BodyDashboardShell() {
  return <BodyDashboard />;
}
