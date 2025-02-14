import TaskTemplate from '@/components/default/tasks/TaskTemplates/TaskTemplate/TaskTemplate';

export default async function TaskTemplatePage({ params }: { params: { id: number } }) {
  return <TaskTemplate id={params.id} />;
}
