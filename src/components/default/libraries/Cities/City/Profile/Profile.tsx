'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import CityActions from '../../CityActions';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PublicIcon from '@mui/icons-material/Public';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  city: ICity | null;
  commonData: ICommonData;
}

export default function CityProfile({ id, index, value, city, commonData }: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: city?.name,
    id: city?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: city?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: city?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: city?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: city?.status,
        type: 'status',
      },
      {
        title: 'Country',
        icon: <PublicIcon />,
        value: city?.country?.name,
        type: 'text',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: city?.translation?.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: city?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: city?.priority?.name,
        type: 'text',
      },
      {
        title: 'Latitude',
        icon: <ShareLocationIcon />,
        value: city?.latitude,
        type: 'text',
      },
      {
        title: 'Longitude',
        icon: <ShareLocationIcon />,
        value: city?.longitude,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <CityActions
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
