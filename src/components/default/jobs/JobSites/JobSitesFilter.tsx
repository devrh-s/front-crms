import { useState, useEffect } from 'react';
import {} from '@mui/material';
import { IJobSitesFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobSitesFilters) => void;
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

export default function JobSitesFilter({
  open,
  commonData,
  toggleFilters,
  handleSetFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [countryFilter, setCountryFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [languageFilter, setLanguageFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const countries = commonData.countries ?? [];
  const languages = commonData.languages ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IJobSitesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(countryFilter)) {
      filters.countries = {
        data: countryFilter.value,
        mode: countryFilter.mode,
      };
    }
    if (checkFilterValue(languageFilter)) {
      filters.languages = {
        data: languageFilter.value,
        mode: languageFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
    setCountryFilter({ value: [], mode: 'standard' });
    setLanguageFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
  }, [createdAt, createdByFilter, countryFilter, languageFilter]);

  return (
    <FiltersDrawer
      title='Job Sites'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={countryFilter}
        label='Countries'
        options={countries}
        handleChangeFilter={createFilterHandler(setCountryFilter)}
      />
      <MultipleSelectFilter
        filter={languageFilter}
        label='Language'
        options={languages}
        handleChangeFilter={createFilterHandler(setLanguageFilter)}
      />
      <MultipleSelectFilter
        label='Created By'
        filter={createdByFilter}
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
