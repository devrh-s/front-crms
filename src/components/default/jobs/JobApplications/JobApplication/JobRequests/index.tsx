import JobRequestsPage from '@/components/default/jobs/JobRequests/JobRequests';

interface IJobRequests {
  id: number;
  value: string;
  index: string;
}

export default function JobRequests({ id, value, index }: IJobRequests) {
  return value === index && <JobRequestsPage url={`job-applications/${id}/requests`} />;
}
