import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export interface IVerificationAccount {
  id: number;
  job_account: IJobAccount;
}

interface IFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IVerificationAccountFilters {
  owners?: IFilter;
  statuses?: IFilter;
  tools?: IFilter;
}

export interface IViewProps {
  rows: Array<IVerificationAccount>;
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
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
