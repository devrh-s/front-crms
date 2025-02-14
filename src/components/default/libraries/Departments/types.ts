import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IDeparmentFilters {
  statuses?: IFilter;
  translations?: IFilter;
  groups?: IFilter;
  priority?: string;
  professions?: IFilter;
  createdAt?: IFilter;
  createdAtEnd?: string | null;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<IDepartment>;
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
export type DepartmentFields =
  | 'name'
  | 'status_id'
  | 'library_id'
  | 'translation_id'
  | 'priority_id'
  | 'professions'
  | 'links'
  | 'description'
  | 'color';

export interface IFormInputs {
  name: string;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number;
  professions: number[];
  links: [];
  color?: string;
  description: string;
  image_icon: any;
  reason: string;
}

export interface IDepartmentActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
