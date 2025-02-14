import Project from '@/components/default/tasks/Projects/Project/Project';

export default async function ProjectPage({ params }: { params: { id: number } }) {
  return <Project id={params.id} />;
}
