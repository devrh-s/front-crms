import ContactsComponent from '@/components/default/blocks/Contacts/Contacts';

interface IProps {
  id: number;
  isDisplayed: boolean;
}

export default function Contacts({ id, isDisplayed }: IProps) {
  return (
    isDisplayed && (
      <ContactsComponent
        url={`candidates/${id}/contacts`}
        block='Talents'
        page='Candidates'
        permType='_candidates'
      />
    )
  );
}
