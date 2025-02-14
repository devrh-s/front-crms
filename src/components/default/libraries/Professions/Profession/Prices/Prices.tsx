import ProfessionPrice from '@/components/default/common/pages/ProfessionPrice/ProfessionPrice';

interface IPrise {
  id: number;
  value: string;
  index: string;
}

export default function Prise({ id, value, index }: IPrise) {
  return value === index && <ProfessionPrice url={`professions/${id}/prices`} />;
}
