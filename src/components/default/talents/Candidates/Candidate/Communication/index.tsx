import CommunicationsComponent from '@/components/default/jobs/JaCommunications/JaCommunications';
import { IJaCommunication } from '@/components/default/jobs/JaCommunications/types';

interface IProps {
  id: number;
  isDisplayed: boolean;
  communications?: IJaCommunication;
}

export default function Communications({ id, isDisplayed, communications }: IProps) {
  return (
    isDisplayed && (
      <CommunicationsComponent
        url={`candidates/${id}/communications`}
        communications={communications}
      />
    )
  );
}
