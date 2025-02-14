import JobAccountsPage from '@/components/default/accounts/JobAccounts/JobAccounts';

interface IJobAccounts {
  id: number;
  value: string;
  index: string;
}

export default function JobAccounts({ id, value, index }: IJobAccounts) {
  return value === index && <JobAccountsPage url={`job-sites/${id}/job-accounts`} />;
}
