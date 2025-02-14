'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import LanguageActions from '../../LanguageActions';
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
  language: ILanguage | null;
  commonData: ICommonData;
}

export default function CityProfile({
  id,
  index,
  value,
  language,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: language?.name,
    id: language?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: language?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: language?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: language?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: language?.status,
        type: 'status',
      },
      {
        title: 'ISO2',
        icon: <LanguageIcon />,
        value: language?.iso2,
        type: 'text',
      },
      {
        title: 'ISO3',
        icon: <LanguageIcon />,
        value: language?.iso3,
        type: 'text',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: language?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: language?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: language?.priority.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <LanguageActions
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
