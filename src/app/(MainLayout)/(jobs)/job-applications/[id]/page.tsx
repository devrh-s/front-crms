import JobApplication from '@/components/default/jobs/JobApplications/JobApplication/JobApplication';

export default async function JobApplicationPage({ params }: { params: { id: string } }) {
  return <JobApplication id={params.id} />;
}
