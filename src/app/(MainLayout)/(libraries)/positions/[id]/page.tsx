import Position from '@/components/default/libraries/Positions/Position/Position';

export default async function PositionPage({ params }: { params: { id: number } }) {
  return <Position id={params.id} />;
}
