import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, MouseEvent } from 'react';

export interface ITableType {
  table_name: string;
  rows_count: number;
  size_mb: string;
  last_id: number;
  type_id: number;
}

export interface IViewProps {
  view: string;
  rows: Array<ITableType>;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView?: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
}
