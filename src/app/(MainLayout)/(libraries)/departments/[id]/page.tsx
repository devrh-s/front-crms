import Department from '@/components/default/libraries/Departments/Department/Department';

export default async function DepartmentPage({ params }: { params: { id: number } }) {
  return <Department id={params.id} />;
}
