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

interface IDataFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IPositionsFilters {
  groups?: IDataFilter;
  translations?: IDataFilter;
  statuses?: IDataFilter;
  priority?: string | number[];
  createdAt?: IDataFilter;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<IPosition>;
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
  isSmall?: boolean;
}

export type PositionsFields =
  | 'name'
  | 'status_id'
  | 'translation_id'
  | 'priority_id'
  | 'library_id'
  | 'description';

export interface IFormInputs {
  name: string;
  status_id: string | number;
  translation_id: number | string;
  priority_id: number;
  library_id?: number | string;
  description: string;
  reason: string;
  image_icon: any;
}

export interface IPositionsActionsProps {
  id: number | null;
  commonData: ICommonData;
  visible: boolean;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
