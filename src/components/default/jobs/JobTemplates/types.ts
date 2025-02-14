import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IJobTemplateFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IJobTemplatesFilters {
  professions?: IJobTemplateFilter;
  similar_professions?: IJobTemplateFilter;
  statuses?: IJobTemplateFilter;
  departments?: IJobTemplateFilter;
  created_by?: IJobTemplateFilter;
  createdAt?: IJobTemplateFilter;
  job_requests?: IJobTemplateFilter;
}

export interface IViewProps {
  rows: Array<IJobTemplate>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  pagePermissions: { [permission: string]: string };
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  handleSetProfile: (profileId: number) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
