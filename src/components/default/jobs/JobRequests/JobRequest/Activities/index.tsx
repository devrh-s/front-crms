import ActivitiesPage from '@/components/default/blocks/Activities/Activities';

interface IActivities {
  id: number;
  isDisplayed: boolean;
}

export default function Activities({ id, isDisplayed }: IActivities) {
  return isDisplayed && <ActivitiesPage url={`job-requests/${id}/activities`} />;
}
