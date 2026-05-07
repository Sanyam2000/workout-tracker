"use client";

import dynamic from "next/dynamic";

const SessionView = dynamic(() => import("@/components/session-view").then((module) => module.SessionView), {
  ssr: false,
});

type SessionShellProps = {
  sessionId: string;
};

export function SessionShell({ sessionId }: SessionShellProps) {
  return <SessionView sessionId={sessionId} />;
}
