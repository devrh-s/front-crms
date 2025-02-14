import ProjectTemplate from '@/components/default/tasks/Project Templates/ProjectTemplate/ProjectTemplate';

export default async function ProjectTemplatePage({ params }: { params: { id: number } }) {
  return <ProjectTemplate id={params.id} />;
}
