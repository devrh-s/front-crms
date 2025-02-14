import Accounts from '@/components/default/accounts/Accounts/Accounts';

interface IJobRequests {
  id: number;
  value: string;
  index: string;
}

export default function OwnerAccountsPage({ id, value, index }: IJobRequests) {
  return value === index && <Accounts url={`users/${id}/owner-accounts`} />;
}
