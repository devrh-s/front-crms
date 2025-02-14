import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ILanguagesFilters, IReportLanguages } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IReportLanguages[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ILanguagesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

const dateInitial: IDateFilter = {
  value: {
    start: dayjs().startOf('month'),
    end: dayjs().endOf('month'),
  },
  mode: 'standard',
};

export default function LanguagesFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [languagesFilter, setLanguagesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionFilter, setActionFilter] = useState<IFilter>({
    value: '',
  });

  const languages = commonData.languages ?? [];
  const actions = commonData.actions ?? [];

  const generateFiltersData = () => {
    const filters: ILanguagesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.created_at = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(languagesFilter)) {
      filters.languages = {
        data: languagesFilter.value,
        mode: languagesFilter.mode,
      };
    }
    if (actionFilter.value && actionFilter.value !== 'ALL') {
      filters.action = actionFilter.value as string;
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setLanguagesFilter({ value: [], mode: 'standard' });
    setActionFilter({ value: '' });
    generateFiltersData();
  };

  useEffect(() => {
    generateFiltersData();
  }, [createdAt, languagesFilter, actionFilter]);

  return (
    <FiltersDrawer
      title='Languages'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
      <MultipleSelectFilter
        filter={languagesFilter}
        label='Languages'
        options={languages}
        handleChangeFilter={createFilterHandler(setLanguagesFilter)}
      />
      <SingleSelectFilter
        label='Action'
        filter={actionFilter}
        options={actions}
        handleChangeFilter={createFilterHandler(setActionFilter)}
        width='83%'
      />
    </FiltersDrawer>
  );
}
