import { SessionShell } from "@/components/session-shell";

type SessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  return <SessionShell sessionId={id} />;
}
