'use client';

import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import JobRequestsActions from '../../JobRequestsActions';
import AppsIcon from '@mui/icons-material/Apps';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import MediationIcon from '@mui/icons-material/Mediation';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import SpokeOutlinedIcon from '@mui/icons-material/SpokeOutlined';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

interface IJobRequestProfileProps {
  id: number;
  index: string;
  value: string;
  jobRequest: IJobRequestType | null;
  commonData: ICommonData;
}

export default function JobRequestsProfile({
  id,
  index,
  value,
  jobRequest,
  commonData,
}: IJobRequestProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: jobRequest?.name ?? '',
    id: jobRequest?.id,
    topContent: {
      title: 'Note',
      icon: <DescriptionIcon />,
      value: jobRequest?.note,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: jobRequest?.createdBy,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: jobRequest?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Department',
        icon: <MediationIcon />,
        value: jobRequest?.department?.name,
        type: 'text',
      },
      {
        title: 'Profession',
        icon: <EngineeringIcon />,
        value: jobRequest?.profession?.name,
        type: 'text',
      },
      {
        title: 'Inner Client',
        icon: <LanguageIcon />,
        value: jobRequest?.innerClient?.name,
        type: 'text',
      },
      {
        title: 'Languages',
        icon: <LanguageIcon />,
        value: jobRequest?.languages?.map((p: any) => {
          const language = {
            id: p.language?.id,
            name: p.language?.name,
            iso2: `${p.language?.iso2} ${p.level?.short_name ? p.level?.short_name : ''}`,
          };
          return language;
        }),
        type: 'moreChips',
      },
      {
        title: 'Shift',
        icon: <TrackChangesIcon />,
        value: jobRequest?.shift?.name,
        type: 'text',
      },
      {
        title: 'Rate',
        icon: <QueryBuilderIcon />,
        value: jobRequest?.rate?.name,
        type: 'text',
      },
      {
        title: 'Manager',
        icon: <PersonOutlineIcon />,
        value: jobRequest?.manager,
        type: 'user',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: jobRequest?.status,
        type: 'status',
      },
      {
        title: 'Job Templates',
        icon: <WorkHistoryIcon />,
        value: jobRequest?.jobTemplates?.map((p: { id: number; title: string }) => {
          return {
            id: p.id,
            name: p.title,
          };
        }),
        type: 'moreChips',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: jobRequest?.task_templates?.map((p: { id: number; name: string }) => {
          return {
            id: p.id,
            name: p.name,
          };
        }),
        type: 'moreChips',
      },
      {
        title: 'Tools',
        icon: <BuildIcon />,
        value: jobRequest?.tools?.map((p: { id: number; name: string }) => {
          return {
            id: p.id,
            name: p.name,
          };
        }),
        type: 'moreChips',
      },
      {
        title: 'Sum Job Applications',
        icon: <AppsIcon />,
        value: jobRequest?.sum_job_applications,
        type: 'text',
      },
      {
        title: 'Quantity',
        icon: <SpokeOutlinedIcon />,
        value: jobRequest?.quantity,
        type: 'text',
      },
      {
        title: 'Close date',
        icon: <EventBusyIcon />,
        value: jobRequest?.close_date,
        type: 'date',
      },
      {
        title: 'Demand date',
        icon: <EventIcon />,
        value: jobRequest?.demand_date,
        type: 'date',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />
        <JobRequestsActions
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
