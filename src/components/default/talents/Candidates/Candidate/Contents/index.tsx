import ContentsComponent from '@/components/default/blocks/Contents/Contents';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Contents({ id, isDisplayed }: IProps) {
  return isDisplayed && <ContentsComponent url={`candidates/${id}/contents`} />;
}
