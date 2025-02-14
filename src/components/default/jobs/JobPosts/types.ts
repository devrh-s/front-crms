import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export type JobPostFields =
  | 'name'
  | 'job_account_id'
  | 'publish_date'
  | 'status_id'
  | 'link'
  | 'country_id'
  | 'city_id'
  | 'post_template_id'
  | 'account_id'
  | 'planned_date'
  | 'published_by'
  | 'cost'
  | 'currency_id'
  | 'contact_accounts'
  | 'full_post'
  | 'shift_id'
  | 'end_date';

export interface IFormInputs {
  name: string;
  slug: string;
  published_site: number | string;
  job_account_id?: number | string;
  account_id?: number | string;
  publish_date: string;
  status_id: number | '';
  link: string;
  country_id: number | '';
  city_id: number | '';
  post_template_id?: number | string;
  planned_date: string;
  published_by: number | '';
  cost: string;
  shift_id: number | '';
  currency_id: number | '';
  contact_accounts: number[];
  full_post: string;
  end_date: string;
}

export interface IJobPostActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IJobPostFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IJobPostsFilters {
  accounts?: IJobPostFilter;
  job_accounts?: IJobPostFilter;
  createdAtStart?: string | null;
  createdAtEnd?: string | null;
  published_by?: IJobPostFilter;
  created_by?: IJobPostFilter;
  published_site?: string;
  statuses?: IJobPostFilter;
  currencies?: IJobPostFilter;
  translations?: IJobPostFilter;
  cities?: IJobPostFilter;
  shifts?: IJobPostFilter;
  countries?: IJobPostFilter;
  post_templates?: IJobPostFilter;
  job_templates?: IJobPostFilter;
  contact_accounts?: IJobPostFilter;
  publishDate?: IJobPostFilter;
  plannedDate?: IJobPostFilter;
  endDate?: IJobPostFilter;
  inner_clients?: IJobPostFilter;
}

export interface IViewProps {
  rows: Array<IJobPost>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  url?: string;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
