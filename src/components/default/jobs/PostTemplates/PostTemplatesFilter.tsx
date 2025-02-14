import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import { IPostTemplatesFilters } from './types';
import DateRangeFilter from '../../common/filters/DateRangeFilter';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IProjectTemplate[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IPostTemplatesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}
const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};
export default function ProjectTemplatesFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAtFilter, setCreatedAtFilter] = useState<IDateFilter>(dateInitial);
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [jobTemplatesFilter, setJobTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [translationFilter, setTranslationFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const statuses = commonData.statuses ?? [];
  const job_templates = commonData.job_templates ?? [];
  const languages = commonData.languages ?? [];

  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IPostTemplatesFilters = {};
    if (checkFilterValue(jobTemplatesFilter)) {
      filters.job_templates = {
        data: jobTemplatesFilter.value,
        mode: jobTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(translationFilter)) {
      filters.translations = {
        data: translationFilter.value,
        mode: translationFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(createdAtFilter)) {
      filters.createdAt = {
        data: {
          start: createdAtFilter?.value?.start?.format('DD-MM-YYYY'),
          end: createdAtFilter?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAtFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setJobTemplatesFilter({ value: [], mode: 'standard' });
    setTranslationFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setCreatedAtFilter(dateInitial);
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTemplatesFilter, translationFilter, statusesFilter, createdAtFilter, createdByFilter]);

  return (
    <FiltersDrawer
      title='Post Templates'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={jobTemplatesFilter}
        label='Job Templates'
        options={job_templates}
        handleChangeFilter={createFilterHandler(setJobTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={translationFilter}
        label='Translations'
        options={languages}
        handleChangeFilter={createFilterHandler(setTranslationFilter)}
      />
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />

      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAtFilter as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAtFilter)}
      />
    </FiltersDrawer>
  );
}
