import VerificationAccountsPage from '@/components/default/common/pages/VerificationAccounts/VerificationAccounts';

interface IVerificationAccounts {
  id: number;
  value: string;
  index: string;
}

export default function PassHistories({ id, value, index }: IVerificationAccounts) {
  return (
    value === index && <VerificationAccountsPage url={`accounts/${id}/account-verifications`} />
  );
}
