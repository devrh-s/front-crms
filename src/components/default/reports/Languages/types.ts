import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';

export interface IReportLanguages {
  id?: number;
  name?: string;
  language?: ILanguage;
  country?: ICountry;
  total: {
    js: string;
    ja: string;
    jp: string;
  };
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ILanguagesFilters {
  languages?: IFilter;
  action?: string;
  created_at?: IFilter;
}

export interface IViewProps {
  rows: Array<IReportLanguages>;
  view: string;
  searchValue: string;
  dynamicColNames?: string[];
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
}
