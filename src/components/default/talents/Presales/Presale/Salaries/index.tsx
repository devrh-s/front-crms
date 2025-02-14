import SalariesComponent from '@/components/default/blocks/Salaries/Salaries';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Salaries({ id, isDisplayed }: IProps) {
  return isDisplayed && <SalariesComponent url={`presales/${id}/salaries`} />;
}
