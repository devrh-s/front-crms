import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export interface IAccountUser {
  id: number;
  user: IUser;
  start_date: string;
  end_date: string;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IAccountUserFilters {
  startDate?: IFilter;
  endDate?: IFilter;
  users?: IFilter;
}

export interface IViewProps {
  rows: Array<IAccountUser>;
  view: string;
  searchValue: string;
  loading?: boolean;
  url?: string;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
  handleActions: (visible: boolean, id?: number | null) => void;
}
