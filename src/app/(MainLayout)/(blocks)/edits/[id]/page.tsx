import Edit from '@/components/default/blocks/Edits/Edit/Edit';

export default async function AccountPage({ params }: { params: { id: number } }) {
  return <Edit id={params.id} />;
}
