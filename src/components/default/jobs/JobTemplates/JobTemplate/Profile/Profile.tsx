'use client';

import FilterLink from '@/components/default/common/components/FilterLink';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import JobTemplateActions from '../../JobTemplateActions';
import AppsIcon from '@mui/icons-material/Apps';
import BallotIcon from '@mui/icons-material/Ballot';
import BuildIcon from '@mui/icons-material/Build';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LanguageIcon from '@mui/icons-material/Language';
import MediationIcon from '@mui/icons-material/Mediation';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

interface IJobTemplatesProfileProps {
  id: number;
  index: string;
  value: string;
  jobTemplate: IJobTemplate | null;
  commonData: ICommonData;
}

export default function JobTemplatesProfile({
  id,
  index,
  value,
  jobTemplate,
  commonData,
}: IJobTemplatesProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: jobTemplate?.title,
    id: jobTemplate?.id,
    topContent: {
      title: 'Role Overview',
      icon: <DescriptionIcon />,
      value: jobTemplate?.role_overview,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: jobTemplate?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: jobTemplate?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: jobTemplate?.status,
        type: 'status',
      },
      {
        title: 'Department',
        icon: <MediationIcon />,
        value: jobTemplate?.department?.name,
        type: 'text',
      },
      {
        title: 'Profession',
        icon: <EngineeringIcon />,
        value: jobTemplate?.profession?.name,
        type: 'text',
      },
      {
        title: 'Similar Profession',
        icon: <EngineeringIcon />,
        value: jobTemplate?.similar_profession?.name,
        type: 'text',
      },
      {
        title: 'Languages',
        icon: <LanguageIcon />,
        value: jobTemplate?.languages,
        type: 'moreChips',
      },
      {
        title: 'Objects',
        icon: <DataObjectIcon />,
        value: jobTemplate?.objects,
        type: 'moreChips',
      },
      {
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        value: jobTemplate?.task_templates,
        type: 'moreChips',
      },
      {
        title: 'Tools',
        icon: <BuildIcon />,
        value: jobTemplate?.tools,
        type: 'moreChips',
      },
      {
        title: 'Job Requests',
        icon: <RequestQuoteIcon />,
        value: jobTemplate?.job_requests,
        type: 'moreChips',
      },
      {
        title: 'Sum Jas',
        icon: <AppsIcon />,
        value: (
          <FilterLink
            link={'/job-applications'}
            label={jobTemplate?.sum_jas ? jobTemplate.sum_jas.toString() : ''}
            filterPage='job-applications'
            filterName='job-templates'
            filterValue={{
              value: [jobTemplate?.id],
              mode: 'standard',
            }}
          />
        ),
        type: 'text',
      },
      {
        title: 'Sum Job Posts',
        icon: <BallotIcon />,
        value: (
          <FilterLink
            link={'/job-posts'}
            label={jobTemplate?.sum_job_posts ? jobTemplate.sum_job_posts.toString() : ''}
            filterPage='job-posts'
            filterName='job-templates'
            filterValue={{
              value: [jobTemplate?.id],
              mode: 'standard',
            }}
          />
        ),
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <JobTemplateActions
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
