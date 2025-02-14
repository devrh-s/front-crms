import Tool from '@/components/default/libraries/Tools/Tool/Tool';

export default async function ToolPage({ params }: { params: { id: number } }) {
  return <Tool id={params.id} />;
}
