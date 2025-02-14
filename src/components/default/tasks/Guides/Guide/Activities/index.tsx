import ActivitiesPage from '@/components/default/blocks/Activities/Activities';

interface IActivities {
  id: number;
  value: string;
  index: string;
}

export default function Activities({ id, value, index }: IActivities) {
  return value === index && <ActivitiesPage url={`guides/${id}/activities`} />;
}
