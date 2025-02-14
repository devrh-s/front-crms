import JobAccount from '@/components/default/accounts/JobAccounts/JobAccount/JobAccount';

export default async function JobAccountPage({ params }: { params: { id: number } }) {
  return <JobAccount id={params.id} />;
}
