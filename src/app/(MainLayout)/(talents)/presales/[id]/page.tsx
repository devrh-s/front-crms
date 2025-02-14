import PresalesProfile from '@/components/default/talents/Presales/Presale/Presale';

export default async function PresalePage({ params }: { params: { id: string } }) {
  return <PresalesProfile id={params.id} />;
}
