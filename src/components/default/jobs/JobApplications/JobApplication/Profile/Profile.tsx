'use client';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import JobApplicationActions from '../../JobApplicationActions';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringSharpIcon from '@mui/icons-material/EngineeringSharp';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PublicIcon from '@mui/icons-material/Public';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

interface IProfileProps {
  id: number;
  index: string;
  value: string;
  jobApplication: any;
  commonData: ICommonData;
}

export default function Profile({ index, value, jobApplication, commonData }: IProfileProps) {
  const { actionsData, handleActions } = useActions(jobApplication.id);

  const profile = {
    name: jobApplication.name,
    id: jobApplication.id,
    topContent: {
      title: 'Note',
      icon: <DescriptionIcon />,
      value: jobApplication?.notes,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: jobApplication?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: jobApplication?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Name',
        icon: <PersonOutlineIcon />,
        value: jobApplication?.name,
        type: 'text',
      },
      {
        title: 'Country',
        icon: <PublicIcon />,
        value: jobApplication?.country?.name,
        type: 'text',
      },
      {
        title: 'City',
        icon: <LocationCityIcon />,
        value: jobApplication?.city?.name,
        type: 'text',
      },
      {
        title: 'Gender',
        icon: <PersonOutlineIcon />,
        value: jobApplication?.gender,
        type: 'text',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: jobApplication?.status,
        type: 'status',
      },
      {
        title: 'Manager',
        icon: <PersonOutlineIcon />,
        value: jobApplication?.manager?.name,
        type: 'text',
      },
      {
        title: 'Sources',
        icon: <FileOpenOutlinedIcon />,
        value:
          jobApplication?.sources.length > 0 &&
          jobApplication?.sources.map((el: string, i: number) => ({ name: el, id: i })),
        type: 'moreChips',
      },
      {
        title: 'Professions',
        icon: <EngineeringSharpIcon />,
        value:
          jobApplication?.professions.length > 0 &&
          jobApplication?.professions.map((el: string, i: number) => ({ name: el, id: i })),
        type: 'moreChips',
      },
      {
        title: 'Is Talent',
        icon: <AssignmentIndIcon />,
        value: jobApplication?.is_talent ? 'Yes' : 'No',
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <JobApplicationActions
          id={jobApplication.id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
