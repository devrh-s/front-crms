import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue, createDateFilterHandler } from '@/lib/helpers';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}
interface IApiFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export interface ICVsFilters {
  cv_types?: IApiFilter;
  countries?: IApiFilter;
  professions?: IApiFilter;
  industries?: IApiFilter;
  sub_industries?: IApiFilter;
  start_date?: IApiFilter;
  end_date?: IApiFilter;
}

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ICVsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

const getDateDefault = (): IDateFilter => ({
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
});

export default function CVsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [cvTypeFilter, setCvTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [countriesFilter, setCountriesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [industriesFilter, setIndustriesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [subIndustriesFilter, setSubIndustriesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [startDate, setStartDate] = useState<IDateFilter>(getDateDefault);
  const [endDate, setEndDate] = useState<IDateFilter>(getDateDefault);

  const clearFilters = () => {
    setCvTypeFilter({ value: [], mode: 'standard' });
    setCountriesFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setIndustriesFilter({ value: [], mode: 'standard' });
    setSubIndustriesFilter({ value: [], mode: 'standard' });
    setStartDate(getDateDefault());
    setEndDate(getDateDefault());
    handleSetFilters({});
  };

  useEffect(() => {
    const generateFiltersData = () => {
      const filters: ICVsFilters = {};

      if (checkFilterValue(cvTypeFilter)) {
        filters.cv_types = {
          data: cvTypeFilter.value,
          mode: cvTypeFilter.mode,
        };
      }
      if (checkFilterValue(countriesFilter)) {
        filters.countries = {
          data: countriesFilter.value,
          mode: countriesFilter.mode,
        };
      }
      if (checkFilterValue(professionsFilter)) {
        filters.professions = {
          data: professionsFilter.value,
          mode: professionsFilter.mode,
        };
      }
      if (checkFilterValue(industriesFilter)) {
        filters.industries = {
          data: industriesFilter.value,
          mode: industriesFilter.mode,
        };
      }
      if (checkFilterValue(subIndustriesFilter)) {
        filters.sub_industries = {
          data: subIndustriesFilter.value,
          mode: subIndustriesFilter.mode,
        };
      }
      if (checkFilterValue(startDate)) {
        filters.start_date = {
          data: {
            start: startDate?.value?.start?.format('DD-MM-YYYY'),
            end: startDate?.value?.end?.format('DD-MM-YYYY'),
          },
          mode: startDate.mode,
        };
      }
      if (checkFilterValue(endDate)) {
        filters.end_date = {
          data: {
            start: endDate?.value?.start?.format('DD-MM-YYYY'),
            end: endDate?.value?.end?.format('DD-MM-YYYY'),
          },
          mode: endDate.mode,
        };
      }
      handleSetFilters(filters);
    };

    generateFiltersData();
  }, [
    cvTypeFilter,
    countriesFilter,
    professionsFilter,
    industriesFilter,
    subIndustriesFilter,
    startDate,
    endDate,
  ]);

  return (
    <FiltersDrawer
      title='CVs'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Start date'
        filter={startDate}
        handleChangeFilter={createDateFilterHandler(setStartDate)}
      />
      <CustomCalendar
        label='End Date'
        filter={endDate}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />
      <MultipleSelectFilter
        filter={cvTypeFilter}
        label='CV Types'
        options={commonData.cv_types ?? []}
        handleChangeFilter={createFilterHandler(setCvTypeFilter)}
      />
      <MultipleSelectFilter
        filter={countriesFilter}
        label='Countries'
        options={commonData.countries ?? []}
        handleChangeFilter={createFilterHandler(setCountriesFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={commonData.professions ?? []}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={industriesFilter}
        label='Industries'
        options={commonData.industries ?? []}
        handleChangeFilter={createFilterHandler(setIndustriesFilter)}
      />
      <MultipleSelectFilter
        filter={subIndustriesFilter}
        label='Sub Industries'
        options={commonData.sub_industries ?? []}
        handleChangeFilter={createFilterHandler(setSubIndustriesFilter)}
      />
    </FiltersDrawer>
  );
}
