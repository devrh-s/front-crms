import { ReactElement } from 'react';

export interface IBookmark {
  name: string;
  color: string;
  icon: ReactElement;
  error: boolean;
  disabled: boolean;
}

export interface ITabBookmark {
  front_name: string;
  icon: string;
  id: number;
  name: string;
  tooltip: string;
  color: string;
}
