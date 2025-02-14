import JobTemplatesPage from '@/components/default/jobs/JobTemplates/JobTemplates';

interface IJobTemplates {
  id: number;
  isDisplayed: boolean;
}

export default function JobTemplates({ id, isDisplayed }: IJobTemplates) {
  return isDisplayed && <JobTemplatesPage url={`job-requests/${id}/templates`} />;
}
