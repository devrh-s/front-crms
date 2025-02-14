import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IPassHistory {
  id: number;
  password: string;
  created_at: string;
  next_change_date: string;
}

export interface IPassHistoryFilters {
  createdAt?: IFilter;
  nextChangeDate?: IFilter;
}

export interface IViewProps {
  rows: Array<IPassHistory>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  isSmall?: boolean | undefined;
}
