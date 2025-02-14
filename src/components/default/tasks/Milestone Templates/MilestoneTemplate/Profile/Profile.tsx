'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import MilestoneTemplatesActions from '../../MilestoneTemplatesActions';
import DescriptionIcon from '@mui/icons-material/Description';
import NewspaperIcon from '@mui/icons-material/Newspaper';

interface IMilestoneTemplatesProfileProps {
  id: number;
  index: string;
  value: string;
  milestoneTemplate: IProjectTemplate | null;
  commonData: ICommonData;
}

export default function JobTemplatesProfile({
  id,
  index,
  value,
  milestoneTemplate,
  commonData,
}: IMilestoneTemplatesProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: milestoneTemplate?.name,
    id: milestoneTemplate?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: milestoneTemplate?.description,
      type: 'text',
    },
    fields: [
      {
        title: 'Task Template',
        icon: <NewspaperIcon />,
        value: (
          <MoreChips
            data={milestoneTemplate?.task_templates ? milestoneTemplate?.task_templates : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/task-templates/${data.id}`)}
          />
        ),
        type: 'component',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <MilestoneTemplatesActions
          id={id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
