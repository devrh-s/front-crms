import AccountUsers from '@/components/default/common/pages/AccountUsers/AccountUsers';

interface IAccountUsers {
  id: number;
  value: string;
  index: string;
}

export default function AccountUsersPage({ id, value, index }: IAccountUsers) {
  return value === index && <AccountUsers url={`job-accounts/${id}/account-users`} />;
}
