export interface IChartContainerProps {
  title: string;
  label: string;
  toggles: string[];
  chartData: any;
  isHorizontal?: boolean;
  isStack?: boolean;
  isLine?: boolean;
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IJobDashboardFilter {
  data: number[] | string | IDateFilterValues;
}

export interface IJobDashboardFilters {
  period?: IJobDashboardFilter;
}

export interface IFiltersProps {
  open: boolean;
  handleSetFilters: (newFilters: IJobDashboardFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export enum Toggles {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export const colors = [
  '#4A90E2',
  '#50E3C2',
  '#9013FE',
  '#2B89BC',
  '#8EEDFC',
  '#6A89CC',
  '#5B9DFE',
  '#1F6F8B',
  '#76A5AF',
  '#3B5998',
];
