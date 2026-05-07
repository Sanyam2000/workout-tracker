"use client";

import dynamic from "next/dynamic";

const HistoryView = dynamic(() => import("@/components/history-view").then((module) => module.HistoryView), {
  ssr: false,
});

type HistoryShellProps = {
  workoutTypeId: string;
};

export function HistoryShell({ workoutTypeId }: HistoryShellProps) {
  return <HistoryView workoutTypeId={workoutTypeId} />;
}
