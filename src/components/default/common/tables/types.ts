import {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export interface ITableProps {
  rows: any;
  columns: GridColDef[];
  view?: any;
  rowCount?: number;
  searchValue?: string;
  loading?: boolean;
  pageName: string;
  hideCheckboxes?: boolean;
  paginationModel?: GridPaginationModel;
  colHeaderHeight?: number;
  styles?: any;
  pinnedColumns?: { left?: Array<string>; right?: Array<string> };
  columnVisibilityModel?: GridColumnVisibilityModel;
  hideToolbarColumns?: boolean;
  hideToolbarFilters?: boolean;
  hideToolbarSearch?: boolean;
  hideToolbarViewToggle?: boolean;
  multiDeletePermission?: boolean;
  availableImport?: boolean;
  availableExport?: boolean;
  showBoard?: boolean;
  commonData?: ICommonData;
  showCalendar?: boolean;
  isSmall?: boolean | undefined;
  rowHeight?: number | 'auto' | undefined;
  availableAdd?: boolean;
  isAllSelectable?: boolean;
  disableColumnSorting?: boolean;
  handleSortModelChange?: (sortModel: GridSortModel) => void;
  handlePagination?: (newPaginationModel: GridPaginationModel) => void;
  toggleFilters?: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView?: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal?: (open: boolean, ids?: number[] | null) => void;
  handleActions?: (visible: boolean, id?: number | null) => void;
  handleSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
}
