import ToolType from '@/components/default/libraries/ToolTypes/ToolType/ToolType';

export default async function ToolTypePage({ params }: { params: { id: number } }) {
  return <ToolType id={params.id} />;
}
