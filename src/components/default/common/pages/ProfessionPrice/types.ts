import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IProfessionPrice {
  id: number;
  start_date: string;
  end_date: string;
  currency: any;
  value: string;
  rate: any;
}

export interface IProfessionPriceFilters {
  startDate?: IFilter;
  endDate?: IFilter;
  rates?: IFilter;
  currencies?: IFilter;
}

export interface IViewProps {
  rows: Array<IProfessionPrice>;
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
