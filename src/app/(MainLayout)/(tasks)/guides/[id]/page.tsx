import Guide from '@/components/default/tasks/Guides/Guide/Guide';

export default async function GuidePage({ params }: { params: { id: number } }) {
  return <Guide id={params.id} />;
}
