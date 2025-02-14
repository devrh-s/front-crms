export interface IColumn {
  id: number | string;
  name: string;
  required: string;
}

export interface IImportData {
  columns: IColumn[] | string[];
  file?: string;
  hasHeading: boolean;
  heading?: string[];
  excelData?: any[];
}

export interface IImportState {
  step: number;
  data: IImportData | null;
  loading: boolean;
  skipped: number[];
  error: string | null;
}
