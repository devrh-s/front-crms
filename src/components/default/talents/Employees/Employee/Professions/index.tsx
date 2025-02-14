import ProfessionsComponent from '@/components/default/blocks/Professions/Professions';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Professions({ id, isDisplayed }: IProps) {
  return isDisplayed && <ProfessionsComponent url={`employees/${id}/professions`} />;
}
