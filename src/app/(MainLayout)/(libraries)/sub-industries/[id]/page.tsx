import SubIndustry from '@/components/default/libraries/SubIndustries/SubIndustry/SubIndustry';

export default async function SubIndustryPage({ params }: { params: { id: number } }) {
  return <SubIndustry id={params.id} />;
}
