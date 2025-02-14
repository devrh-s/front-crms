import Icon from '@/components/default/common/components/Icon';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import AppsIcon from '@mui/icons-material/Apps';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssistantIcon from '@mui/icons-material/Assistant';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import BadgeIcon from '@mui/icons-material/Badge';
import BallotIcon from '@mui/icons-material/Ballot';
import BuildIcon from '@mui/icons-material/Build';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CommentIcon from '@mui/icons-material/Comment';
import CommentBankIcon from '@mui/icons-material/CommentBank';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditIcon from '@mui/icons-material/Edit';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FolderIcon from '@mui/icons-material/Folder';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupIcon from '@mui/icons-material/Group';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import KeyIcon from '@mui/icons-material/Key';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import ListIcon from '@mui/icons-material/List';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import MediationIcon from '@mui/icons-material/Mediation';
import MessageIcon from '@mui/icons-material/Message';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import PlaceIcon from '@mui/icons-material/Place';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PublicIcon from '@mui/icons-material/Public';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import SettingsIcon from '@mui/icons-material/Settings';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import TaskIcon from '@mui/icons-material/Task';
import TextsmsIcon from '@mui/icons-material/Textsms';
import TopicIcon from '@mui/icons-material/Topic';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import WebIcon from '@mui/icons-material/Web';
import WorkIcon from '@mui/icons-material/Work';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import { uniqueId } from 'lodash';
import { IMenuItem } from './types';

const menuItems: Array<IMenuItem> = [
  {
    id: uniqueId(),
    type: 'link',
    title: 'Dashboard',
    // icon: <HomeIcon />,
    icon: <Icon type='logo' />,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Jobs',
    icon: <WorkIcon />,
    type: 'group',
    childItems: [
      {
        id: `jobs-${uniqueId()}`,
        title: 'Dashboard',
        icon: <InsertChartIcon />,
        href: '/job-dashboard',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Job Sites',
        icon: <WebIcon />,
        href: '/job-sites',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Job Requests',
        icon: <RequestQuoteIcon />,
        href: '/job-requests',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Job Templates',
        icon: <WorkHistoryIcon />,
        href: '/job-templates',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Post Templates',
        icon: <PostAddIcon />,
        href: '/post-templates',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Job Posts',
        icon: <BallotIcon />,
        href: '/job-posts',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Job Applications',
        icon: <AppsIcon />,
        href: '/job-applications',
      },
      {
        id: `jobs-${uniqueId()}`,
        title: 'Ja Communications',
        icon: <ContactPhoneIcon />,
        href: '/ja-communications',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Businesses',
    icon: <BusinessIcon />,
    type: 'group',
    childItems: [
      {
        id: `businesses-${uniqueId()}`,
        title: 'Inner Clients',
        icon: <LanguageIcon />,
        href: '/inner-clients',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Talents',
    icon: <AssignmentIndIcon />,
    type: 'group',
    childItems: [
      {
        id: `talents-${uniqueId()}`,
        title: 'Users',
        icon: <GroupIcon />,
        href: '/users',
      },
      {
        id: `talents-${uniqueId()}`,
        title: 'Unconfirmed Users',
        icon: <GppBadOutlinedIcon />,
        href: '/unconfirmed-users',
      },
      {
        id: `talents-${uniqueId()}`,
        title: 'Candidates',
        icon: <GroupIcon />,
        href: '/candidates',
      },
      {
        id: `talents-${uniqueId()}`,
        title: 'Employees',
        icon: <GroupIcon />,
        href: '/employees',
      },
      {
        id: `talents-${uniqueId()}`,
        title: 'Presales',
        icon: <GroupIcon />,
        href: '/presales',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Reports',
    icon: <AssessmentIcon />,
    type: 'group',
    childItems: [
      {
        id: `reports-${uniqueId()}`,
        title: 'Reports Countries',
        icon: <PublicIcon />,
        href: '/reports/countries',
      },
      {
        id: `reports-${uniqueId()}`,
        title: 'Reports Languages',
        icon: <LanguageIcon />,
        href: '/reports/languages',
      },
      {
        id: `reports-${uniqueId()}`,
        title: 'Reports Daily',
        icon: <CalendarTodayIcon />,
        href: '/reports/daily',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Blocks',
    icon: <GridViewIcon />,
    type: 'group',
    childItems: [
      {
        id: `blocks-${uniqueId()}`,
        title: 'Activities',
        icon: <LocalActivityIcon />,
        href: '/activities',
      },
      {
        id: `blocks-${uniqueId()}`,
        title: 'Messages',
        icon: <MessageIcon />,
        href: '/messages',
      },
      {
        id: `blocks-${uniqueId()}`,
        title: 'Contacts',
        icon: <RecentActorsIcon />,
        href: '/contacts',
      },
      {
        id: `blocks-${uniqueId()}`,
        title: 'Comments',
        icon: <TextsmsIcon />,
        href: '/comments',
      },
      {
        id: `blocks-${uniqueId()}`,
        title: 'Edits',
        icon: <EditIcon />,
        href: '/edits',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Task Manager',
    icon: <TaskIcon />,
    type: 'group',
    childItems: [
      {
        id: `tasks-${uniqueId()}`,
        title: 'Guides',
        icon: <AssignmentIcon />,
        href: '/guides',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Checklist Items',
        icon: <ListIcon />,
        href: '/checklist-items',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Milestone Templates',
        icon: <SplitscreenIcon />,
        href: '/milestone-templates',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Step Templates',
        icon: <FormatListNumberedIcon />,
        href: '/step-templates',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Task Templates',
        icon: <NewspaperIcon />,
        href: '/task-templates',
      },

      {
        id: `tasks-${uniqueId()}`,
        title: 'Tasks',
        icon: <TaskIcon />,
        href: '/tasks',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Task Requests',
        icon: <PlaylistAddIcon />,
        href: '/task-requests',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Placements',
        icon: <PlaceIcon />,
        href: '/placements',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Project Templates',
        icon: <FolderIcon />,
        href: '/project-templates',
      },
      {
        id: `tasks-${uniqueId()}`,
        title: 'Projects',
        icon: <AccountTreeIcon />,
        href: '/projects',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Contents',
    icon: <ContentPasteIcon />,
    type: 'group',
    childItems: [
      {
        id: `content-${uniqueId()}`,
        title: 'Links',
        icon: <LinkIcon />,
        href: '/links',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Libraries',
    icon: <LocalLibraryIcon />,
    type: 'sub-menu',
    childItems: [
      {
        id: `libraries-${uniqueId()}`,
        title: 'Actions',
        icon: <PendingActionsIcon />,
        href: '/actions',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Cities',
        icon: <LocationCityIcon />,
        href: '/cities',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Countries',
        icon: <PublicIcon />,
        href: '/countries',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Departments',
        icon: <MediationIcon />,
        href: '/departments',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Industries',
        icon: <AccountBalanceIcon />,
        href: '/industries',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Languages',
        icon: <LanguageIcon />,
        href: '/languages',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Libraries',
        icon: <LocalLibraryIcon />,
        href: '/libraries',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Levels',
        icon: <StarHalfIcon />,
        href: '/levels',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Media',
        icon: <PermMediaIcon />,
        href: '/media',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Objects',
        icon: <DataObjectIcon />,
        href: '/objects',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Professions',
        icon: <EngineeringIcon />,
        href: '/professions',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Positions',
        icon: <BadgeIcon />,
        href: '/positions',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Sub Industries',
        icon: <AllInboxIcon />,
        href: '/sub-industries',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Tool Types',
        icon: <BuildIcon />,
        href: '/tool-types',
      },
      {
        id: `libraries-${uniqueId()}`,
        title: 'Tools',
        icon: <BuildCircleIcon />,
        href: '/tools',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Account Manager',
    icon: <ContactEmergencyIcon />,
    type: 'sub-menu',
    childItems: [
      {
        id: `accounts-${uniqueId()}`,
        title: 'Job Accounts',
        icon: <ContactEmergencyIcon />,
        href: '/job-accounts',
      },
      {
        id: `accounts-${uniqueId()}`,
        title: 'Accounts',
        icon: <AccountBoxIcon />,
        href: '/accounts',
      },
      {
        id: `accounts-${uniqueId()}`,
        title: 'GPTs',
        icon: <AssistantIcon />,
        href: '/gpts',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Settings',
    icon: <SettingsIcon />,
    type: 'sub-menu',
    childItems: [
      {
        id: `settings-${uniqueId()}`,
        title: 'Blocks',
        icon: <GridViewIcon />,
        href: '/blocks',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Company Types',
        icon: <HolidayVillageIcon />,
        href: '/company-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'CV Types',
        icon: <BallotIcon />,
        href: '/cv-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Content Types',
        icon: <BallotIcon />,
        href: '/content-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Comment Types',
        icon: <CommentIcon />,
        href: '/comment-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Communication Types',
        icon: <ConnectWithoutContactIcon />,
        href: '/communication-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Currencies',
        icon: <PriceChangeIcon />,
        href: '/currencies',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Entities',
        icon: <ArticleIcon />,
        href: '/entities',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Entity Block Fields',
        icon: <AccountTreeIcon />,
        href: '/entity-block-fields',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Entity Types',
        icon: <AccountTreeIcon />,
        href: '/entity-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Fields',
        icon: <ViewColumnIcon />,
        href: '/fields',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Formats',
        icon: <TopicIcon />,
        href: '/formats',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Frequencies',
        icon: <ViewColumnIcon />,
        href: '/frequencies',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Message Types',
        icon: <CommentBankIcon />,
        href: '/message-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Role Permissions',
        icon: <AdminPanelSettingsIcon />,
        href: '/role-permissions',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Salary Types',
        icon: <PriceCheckIcon />,
        href: '/salary-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Placement Types',
        icon: <ListAltOutlinedIcon />,
        href: '/placement-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Pricing types',
        icon: <CreditCardIcon />,
        href: '/pricing-types',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Priorities',
        icon: <LowPriorityIcon />,
        href: '/priorities',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Rates',
        icon: <QueryBuilderIcon />,
        href: '/rates',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Shifts',
        icon: <TrackChangesIcon />,
        href: '/shifts',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Statuses',
        icon: <StackedBarChartIcon />,
        href: '/statuses',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Smtp Settings',
        icon: <SettingsIcon />,
        href: '/smtp-settings',
      },
      {
        id: `settings-${uniqueId()}`,
        title: 'Tokens',
        icon: <KeyIcon />,
        href: '/tokens',
      },
      {
        id: `tables-${uniqueId()}`,
        title: 'Tables',
        icon: <BackupTableIcon />,
        href: '/tables',
      },
    ],
  },
];

export default menuItems;
