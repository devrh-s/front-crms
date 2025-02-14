import CommentsComponent from '@/components/default/blocks/Comments/Comments';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Comments({ id, isDisplayed }: IProps) {
  return isDisplayed && <CommentsComponent url={`employees/${id}/comments`} />;
}
