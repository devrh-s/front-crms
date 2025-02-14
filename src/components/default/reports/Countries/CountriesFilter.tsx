import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ICountriesFilters, IReportCountry } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IReportCountry[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ICountriesFilters) => void;
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

export default function CountriesFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [countryFilter, setCountryFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionFilter, setActionFilter] = useState<IFilter>({
    value: '',
  });

  const countries = commonData.countries ?? [];
  const actions = commonData.actions ?? [];

  const generateFiltersData = () => {
    const filters: ICountriesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.created_at = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(countryFilter)) {
      filters.countries = {
        data: countryFilter.value,
        mode: countryFilter.mode,
      };
    }
    if (checkFilterValue(countryFilter)) {
      filters.countries = {
        data: countryFilter.value,
        mode: countryFilter.mode,
      };
    }
    if (actionFilter.value && actionFilter.value !== 'ALL') {
      filters.action = actionFilter.value as string;
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCountryFilter({ value: [], mode: 'standard' });
    setActionFilter({ value: '', mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, countryFilter, actionFilter]);

  return (
    <FiltersDrawer
      title='Countries'
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
        filter={countryFilter}
        label='Countries'
        options={countries}
        handleChangeFilter={createFilterHandler(setCountryFilter)}
      />
      <SingleSelectFilter
        label='Action'
        filter={actionFilter}
        options={actions}
        handleChangeFilter={createFilterHandler(setActionFilter)}
        width='87%'
      />
    </FiltersDrawer>
  );
}
