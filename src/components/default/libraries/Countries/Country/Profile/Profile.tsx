'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import CountryActions from '../../CountryActions';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  country: ICountry | null;
  commonData: ICommonData;
}

export default function CountryProfile({
  id,
  index,
  value,
  country,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: country?.name,
    id: country?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: country?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: country?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: country?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'ISO2',
        icon: <LanguageIcon />,
        value: country?.iso2,
        type: 'text',
      },
      {
        title: 'ISO3',
        icon: <LanguageIcon />,
        value: country?.iso3,
        type: 'text',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: country?.status,
        type: 'status',
      },
      {
        title: 'Cities',
        icon: <LocationCityIcon />,
        value: country?.cities,
        type: 'moreChips',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: country?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: country?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: country?.priority.name,
        type: 'text',
      },
      {
        title: 'Latitude',
        icon: <ShareLocationIcon />,
        value: country?.latitude,
        type: 'text',
      },
      {
        title: 'Longitude',
        icon: <ShareLocationIcon />,
        value: country?.longitude,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <CountryActions
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
