import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export type LevelType = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ILevelsColors {
  A0: string;
  A1: string;
  A2: string;
  B1: string;
  B2: string;
  C1: string;
  C2: string;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ILevel {
  id: number;
  level_id: number;
  name: string;
  short_name: string;
  created_at: string;
  translation: ILanguage;
  description?: string;
  status: IStatus;
  priority: IPriority;
  library: ILibrary;
  created_by: IUser;
}

interface ILevelFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ILevelsFilters {
  countries?: ILevelFilter;
  groups?: ILevelFilter;
  translations?: ILevelFilter;
  statuses?: ILevelFilter;
  priority?: string;
  createdAt?: ILevelFilter;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<ILevel>;
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
  levelColors: ILevelsColors;
  isSmall?: boolean;
}
