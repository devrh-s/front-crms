'use client';
import useActions from '@/hooks/useActions';
import dayjs from 'dayjs';
import JobPostActions from '../../JobPostActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import CustomChip from '@/components/default/common/components/CustomChip';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AppsIcon from '@mui/icons-material/Apps';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LanguageIcon from '@mui/icons-material/Language';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PublicIcon from '@mui/icons-material/Public';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TranslateIcon from '@mui/icons-material/Translate';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';

interface TabPanelProps {
  index: string;
  value: string;
  jobPost: IJobPost;
  commonData: ICommonData;
}

export default function Profile({ index, value, jobPost, commonData }: TabPanelProps) {
  const { actionsData, handleActions } = useActions(jobPost.id);
  const profile = {
    name: jobPost?.name,
    id: jobPost?.id,
    topContent: {
      title: 'Full Post',
      icon: <DescriptionIcon />,
      value: jobPost?.full_post,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Published By',
        value: jobPost?.published_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Publish Date',
          value: jobPost?.publish_date,
          type: 'date',
        },
        {
          title: 'End Date',
          value: jobPost?.end_date,
          type: jobPost?.end_date === null ? 'text' : 'date',
        },
      ],
    },
    fields: [
      {
        title: 'slug',
        icon: <PersonOutlineIcon />,
        value: jobPost?.slug,
        type: 'text',
      },
      {
        title: 'Cost',
        icon: <AttachMoneyIcon />,
        value: `${jobPost?.currency?.symbol}${jobPost?.cost}`,
        type: 'text',
      },
      {
        title: 'Link',
        icon: <LinkIcon />,
        value: jobPost?.link,
        type: 'link',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: jobPost?.status,
        type: 'status',
      },
      {
        title: 'Job Account',
        icon: <ContactEmergencyIcon />,
        value: jobPost?.job_account?.name,
        type: 'text',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: jobPost?.translation?.iso2,
        type: 'translation',
      },
      {
        title: 'Country',
        icon: <PublicIcon />,
        value: <CustomChip label={jobPost?.country?.name} data={jobPost?.country} />,
        type: 'text',
      },
      {
        title: 'City',
        icon: <LocationCityIcon />,
        value: <CustomChip label={jobPost?.city?.name} data={jobPost?.city} />,
        type: 'text',
      },
      {
        title: 'Post Template',
        icon: <PostAddIcon />,
        value: jobPost?.post_template?.title,
        type: 'text',
      },
      {
        title: 'Sum JAS',
        icon: <AppsIcon />,
        value: jobPost?.sum_jas,
        type: 'text',
      },
      {
        title: 'Shift',
        icon: <TrackChangesIcon />,
        value: jobPost?.shift?.name,
        type: 'text',
      },
      {
        title: 'Contact Accounts',
        icon: <ContactsOutlinedIcon />,
        value: jobPost?.contact_accounts,
        type: 'moreChips',
      },
      {
        title: 'Account',
        icon: <AccountBoxIcon />,
        value: jobPost?.account?.name,
        type: 'text',
      },
      {
        title: 'Inner Client',
        icon: <LanguageIcon />,
        value: jobPost?.inner_client?.name,
        type: 'text',
      },
      {
        title: 'Published Site',
        icon: <WebOutlinedIcon />,
        value: jobPost?.published_site === 0 ? 'NO' : 'YES',
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />
        <JobPostActions
          id={jobPost.id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
