import Action from '@/components/default/libraries/Actions/Action/Action';

export default async function ActionPage({ params }: { params: { id: number } }) {
  return <Action id={params.id} />;
}
