import LanguageLevelsComponent from '@/components/default/blocks/LanguageLevels/LanguageLevels';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Languages({ id, isDisplayed }: IProps) {
  return isDisplayed && <LanguageLevelsComponent url={`employees/${id}/languages`} />;
}
