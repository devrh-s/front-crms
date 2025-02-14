import FilterLink from '../../common/components/FilterLink';
import EntityProfile from '../../common/pages/EntityProfile/EntityProfile';
import AppsIcon from '@mui/icons-material/Apps';
import BallotIcon from '@mui/icons-material/Ballot';
import BuildIcon from '@mui/icons-material/Build';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LanguageIcon from '@mui/icons-material/Language';
import MediationIcon from '@mui/icons-material/Mediation';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IJobTemplateInfoProps {
  activeBookmark: string;
  jobTemplate: IJobTemplate;
}

export default function JobTemplateInfo({ activeBookmark, jobTemplate }: IJobTemplateInfoProps) {
  const profile = {
    name: jobTemplate?.title,
    id: jobTemplate?.id,
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
        title: 'Translation',
        icon: <TranslateIcon />,
        value: jobTemplate?.translation?.iso2,
        type: 'translation',
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
    // accordions: [
    //   {
    //     title: 'Role Overview',
    //     content: jobTemplate?.role_overview,
    //   },
    //   {
    //     title: 'Prompt',
    //     content: jobTemplate?.prompt,
    //   },
    // ],
  };

  return (
    <>
      {activeBookmark === 'job_template' && (
        <EntityProfile
          profile={profile}
          isDrawer={true}
          handleActions={() => {}}
          availableEdit={false}
        />
      )}
    </>
  );
}
