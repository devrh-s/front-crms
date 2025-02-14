import JaCommunicationsPage from '@/components/default/jobs/JaCommunications/JaCommunications';

interface IJaCommunications {
  id: number;
  value: string;
  index: string;
  communications: any;
}

export default function JaCommunications({ id, value, index, communications }: IJaCommunications) {
  return (
    value === index && (
      <JaCommunicationsPage
        url={`job-applications/${id}/communications`}
        communications={communications}
      />
    )
  );
}
