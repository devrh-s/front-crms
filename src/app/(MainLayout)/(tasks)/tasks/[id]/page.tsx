import Tasks from '@/components/default/tasks/Tasks/Tasks';

export default async function TaskPage({ params }: { params: { id: number } }) {
  return <Tasks id={params.id} />;
}
