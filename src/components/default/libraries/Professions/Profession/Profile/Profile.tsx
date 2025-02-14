'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import ProfessionActions from '../../ProfessionActions';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import MediationIcon from '@mui/icons-material/Mediation';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IProfessionProfileProps {
  id: number;
  index: string;
  value: string;
  profession: IProfession | null;
  commonData: ICommonData;
}

export default function ProfessionProfile({
  id,
  index,
  value,
  profession,
  commonData,
}: IProfessionProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: profession?.name,
    id: profession?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: profession?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: profession?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: profession?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: profession?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: profession?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: profession?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: profession?.priority.name,
        type: 'text',
      },
      {
        title: 'Department',
        icon: <MediationIcon />,
        value: profession?.department?.name,
        type: 'text',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: profession?.task_templates,
        type: 'moreChips',
      },
      {
        title: 'Tools',
        icon: <BuildIcon />,
        value: profession?.tools,
        type: 'moreChips',
      },
      {
        title: 'Links',
        icon: <LinkIcon />,
        value: profession?.links,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ProfessionActions
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
