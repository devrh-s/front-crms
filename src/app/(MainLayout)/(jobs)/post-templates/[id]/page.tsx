import PostTemplate from '@/components/default/jobs/PostTemplates/PostTemplate/PostTemplate';

export default async function PostTemplatePage({ params }: { params: { id: number } }) {
  return <PostTemplate id={params.id} />;
}
