'use client';
import EntityProfile, {
  IProfile,
} from '@/components/default/common/pages/EntityProfile/EntityProfile';
import EmployeeActions from '@/components/default/talents/Employees/EmployeeActions';
import useActions from '@/hooks/useActions';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PublicIcon from '@mui/icons-material/Public';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface ProfileProps {
  id: number;
  index: string;
  value: string;
  data?: IEmployee;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, data, commonData }: ProfileProps) {
  const { actionsData, handleActions } = useActions();

  const profile: IProfile = {
    name: data?.user?.name,
    image: data?.user?.image,
    id: data?.id,
    bottomContent: {
      user: {
        title: 'Created By',
        value: data?.talents?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: data?.talents?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Full Names',
        icon: <PersonOutlineIcon />,
        value: data?.names?.map((item: any) => ({
          id: item.id,
          name: `${item.translation.iso3}: ${item?.name}`,
        })),
        type: 'moreChips',
      },
      {
        title: 'Short Name',
        icon: <PersonOutlineIcon />,
        value: data?.short_name,
        type: 'text',
      },
      {
        title: 'Slug',
        icon: <PersonOutlineIcon />,
        value: data?.slug,
        type: 'text',
      },
      {
        title: 'Birthday',
        icon: <EventIcon />,
        value: data?.birthday,
        type: 'date',
      },
      {
        title: 'Gender',
        icon: <PersonOutlineIcon />,
        value: data?.gender,
        type: 'text',
      },
      {
        title: 'Is Student',
        icon: <SchoolOutlinedIcon />,
        value: data?.is_student === 1 ? 'Yes' : 'No',
        type: 'availability',
      },
      {
        title: 'Country',
        icon: <PublicIcon />,
        value: data?.country?.name,
        type: 'text',
      },
      {
        title: 'City',
        icon: <LocationCityIcon />,
        value: data?.city?.name,
        type: 'text',
      },
      {
        title: 'Shift',
        icon: <TrackChangesIcon />,
        value: data?.talents?.shift?.name,
        type: 'text',
      },
      {
        title: 'Objects',
        icon: <DataObjectIcon />,
        value: data?.talents?.objects,
        type: 'moreChips',
      },
      {
        title: 'Inner Client',
        icon: <LanguageIcon />,
        value: data?.talents.inner_client?.name,
        type: 'text',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: data?.talents?.status,
        type: 'status',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: data?.talents?.task_templates,
        type: 'moreChips',
      },
      {
        title: 'Tools',
        icon: <BuildIcon />,
        value: data?.talents?.tools,
        type: 'moreChips',
      },
      {
        title: 'Managers',
        icon: <PeopleOutlineIcon />,
        value: data?.talents?.managers,
        type: 'moreChips',
      },
      {
        title: 'Contract Url',
        icon: <ReceiptLongIcon />,
        value: data?.talents?.contract_url,
        type: 'link',
      },
      {
        title: 'Links',
        icon: <LinkIcon />,
        value: data?.talents?.links,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />
        <EmployeeActions
          id={id}
          isProfile
          visible={actionsData.visible}
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
