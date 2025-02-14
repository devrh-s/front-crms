interface IFilter {
  data: number[] | string;
  mode?: FilterMode;
}
export interface ILanguageLevelFilters {
  levels?: IFilter;
}
