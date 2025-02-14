import Country from '@/components/default/libraries/Countries/Country/Country';

export default async function CountrysPage({ params }: { params: { id: number } }) {
  return <Country id={params.id} />;
}
