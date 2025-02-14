import TaskTemplatePage from '@/components/default/blocks/TaskTemplate/TaskTemplates';

interface IActivities {
  id: number;
  value: string;
  index: string;
}

export default function TaskTemplate({ id, value, index }: IActivities) {
  return value === index && <TaskTemplatePage id={id} template='milestone-templates' />;
}
