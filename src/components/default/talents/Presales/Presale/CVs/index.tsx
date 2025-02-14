import CVsComponent from '@/components/default/blocks/CVs/CVs';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function CVs({ id, isDisplayed }: IProps) {
  return isDisplayed && <CVsComponent url={`presales/${id}/cvs`} />;
}
