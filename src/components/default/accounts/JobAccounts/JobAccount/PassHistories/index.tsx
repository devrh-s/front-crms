import PassHistoriesPage from '@/components/default/common/pages/PassHistories/PassHistories';

interface IPassHistories {
  id: number;
  value: string;
  index: string;
}

export default function PassHistories({ id, value, index }: IPassHistories) {
  return value === index && <PassHistoriesPage url={`job-accounts/${id}/pass-histories`} />;
}
