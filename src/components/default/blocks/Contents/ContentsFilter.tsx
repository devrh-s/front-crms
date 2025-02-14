import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IApiFilter {
  data: number[] | string;
  mode?: FilterMode;
}
export interface IContentsFilters {
  content_types?: IApiFilter;
}

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IContentsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function ContentsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [contentTypeFilter, setContentTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const generateFiltersData = () => {
    const filters: IContentsFilters = {};

    if (checkFilterValue(contentTypeFilter)) {
      filters.content_types = {
        data: contentTypeFilter.value,
        mode: contentTypeFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setContentTypeFilter({ value: [], mode: 'standard' });
    handleSetFilters({});
  };

  useEffect(() => {
    generateFiltersData();
  }, [contentTypeFilter]);

  return (
    <FiltersDrawer
      title='Contents'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={contentTypeFilter}
        label='Content Type'
        options={commonData.content_types ?? []}
        handleChangeFilter={createFilterHandler(setContentTypeFilter)}
      />
    </FiltersDrawer>
  );
}
