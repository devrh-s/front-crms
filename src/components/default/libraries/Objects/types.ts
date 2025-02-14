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

export interface IViewProps {
  rows: Array<IObject>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
interface IDataFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export interface IObjectsFilters {
  groups?: IDataFilter;
  translations?: IDataFilter;
  statuses?: IDataFilter;
  priority?: string | number[];
  guides?: IDataFilter;
  task_templates?: IDataFilter;
  professions?: IDataFilter;
  formats?: IDataFilter;
  createdAt?: IDataFilter;
  created_by?: IFilter;
}
export type ObjectsFields =
  | 'name'
  | 'formats'
  | 'links'
  | 'status_id'
  | 'priority_id'
  | 'library_id'
  | 'description'
  | 'translation_id'
  | 'reason';

export interface IFormInputs {
  name: string;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number | string;
  formats: number[];
  links: [];
  reason: string;
  description: string;
  image_icon: any;
}

export interface IObjectsActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
