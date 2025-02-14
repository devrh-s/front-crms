import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IEntityTypeFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IEntitiesFilters {
  entity_types?: IEntityTypeFilter;
  blocks?: IEntityTypeFilter;
}

export interface IViewProps {
  rows: Array<IEntityType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean;
}
