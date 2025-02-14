import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export interface ILibrary {
  id?: number;
  name: string;
  entity: IEntity;
  priority: IPriority;
  library: {
    id: number;
    name: string;
  };
  status: IStatus;
  translation: ILanguage;
  created_by: IUser;
  created_at: string;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface ILibraryFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ILibrariesFilters {
  entities?: ILibraryFilter;
  libraries?: ILibraryFilter;
  translations?: ILibraryFilter;
  statuses?: ILibraryFilter;
  priority?: string;
  createdAt?: ILibraryFilter;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<ILibrary>;
  view?: string;
  searchValue: string;
  dynamicColNames?: string[];
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
}
