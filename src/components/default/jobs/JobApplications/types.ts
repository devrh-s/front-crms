import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { IContactInput } from '../../common/form/ContactInputs/ContactInputs';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IJobApplicationsFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IJobApplicationsFilters {
  countries?: IJobApplicationsFilter;
  cities?: IJobApplicationsFilter;
  statuses?: IJobApplicationsFilter;
  managers?: IJobApplicationsFilter;
  tools?: IJobApplicationsFilter;
  job_posts?: IJobApplicationsFilter;
  job_requests?: IJobApplicationsFilter;
  job_templates?: IJobApplicationsFilter;
  communication_types?: IJobApplicationsFilter;
  professions?: IJobApplicationsFilter;
  genders?: IJobApplicationsFilter;
  createdAt?: IJobApplicationsFilter;
  created_by?: IJobApplicationsFilter;
  birthday?: IJobApplicationsFilter;
}

export interface IViewProps {
  rows: Array<IJobApplication>;
  view: string;
  searchValue: string;
  loading?: boolean;
  commonData?: ICommonData;
  paginationModel: GridPaginationModel;
  isSmall?: boolean | undefined;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  handleActionsCandidate: (visible: boolean, id?: number | null) => void;
  handleActionsEmployee: (visible: boolean, id?: number | null) => void;
  handleActionsPresale: (visible: boolean, id?: number | null) => void;
}
export type JobApplicationFields = 'name';

export interface IFormInputs {
  name: string;
  country_id: number | string;
  city_id: number | string;
  gender: string;
  status_id: string | number;
  manager_id: string;
  notes: string;
  job_posts: number[];
  job_requests: number[];
  contacts: Array<IContactInput>;
  communications: Array<IJACommunication>;
  sources: { name: string; ids: number[] };
  professions: number[];
  birthday: string;
  age: string | number;
  reason: string;
}

export interface IJobApplicationActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
