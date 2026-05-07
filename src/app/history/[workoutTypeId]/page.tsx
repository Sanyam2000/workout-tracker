import { HistoryShell } from "@/components/history-shell";

type HistoryPageProps = {
  params: Promise<{
    workoutTypeId: string;
  }>;
};

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { workoutTypeId } = await params;

  return <HistoryShell workoutTypeId={workoutTypeId} />;
}
