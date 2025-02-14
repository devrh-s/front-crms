import PricesComponent from '@/components/default/blocks/TalentPrices/TalentPrices';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Prices({ id, isDisplayed }: IProps) {
  return isDisplayed && <PricesComponent url={`employees/${id}/prices`} />;
}
