import Level from '@/components/default/libraries/Levels/Level/Level';

export default async function LevelPage({ params }: { params: { id: number } }) {
  return <Level id={params.id} />;
}
