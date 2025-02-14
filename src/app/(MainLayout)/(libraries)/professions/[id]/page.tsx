import Profession from '@/components/default/libraries/Professions/Profession/Profession';

export default async function ProfessionPage({ params }: { params: { id: number } }) {
  return <Profession id={params.id} />;
}
