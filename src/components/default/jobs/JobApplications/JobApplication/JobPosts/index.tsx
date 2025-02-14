import JobPostsPage from '@/components/default/jobs/JobPosts/JobPosts';

interface IJobPosts {
  id: number;
  value: string;
  index: string;
}

export default function JobPosts({ id, value, index }: IJobPosts) {
  return value === index && <JobPostsPage url={`job-applications/${id}/posts`} />;
}
