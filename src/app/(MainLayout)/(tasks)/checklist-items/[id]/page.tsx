import ChecklistItem from '@/components/default/tasks/ChecklistItems/ChecklistItem/ChecklistItem';

export default async function ChecklistItemPage({ params }: { params: { id: number } }) {
  return <ChecklistItem id={params.id} />;
}
