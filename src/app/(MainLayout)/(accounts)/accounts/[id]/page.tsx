import Account from '@/components/default/accounts/Accounts/Account/Account';

export default async function AccountPage({ params }: { params: { id: number } }) {
  return <Account id={params.id} />;
}
