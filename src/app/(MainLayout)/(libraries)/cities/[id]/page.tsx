import City from '@/components/default/libraries/Cities/City/City';

export default async function CityPage({ params }: { params: { id: number } }) {
  return <City id={params.id} />;
}
