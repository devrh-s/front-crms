'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import ProjectTemplatesActions from '../../ProjectTemplatesActions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';

interface IProjectTemplatesProfileProps {
  id: number;
  index: string;
  value: string;
  projectTemplate: IProjectTemplate | null;
  commonData: ICommonData;
}

export default function JobTemplatesProfile({
  id,
  index,
  value,
  projectTemplate,
  commonData,
}: IProjectTemplatesProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: projectTemplate?.name,
    id: projectTemplate?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: projectTemplate?.description,
      type: 'text',
    },
    fields: [
      {
        title: 'Hours',
        icon: <AccessTimeIcon />,
        value: projectTemplate?.hours,
        type: 'text',
      },
      {
        title: 'Task Template',
        icon: <NewspaperIcon />,
        value: (
          <MoreChips
            data={projectTemplate?.task_templates ? projectTemplate?.task_templates : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/task-templates/${data.id}`)}
          />
        ),
        type: 'component',
      },
      {
        title: 'Milestone Template',
        icon: <SplitscreenIcon />,
        value: (
          <MoreChips
            data={projectTemplate?.milestone_templates ? projectTemplate?.milestone_templates : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/milestone-templates/${data.id}`)}
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

        <ProjectTemplatesActions
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
