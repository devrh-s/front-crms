import JobPost from '@/components/default/jobs/JobPosts/JobPost/JobPost';

export default async function JobPostPage({ params }: { params: { id: number } }) {
  return <JobPost id={params.id} />;
}
