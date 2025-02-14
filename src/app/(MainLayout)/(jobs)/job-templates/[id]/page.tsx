import JobTemplate from '@/components/default/jobs/JobTemplates/JobTemplate/JobTemplate';

export default async function JobTemplatePage({ params }: { params: { id: number } }) {
  return <JobTemplate id={params.id} />;
}
