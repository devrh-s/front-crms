import EmployeeProfile from '@/components/default/talents/Employees/Employee/Employee';

export default async function EmployeePage({ params }: { params: { id: string } }) {
  return <EmployeeProfile id={params.id} />;
}
