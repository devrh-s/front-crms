import RatesComponent from '@/components/default/blocks/Rates/Rates';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Rates({ id, isDisplayed }: IProps) {
  return isDisplayed && <RatesComponent url={`employees/${id}/rates`} />;
}
