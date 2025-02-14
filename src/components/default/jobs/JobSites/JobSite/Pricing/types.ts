import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export interface IPricing {
  id: number;
  job_site: {
    id: 2;
    name: string;
    website: string;
  };
  pricing_type: {
    id: number;
    name: string;
  };
  package_name: string;
  price: number;
  currency: {
    id: number;
    name: string;
    iso3: string;
    symbol: string;
  };
  created_at: string;
  created_by: IUser;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IPricingsFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IPricingsFilters {
  pricing_types?: IPricingsFilter;
  currencies?: IPricingsFilter;
  created_by?: IPricingsFilter;
  createdAt?: IPricingsFilter;
  createdAtEndDate?: string;
}

export interface IViewProps {
  id: number;
  rows: Array<IPricing>;
  view: string;
  searchValue: string;
  loading?: boolean;
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
  isSmall?: boolean;
  changeDescription: (newDescription: string) => void;
}
