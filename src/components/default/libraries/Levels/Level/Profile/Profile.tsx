'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import { ILevel } from '../../types';
import LavelActions from '../../LevelActions';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  level: ILevel | null;
  commonData: ICommonData;
}

export default function LevelProfile({
  id,
  index,
  value,
  level,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: level?.name,
    id: level?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: level?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: level?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: level?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: level?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: level?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: level?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: level?.priority.name,
        type: 'text',
      },
      {
        title: 'Short name',
        icon: <LanguageIcon />,
        value: level?.short_name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <LavelActions
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
