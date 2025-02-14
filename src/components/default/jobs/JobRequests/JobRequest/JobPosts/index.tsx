import JobPostsPage from '@/components/default/jobs/JobPosts/JobPosts';

interface IJobPosts {
  id: number;
  isDisplayed: boolean;
}

export default function JobPosts({ id, isDisplayed }: IJobPosts) {
  return isDisplayed && <JobPostsPage url={`job-requests/${id}/posts`} />;
}
