'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import ObjectsActions from '../../ObjectsActions';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TopicIcon from '@mui/icons-material/Topic';
import TranslateIcon from '@mui/icons-material/Translate';

interface IObjectProfileProps {
  id: number;
  index: string;
  value: string;
  object: IObject | null;
  commonData: ICommonData;
}

export default function ObjectProfile({
  id,
  index,
  value,
  object,
  commonData,
}: IObjectProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: object?.name,
    id: object?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: object?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: object?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: object?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: object?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: object?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: object?.library.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: object?.priority.name,
        type: 'text',
      },
      {
        title: 'Professions',
        icon: <EngineeringIcon />,
        value: object?.professions,
        type: 'moreChips',
      },
      {
        title: 'Formats',
        icon: <TopicIcon />,
        value: object?.formats,
        type: 'moreChips',
      },
      {
        title: 'Links',
        icon: <LinkIcon />,
        value: object?.links,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ObjectsActions
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
