import Industry from '@/components/default/libraries/Industries/Industry/Industry';

export default async function IndustryPage({ params }: { params: { id: number } }) {
  return <Industry id={params.id} />;
}
