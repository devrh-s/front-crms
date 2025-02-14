import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export interface IShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface IViewProps {
  rows: Array<IShift>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters?: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean;
}
