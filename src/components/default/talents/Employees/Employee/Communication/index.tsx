import { ICommunicationInput } from '@/components/default/common/form/CommunicationInputs/CommunicationInputs';
import CommunicationsComponent from '@/components/default/jobs/JaCommunications/JaCommunications';

interface IProps {
  id: number;
  isDisplayed: boolean;
  communications: ICommunicationInput;
}

export default function Communications({ id, isDisplayed, communications }: IProps) {
  return (
    isDisplayed && (
      <CommunicationsComponent
        url={`employees/${id}/communications`}
        communications={communications}
      />
    )
  );
}
