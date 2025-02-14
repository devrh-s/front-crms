import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}
export interface IViewProps {
  rows: Array<IEdit>;
  url?: string;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  hideToolbarFilters?: boolean;
  commonData?: ICommonData;
  isSmall?: boolean;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
}
interface IContactsFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IEditProgress {
  id: number;
  edit_progress?: string | null;
  created_at: string;
  created_by: IUser;
  done: number;
  edit: IOption;
  status?: IOption;
  type: string;
  completed_at?: string;
}

export interface IEditsFilters {
  blocks?: IContactsFilter;
  created_by?: IContactsFilter;
  createdAt?: IContactsFilter;
}

export interface IEditProfile {
  id: number;
  name: string;
  created_at: string;
  created_by: IUser;
  description?: string;
  edit_progress: IEditProgress[];
}
