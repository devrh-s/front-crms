import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IGuidesFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IGuideFormat {
  id: number | string;
  link: string;
  object_id: number | string;
  format_id: number | string;
  description: string;
}

export interface IGuidesFilters {
  formats?: IGuidesFilter;
  tools?: IGuidesFilter;
  actions?: IGuidesFilter;
  objects?: IGuidesFilter;
  statuses?: IGuidesFilter;
  types?: IGuidesFilter;
  checklist_items?: IGuidesFilter;
  updatedAt?: IGuidesFilter;
  createdAt?: IGuidesFilter;
  created_by?: IGuidesFilter;
}

export interface IViewProps {
  rows: Array<IGuideType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  paginationModel: GridPaginationModel;
  commonData?: ICommonData;
  isSmall?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}
