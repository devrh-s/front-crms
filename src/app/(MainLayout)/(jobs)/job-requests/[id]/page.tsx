import JobRequest from '@/components/default/jobs/JobRequests/JobRequest/JobRequest';

export default async function JobRequestPage({ params }: { params: { id: number } }) {
  return <JobRequest id={params.id} />;
}
