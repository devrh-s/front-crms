import MilestoneTemplate from '@/components/default/tasks/Milestone Templates/MilestoneTemplate/MilestoneTemplate';

export default async function MilestoneTemplatePage({ params }: { params: { id: number } }) {
  return <MilestoneTemplate id={params.id} />;
}
