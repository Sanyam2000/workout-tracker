import { WorkoutBuilderShell } from "@/components/workout-builder-shell";

type WorkoutManageDetailPageProps = {
  params: Promise<{
    workoutTypeId: string;
  }>;
};

export default async function WorkoutManageDetailPage({ params }: WorkoutManageDetailPageProps) {
  const { workoutTypeId } = await params;

  return <WorkoutBuilderShell workoutTypeId={workoutTypeId} />;
}
