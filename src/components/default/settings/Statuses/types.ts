import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, Dispatch, KeyboardEvent, MouseEvent, SetStateAction } from 'react';

export interface IViewProps {
  rows: Array<IStatus>;
  view: string;
  searchValue: string;
  loading?: boolean;
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
interface IToolsFilter {
  data: number[] | string;
  mode?: FilterMode;
}
export interface IEntityBlockFilters {
  entities?: IToolsFilter;
  blocks?: IToolsFilter;
}

export interface IEntityInfo {
  name: string;
  status_id: number;
  id: number;
  is_default: number;
  order: number;
}

export interface IEntityInfoProps extends IEntityInfo {
  setInfoModal: Dispatch<SetStateAction<IEntityInfo | null>>;
}
