import StepTemplate from '@/components/default/tasks/StepTemplates/StepTemplate/StepTemplate';

export default async function StepTemplatePage({ params }: { params: { id: number } }) {
  return <StepTemplate id={params.id} />;
}
