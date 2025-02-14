import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { ILanguageLevelInput } from '../../common/form/LanguageLevelInputs/LanguageLevelInputs';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IJobRequestFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export type JobRequestsFields =
  | 'name'
  | 'rate_id'
  | 'shift_id'
  | 'inner_client_id'
  | 'profession_id'
  | 'manager_id'
  | 'close_date'
  | 'demand_date'
  | 'note'
  | 'jobTemplates'
  | 'reason'
  | 'quantity'
  | 'status_id'
  | 'tools'
  | 'languages'
  | 'task_templates';

export interface IFormInputs {
  name: string;
  rate_id: number | string;
  shift_id: number | string;
  inner_client_id: number | string;
  quantity: number | string;
  profession_id: number | string;
  manager_id: number | string;
  close_date: string | Dayjs | null;
  demand_date: string | Dayjs | null;
  note: string;
  jobTemplates: number[];
  task_templates: number[];
  tools: number[];
  reason: string;
  status_id: number | string;
  languages: ILanguageLevelInput[];
}

export interface IJobRequestsActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export interface IJobRequestsFilters {
  departments?: IJobRequestFilter;
  professions?: IJobRequestFilter;
  jobTemplates?: IJobRequestFilter;
  tools?: IJobRequestFilter;
  actions?: IJobRequestFilter;
  objects?: IJobRequestFilter;
  task_templates?: IJobRequestFilter;
  innerClients?: IJobRequestFilter;
  managers?: IJobRequestFilter;
  rates?: IJobRequestFilter;
  shifts?: IJobRequestFilter;
  statuses?: IJobRequestFilter;
  created_by?: IJobRequestFilter;
  createdAt?: IJobRequestFilter;
  closeDate?: IJobRequestFilter;
  demandDate?: IJobRequestFilter;
}

export interface IViewProps {
  rows: Array<IJobRequestType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
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
  isSmall?: boolean;
}
