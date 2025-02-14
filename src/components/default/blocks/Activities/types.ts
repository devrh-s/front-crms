import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export interface IActivity {
  id: number;
  user: IUser;
  timestamp: string;
  action: string;
  url: { id: string; title: string };
  entityBlock: any;
  description: string;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IActivityFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IActivitiesFilters {
  users?: IActivityFilter;
  actions?: IActivityFilter;
  blocks?: IActivityFilter;
  entities?: IActivityFilter;
  createdAt?: IActivityFilter;
}

export interface IViewProps {
  rows: Array<IActivity>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  changeDescription: (newDescription: string) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
  fullScreen?: boolean;
}
