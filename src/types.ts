type Dayjs = import('dayjs').Dayjs;

type FilterType = 'date' | 'select' | 'switch';

type FilterMode = 'standard' | 'exclude';

interface ResponseError {
  message?: string;
  code?: string;
  status: number;
  response: {
    data: {
      error: any;
      message: string;
    };
  };
}
interface IProjectTemplate {
  id: number;
  name: string;
  description: string;
  hours: string | number;
  task_templates: { id: number; name: string }[];
  milestone_templates: { id: number; name: string }[];
}
interface IMilestoneTemplate {
  id: number;
  name: string;
  description: string;
  task_templates: ITaskTemplate[];
}
interface IPostTemplate {
  id: number;
  title: string;
  status: IStatus;
  job_template: IJobTemplate;
  destination: string;
  full_post_template: string;
  tools?: { id: number; name: string }[];
  created_at: string;
  created_by: IShortUser;
  translation?: ILanguage;
  profession?: IProfession;
  shift?: IShift;
  prompt?: string;
  task_templates?: ITaskTemplate[];
  languages?: ILanguage[];
  role_overview?: string;
  job_template_tools?: any;
}

interface IProject {
  id: number;
  name: string;
  project_template: { id: number; name: string };
  start_date: string;
  end_date: string;
  tasks: { id: number; is_completed: number; title: string }[];
  created_at: string;
  created_by: IShortUser;
  inner_client: IInnerClient;
}

interface IFields {
  name?: string;
  website?: string;
  created_by?: string;
  created_at?: string;
  note?: string;
  countries?: string;
  languages?: string;
  sum_job_accs?: string;
  actions?: string;
}

interface IParallelResult {
  value: {
    data: any;
  };
}
interface IFrequenciesType {
  id: number;
  name: string;
  days_num: number;
}

interface IRolesAndPermission {
  id: number;
  name: string;
  display_name: string;
}

interface IOption {
  id: number | string;
  item_id?: number | string;
  name: string;
  is_default?: number;
  title?: string;
  country_id?: number;
  language_id?: number;
  library?: {
    id: number;
    name?: string;
  };
  color?: string;
  city_id?: number;
  iso2?: string;
  iso3?: string;
  image?: string;
  symbol?: string;
  link?: string | null;
  profession_id?: number;
  department_id?: number;
  tool_id?: number;
  object_id?: number;
  sub_industry_id?: number;
  industry_id?: number;
  start_time?: string;
  end_time?: string;
  guides?: IGuideType[];
  formats?: IFormats[];
  objects?: IObject[];
  checklist_items?: IChecklistItemType[];
  professions?: IProfession[];
  country?: {
    id: number;
    country_id: number;
    name: string;
  };
  cities?: {
    id: number;
    name: string;
  }[];
  entity?: {
    id: number;
    name: string;
  };
  block?: {
    id: number;
    name: string;
  };
  account?: {
    id: number;
    name: string;
  };
  job_account?: {
    id: number;
    name: string;
  };
}

interface ICommonData {
  post_templates?: Array<IOption>;
  positions?: Array<IOption>;
  located_at?: Array<IOption>;
  milestone_templates?: Array<IOption>;
  post_templates_full?: IPostTemplate[];
  similar_professions?: Array<IOption>;
  talent?: Array<IOption>;
  job_posts?: Array<IOption>;
  job_requests?: Array<IOption>;
  countries?: Array<IOption>;
  tools?: Array<IOption>;
  tools_candidates?: Array<IOption>;
  groups?: Array<IOption>;
  groups_similar?: Array<IOption>;
  statuses?: Array<IOption>;
  edit_statuses?: Array<IOption>;
  edit_progress_types?: Array<IOption>;
  languages?: Array<IOption>;
  priorities?: Array<IOption>;
  availabilities?: Array<IOption>;
  pricings?: Array<IOption>;
  currencies?: Array<IOption>;
  users?: Array<IOption>;
  actions?: Array<IOption>;
  entities?: Array<IOption>;
  entity_types?: Array<IOption>;
  blocks?: Array<IOption>;
  formats?: Array<IOption>;
  pricing?: Array<IOption>;
  professions?: Array<IOption>;
  departments?: Array<IOption>;
  responsibilities?: Array<IOption>;
  objects?: Array<IOption>;
  company_types?: Array<IOption>;
  inner_clients?: Array<IOption>;
  managers?: Array<IOption>;
  rates?: Array<IOption>;
  shifts?: Array<IOption>;
  job_templates?: Array<IOption>;
  tool_types?: Array<IOption>;
  industries?: Array<IOption>;
  sub_industries?: Array<IOption>;
  entity_block?: Array<IOption>;
  job_accounts?: Array<IOption>;
  cities?: Array<IOption>;
  accounts?: Array<IOption>;
  communication_types?: Array<IOption>;
  messages?: Array<IOption>;
  message_types?: Array<IOption>;
  genders?: Array<IOption>;
  verification_accounts?: Array<IOption>;
  job_applications?: Array<IOption>;
  job_sites?: Array<IOption>;
  object_actions?: Array<IOption>;
  flags?: Array<IOption>;
  guides?: Array<IOption>;
  checklist_items?: Array<IOption>;
  step_templates?: Array<IOption>;
  frequencies?: Array<IOption>;
  task_templates?: Array<IOption>;
  tasks?: Array<IOption>;
  edits?: Array<IOption>;
  roles?: Array<IOption>;
  levels?: Array<IOption>;
  cv_types?: Array<IOption>;
  content_types?: Array<IOption>;
  placements?: Array<IOption>;
  placement_types?: Array<IOption>;
  project_templates?: Array<IOption>;
  destinations?: Array<IOption>;
  links?: Array<IOption>;
  types?: Array<IOption>;
  salary_types?: Array<IOption>;
  comment_types?: Array<IOption>;
}
type CommonDataKeys = keyof ICommonData;
type CommonDataBlocks = { [key in CommonDataKeys]?: string };

interface IComments {
  id?: number;
  date?: string;
  comment_type?: {
    id: number;
    name: string;
  };
  note?: string;
  created_at?: string;
  created_by?: IUser;
}

interface IDateFilterValues {
  start: Dayjs | null;
  end: Dayjs | null;
}

interface IDateFilter {
  value: IDateFilterValues;
  mode: FilterMode;
}

interface IFilter {
  value: number[] | string;
  mode?: FilterMode;
}

interface IMessageType {
  id: number;
  name: string;
}
interface IPriority {
  id: number;
  name: string;
  color: string;
}
interface IBlock {
  id: number;
  name: string;
  table_name: string;
  entities: IEntity[];
}
interface IPricing {
  id: number;
  name: string;
  job_site?: {
    id: number;
  };
  pricing_type?: {
    id: number;
  };
  job_post_amount: number;
  package_name?: string;
  currency?: { id: number };
  price: number;
}

interface ICity {
  id: number;
  name: string;
  status: IStatus;
  country: {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
    image: string;
  };
  translation: {
    name: string;
  };
  description?: string;
  longitude?: number;
  latitude?: number;
  library: ILibrary;
  priority: IPriority;
  created_at?: string;
  created_by?: IUser;
}

interface ICountry {
  id: number;
  iso2: string;
  iso3: string;
  name: string;
  image: string;
  cities: Array<ICity>;
  longitude?: number;
  latitude?: number;
  translation: {
    name: string;
  };
  description?: string;
  library: ILibrary;
  priority: IPriority;
  created_at?: string;
  created_by?: IUser;
  status: IStatus;
  guides: IGuideType[];
}
interface IObject {
  id: number;
  object_id: number;
  library: { id: number; name: string };
  name: string;
  status: { id: number; name: string; color: string };
  professions: Array<IProfession>;
  description?: string;
  translation: {
    name: string;
  };
  priority: IPriority;
  created_at?: string;
  created_by?: IUser;
  formats: any;
  links: ILink[];
  guides: IGuideType[];
}

interface ILanguage {
  id: number;
  language_id?: number;
  iso2: string;
  iso3: string;
  name: string;
  description?: string;
  image: string;
  created_at?: string;
  created_by?: IUser;
  library?: ILibrary;
  status: IStatus;
  priority: IPriority;

  translation: {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
  };
}

interface IPermission {
  name: string;
  entities: Array<{
    name: string;
    permissions: { [permission: string]: string };
  }>;
}

interface IUser {
  id: number;
  name: string;
  email?: string;
  image?: string;
  is_active?: string;
  password?: string;
  task_assigned?: number;
  task_done?: number;
  // assigned_tasks?: Array<ITask>;
  // done_tasks?: Array<ITask>;
  hourly_cost?: number;
  availability?: string;
  created_at?: string;
  currency?: ICurrencies;
  link?: string;
}

interface IInnerClient {
  id: number;
  name: string;
  website: string;
  iso: string;
  description: string;
  tax_number: string;
  company_type: {
    id: number;
    name: string;
  };
}

interface IActionsData {
  visible: boolean;
  id: number | null;
  isDuplicate?: boolean;
}

interface IDeleteModal {
  open: boolean;
  ids: number[];
}

interface IEntity {
  id: number;
  name: string;
  table_name?: string;
  entity_type?: IOption;
  blocks?: IOption[];
  entity_type_id?: number;
  description?: string;
  pivot?: { block_id: number; entity_id: number };
}

interface IEntityType {
  id: number;
  name: string;
  table_name: string;
  entities: IEntity[];
}
interface IFieldType {
  id: number;
  db_name: string;
  table_name: string;
  front_name: string;
  translation: {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
  };
}
interface IJobRequestType {
  id: number;
  name: string;
  innerClient: IInnerClient;
  department: IDepartment;
  profession: IProfession;
  manager: IUser;
  sum_job_applications: number;
  jobTemplates: any;
  languages: ILanguage[];
  note: string;
  created_by: IUser;
  created_at: string;
  close_date: string;
  demand_date: string;
  shift: {
    id: number;
    name: string;
  };
  rate: {
    id: number;
    name: string;
  };
  quantity?: number;
  createdBy?: IUser;
  status?: IStatus;
  object_actions: IObjectAction[];
  task_templates: IObjectAction[];
  tools: ITool[];
}
interface IEntityBlockFieldType {
  id: number;
  isGroupHidden: boolean;
  isGroupHeader: boolean;
  hidden: boolean;
  groupId: number;
  name: string;
  entity_type_name: string;
  entity_type_id: number;
  block_name: string;
  block_id: number;
  fields: {
    entity_block_field_id: number;
    id: number;
    db_name: string;
    front_name: string;
    translation: {
      id: number;
      language_id: number;
      iso2: string;
      iso3: string;
      name: string;
    };
    tooltip: string;
  }[];
}
interface IStatus {
  id: number;
  name: string;
  color: string;
}
interface IAction {
  id: number;
  action_id?: number;
  name: string;
  status: IStatus;
  translation: ILanguage;
  priority: IPriority;
  library?: ILibrary;
  description?: string;
  created_at: string;
  created_by: IUser | null;
}
interface IFormats {
  id: number;
  name: string;
  objects: IObject[];
}

interface IDepartment {
  id: number;
  department_id: number;
  name: string;
  status: IStatus;
  library: IOption;
  priority: IPriority;
  description?: string;
  created_at: string;
  created_by: IUser | null;
  professions: IProfession[];
  links?: ILink[];
  color: string;
  library_id?: number;
  is_translated?: number;
  translation: {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
  };
}
interface IJobTemplate {
  id: number;
  title: string;
  description: any;
  role_overview: string;
  sum_jas: number;
  sum_job_posts: number;
  profession: IProfession;
  department: IDepartment;
  status: IStatus;
  similar_profession?: any;
  translation: ILanguage;
  objects: Array<IObject>;
  task_templates: Array<ITaskTemplate>;
  tools: Array<ITool>;
  job_requests: Array<IJobRequestType>;
  created_by: IUser;
  created_at: string;
  languages: Array<ILanguage>;
  full_template: string;
  prompt: string;
}

interface IProfession {
  id: number;
  profession_id: number;
  library_id: number;
  name: string;
  status?: IStatus;
  department?: IDepartment;
  library?: ILibrary;
  priority: IPriority;
  created_at: string;
  created_by: IUser | null;
  tools: ITool[];
  links?: ILink[];
  objects: IObject[];
  description?: string;
  task_templates: ITaskTemplate[];
  translation: ILanguage;
}
interface ICurrencies {
  id: number;
  name: string;
  iso3: string;
  symbol: string;
}

interface ILibrary {
  id: number;
  name: string;
}

interface ITool {
  id: number;
  name: string;
  link?: string;
}

interface IObject {
  id: number;
  name: string;
  object_id: number;
}

interface IIndustry {
  id: number;
  name: string;
  status: IStatus;
  translation: ILanguage;
  description?: string;
  priority: IPriority;
  sub_industries?: ISubIndustry;
  library?: ILibrary;
  industry_id: number;
  created_at: string;
  created_by: IUser | null;
}

interface ISubIndustry {
  id: number;
  name: string;
  status: IStatus;
  translation: ILanguage;
  priority: IPriority;
  library?: ILibrary;
  description?: string;
  industry_id: number;
  sub_industry_id: number;
  created_at: string;
  created_by: IUser | null;
  industry: IIndustry;
}

interface ICreationInfo {
  created_by: IUser;
  created_at: string;
}

interface IContact {
  id: number | string;
  value: string;
  tool?: ITool;
  tool_id?: number | string;
  located_at?: { id?: number; name?: string };
  relation?: { id?: number; default_title?: string; url?: string };
}

interface ICommunicationType {
  id: number;
  name: string;
  description: string;
  entity_blocks: { id: number; name: string }[];
}

interface IAccount {
  id: number;
  created_at: string;
  created_by: IUser;
  inner_client: IInnerClient;
  name: string;
  login: string;
  password: string;
  status: IStatus;
  link: string;
  document_link: string;
  tool: ITool;
  note: string;
  verifications: {
    id: number | string;
    name: string;
    link: string;
  }[];
  owner: IUser;
  users: {
    id: number;
    account: {
      id: number;
      link: string;
      name: string;
    };
    user: IUser;
  }[];
}
interface IObjectAction {
  id: number;
  name: string;
  status?: { id: number; name: string; color: string };
  image_icon?: string;
  createdBy: IUser;
  translation?: { iso2: string };
  professions: {
    description: string;
    id: number;
    image_icon: string;
    name: string;
    profession_id: number;
  }[];
  tools: [];
  description: string;
  links: [];
  created_at: string;
  object: { id: number; object_id: number; name: string };
  action: { id: number; action_id: number; name: string };
}
interface IGuideType {
  id: number;
  name: string;
  guide_formats: any;
  created_by: IUser;
  created_at: string;
  updated_at: string;
  status: IStatus;
  checklist_items: IChecklistItemType[];
  tools: ITool[];
  objects: IObject[];
  type: IObject[];
  entities: IEntity[];
}
interface ITaskRequest {
  id: number;
  title?: string;
  task?: ITask;
  task_template?: ITaskTemplate;
  priority?: IPriority;
  professions?: IProfession[] | [];
  assignees?: IUser[] | [];
  description: string;
  created_by: IUser;
  created_at: string;
}
interface IPlacement {
  id: number;
  name: string;
  link?: string;
  accounts?: IAccount[];
}
interface IChecklist {
  id: number;
  name: string;
  order: number | string;
  is_completed: number | string;
  completed_by: IUser;
  completed_at: string;
  guides: IGuideType[];
  checklist_item_id: number | string;
  placement?: IPlacement;
}
interface IStepEdit {
  id: number;
  done: number | string;
  completed_at: string;
  created_by: IUser;
  created_at: string;
  status: IStatus;
  type: string;
  edit: {
    id: number;
    name: string;
    block: { id: number; name: string; table_name: string };
  };
}
interface ITracker {
  end_date: string | null;
  id: number;
  start_date: string;
  step_id: number;
  total_time: string;
  user_id: number;
}
interface IStep {
  id: number;
  name: string;
  assignee: IUser;
  order: number | string;
  is_completed: number | string;
  step_template_id: number | string;
  completed_by: IUser;
  completed_at: string;
  checklists: IChecklist[];
  edit_progress: IStepEdit[];
  tracker: ITracker | null;
  trackers: ITracker[] | null;
}
interface IEdit {
  id: number;
  name: string;
  created_by: IUser;
  created_at: string;
  block?: IBlock;
}

interface IMilestone {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  tasks: ITask[];
  expected_hours: string;
  milestone_template_id: number;
}
interface ITask {
  is_completed: number | string;
  id: number;
  title: string;
  parent_tasks: ITask[];
  task_template: ITaskTemplate;
  status: IStatus;
  inner_client: IInnerClient;
  start_date: string;
  due_date: string;
  priority: IPriority;
  parent_task_results: {
    id: number;
    model_id: number;
    result: string;
    model: string;
  }[];
  total_time: number | string;
  created_by: IUser;
  created_at: string;
  note: string;
  assignees: IUser[];
  professions: IProfession[];
  controllers: IUser[];
  steps: IStep[];
}
interface IGuideFormatType {
  id: number;
  link: string;
  format: IFormats;
  object: IObject;
  description: string;
}

interface IChecklistItemType {
  id: number;
  name: string;
  link: string;
  is_draft?: number;
  tool: {
    id: number;
    name: string;
    link: string;
  };
  action: IAction;
  object: IObject;
  guides: {
    id: number;
    name: string;
    tools: ITool[];
    objects: IObject[];
    entites: IEntity[];
    guide_formats: IGuideFormatType[];
  }[];
  placement: IPlacement;
  created_by: IUser;
  created_at: string;
  updated_at: string;
}
interface IStepTemplate {
  id: number;
  name: string;
  hours_planned?: string;
  is_draft?: number;
  description: string;
  tool?: {
    id: number;
    name: string;
    link: string;
  };
  object?: {
    id: number;
    name: string;
  };
  action?: {
    id: number;
    name: string;
  };
  checklist_items: IChecklistItemType[];
  created_by?: IUser;
  created_at: string;
}
interface ITaskTemplate {
  id: number;
  description: string;
  name: string;
  is_draft?: number;
  cost: number | string;
  task_quantity: number | string;
  expected_hours: number | string;
  frequency: IFrequenciesType;
  professions: IProfession[];
  task_templates?: ITaskTemplate;
  parent_task_templates: Array<{
    id: number;
    name: string;
  }>;
  step_templates: IStepTemplate[];
  created_by?: IUser;
  created_at: string;
  action: any;
  object: any;
  tool: any;
}
interface IJobAccount {
  id: number;
  name: string;
  profile_link: string;
  jobSite: IJobSite;
  login: string;
  password: string;
  status: IStatus;
  innerClient: IInnerClient;
  active_job_posts: number;
  verifications?: IJobAccount[];
  users?: IUser[];
  note: string;
  createdBy: IUser;
  created_at: string;
  tool: ITool;
  owner: IUser;
  available_job_posts?: number;
}

interface IJobSite {
  id: number;
  name: string;
  countries?: ICountry[];
  languages?: ILanguage[];
  website?: string;
  note: string;
  created_at: string;
  createdBy: IUser;
}

interface IMessage {
  id: number;
  title: string;
  text: string;
}

interface IJACommunication {
  id: number | string;
  job_application?: {
    id: number;
    name: string;
  };
  channel?: any;
  account?: IAccount;
  account_id?: number | string;
  communication_type?: ICommunicationType;
  communication_type_id: number | string;
  followup_date: string;
  followup_time: string;
  note: string;
  created_at?: string;
  created_by?: IUser;
  messages: IMessage[] | number[];
}
interface ISalaryType {
  name: string;
  id: number;
}

interface IJobPost {
  id: number;
  name: string;
  slug: string;
  published_site: number;
  job_account: {
    id: number;
    name: string;
    profile_link: string;
  };
  publish_date: string;
  end_date?: string;
  status: IStatus;
  link: string;
  country: ICountry;
  city: ICity;
  shift: IShift;
  translation: ILanguage;
  post_template: {
    id: number;
    title: string;
  };
  full_post: string;
  planned_date: string;
  published_by: IUser;
  cost: number;
  currency: {
    id: number;
    name: string;
    iso3: string;
    symbol: string;
  };
  created_by: IUser;
  created_at: string;
  sum_jas: number;
  contact_accounts: {
    id: number;
    name: string;
    link: string;
  }[];
  account?: {
    id: number;
    name: string;
    link: string;
  };
  inner_client?: {
    id: number;
    name: string;
    website: string;
  };
}

interface IJobApplication {
  id: number | string;
  name: string;
  country: ICountry;
  city: ICity;
  gender: string;
  status: IStatus;
  manager: IUser;
  notes: string;
  created_by: IUser;
  created_at: string;
  is_talent: number;
  contacts: IContact[];
  job_requests: IJobRequestType[];
  ja_communications: ICommunicationType[];
  job_posts: IJobPost[];
  candidate_url: string;
  employee_url: string;
  presale_url: string;
  job_application_url: string;
}

interface ICVType {
  id: number;
  name: string;
}

interface IContentType {
  id: number;
  name: string;
}

interface IShortUser {
  id: number;
  name: string;
  image: string;
}

type Gender = 'male' | 'female' | 'unknown';
interface ICandidateShort {
  id: number;
  job_application_url: string | null;
  employee_url: string | null;
  candidate_url: string | null;
  presale_url: string | null;
  user: IShortUser;
  is_student: number;
  age: number;
  birthday: string;
  city: {
    id: number;
    city_id: number;
    name: string;
  };
  country: {
    id: number;
    country_id: number;
    name: string;
    image: string;
    iso2: string;
    iso3: string;
  };
  gender: Gender;
  job_application: {
    id: number;
    name: string;
    gender: Gender;
  };
  names: {
    id: number;
    name: string;
    translation: {
      id: number;
      language_id: number;
      iso2: string;
      iso3: string;
      name: string;
    };
  }[];
  short_name: string;
  slug: string;
  talents: ITalent;
}

interface IEmployeeShort extends ICandidateShort {
  talents: IEmployeeTalent;
}

interface IPresaleShort extends ICandidateShort {
  talents: IEmployeeTalent;
}

interface IShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface IInnerClientShort {
  id: number;
  name: string;
  website: string;
}

interface IProfessionPriority {
  id: number;
  profession: {
    id: number;
    profession_id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
    color: string;
  };
}

interface IRates {
  id: number;
  rate: {
    id: number;
    name: string;
    value: number;
    hours: number;
  };
  shift: IShift;
  inner_client: IInnerClientShort;
  start_date: string;
  end_date: string | null;
}
interface ISalary {
  id: number;
  value: number;
  hourly_cost: number;
  currency: ICurrencies;
  hourly_currency: ICurrencies;
  start_date: string;
  end_date: string | null;
  salary_type: ISalaryType;
}

interface ITalent {
  task_templates: any;
  id: number;
  end_date: string | null;
  created_at: string;
  created_by: IShortUser | null;
  inner_client?: IInnerClientShort;
  managers: IShortUser[];
  professions: IProfessionPriority[];
  rates: IRates[];
  objects: IObject[];
  salaries: ISalary[];
  responsibilities: {
    id: number;
    name: string;
    action: {
      id: number;
      action_id: number;
      name: string;
    };
  }[];
  shift: IShift;
  status: IStatus;
  tools: ITool[];
  links?: ILink[];
}

interface IPrice {
  id: number;
  value: number;
  currency: {
    id: number;
    name: string;
    iso3: string;
    symbol: string;
  };
  rate: {
    id: number;
    name: string;
    value: number;
    hours: number;
  };
  start_date: string;
  end_date: string | null;
}

interface IEmployeeTalent extends ITalent {
  contract_url: string;
  prices: IPrice[];
}

interface ILanguageLevel {
  id: number;
  level: {
    id: number;
    level_id: number;
    name: string;
    short_name: string;
  };
  language: {
    id: number;
    language_id: number;
    name: string;
    iso2: string;
    iso3: string;
    image: string | null;
  };
}

interface IContents {
  id: number;
  value: string;
  content_type: {
    id: number;
    name: string;
  };
}

interface ICV {
  id: number;
  company_name: string;
  specialisation?: string;
  note?: string;
  country: {
    id: number;
    country_id: number;
    name: string;
    image: string;
    iso2: string;
    iso3: string;
  };
  start_date: string;
  end_date?: string;
  cv_type: {
    id: number;
    name: string;
  };
  professions: {
    id: number;
    profession_id: number;
    name: string;
  }[];
  industries: {
    id: number;
    industry_id: number;
    name: string;
  }[];
  sub_industries: {
    id: number;
    sub_industry_id: number;
    name: string;
  }[];
}

interface ICandidate extends ICandidateShort {
  languages: ILanguageLevel[];
  cvs: ICV[];
  contents: IContents[];
  contacts: {
    id: number;
    value: string;
    tool: {
      id: number;
      name: string;
      link: string;
    };
  }[];
}

interface IEmployee extends IEmployeeShort {
  languages: ILanguageLevel[];
  cvs: ICV[];
  contents: IContents[];
  contacts: {
    id: number;
    value: string;
    tool: {
      id: number;
      name: string;
      link: string;
    };
  }[];
}

interface ILink {
  id: number;
  name: string;
  description?: string;
  url: string;
  tool: {
    id: number;
    name: string;
    link: string;
  };
  inner_client: {
    id: number;
    name: string;
    link: string;
  };
  object: IObject;
  owner: IUser;
  status: IStatus;
  format: {
    id: number;
    name: string;
  };
  professions: {
    id: number;
    name: string;
    profession_id: number;
  }[];
  created_by: IShortUser;
  created_at: string;
  updated_at: string;
}

interface IGPT {
  id: number;
  name: string;
  link: string;
  type: string;
  owner: IUser;
  custom_instructions_link: string;
  entities: Array<IOption>;
  tools: ITool[];
  task_templates: IObjectAction[];
  links: { id: number; name: string }[];
  created_by: IShortUser;
  created_at: string;
}

interface IPosition {
  id: number;
  item_id: number;
  name: string;
  status: IStatus;
  priority: IPriority;
  library: ILibrary;
  position_id: 9;
  description?: string;
  translation: ILanguage;
  created_by: IShortUser;
  created_at: string;
}
