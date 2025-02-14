import Placement from '@/components/default/tasks/Placements/Placements/Placements';

export default async function PlacementPage({ params }: { params: { id: number } }) {
  return <Placement id={params.id} />;
}
