import ContactsComponent from '@/components/default/blocks/Contacts/Contacts';

interface IContacts {
  id: number;
  value: string;
  index: string;
}

export default function Contacts({ id, value, index }: IContacts) {
  return (
    value === index && (
      <ContactsComponent
        url={`job-applications/${id}/contacts`}
        block='Jobs'
        page='Job Applications'
        permType='_ja'
      />
    )
  );
}
