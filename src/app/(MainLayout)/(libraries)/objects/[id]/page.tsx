import Object from '@/components/default/libraries/Objects/Object/Object';

export default async function ObjectPage({ params }: { params: { id: number } }) {
  return <Object id={params.id} />;
}
