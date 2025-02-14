import TaskRequest from '@/components/default/tasks/TaskRequests/TaskRequest/TaskRequest';

export default async function TaskRequestPage({ params }: { params: { id: number } }) {
  return <TaskRequest id={params.id} />;
}
