import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { IDeparmentFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import LibrariesFilters from '@/components/default/common/filters/LibrariesFilters';
import { Dayjs } from 'dayjs';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IDepartment[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IDeparmentFilters) => void;
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

export default function DepartmentsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [languageFilter, setLanguageFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [groupFilter, setGroupFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [prioritiesFilter, setPrioritiesFilter] = useState<IFilter>({
    value: 'all',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const professions = commonData.professions ?? [];

  const generateFiltersData = () => {
    const filters: IDeparmentFilters = {};
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
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(languageFilter)) {
      filters.translations = {
        data: languageFilter.value,
        mode: languageFilter.mode,
      };
    }
    if (checkFilterValue(groupFilter)) {
      filters.groups = {
        data: groupFilter.value,
        mode: groupFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (prioritiesFilter.value && prioritiesFilter.value !== 'all') {
      filters.priority = prioritiesFilter.value as string;
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setLanguageFilter({ value: [], mode: 'standard' });
    setGroupFilter({ value: [], mode: 'standard' });
    setPrioritiesFilter({ value: 'all' });
    setProfessionsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    createdByFilter,
    statusesFilter,
    groupFilter,
    prioritiesFilter,
    languageFilter,
    professionsFilter,
  ]);

  return (
    <FiltersDrawer
      title='Departments'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <LibrariesFilters
        commonData={commonData}
        groupFilter={groupFilter}
        languageFilter={languageFilter}
        statusesFilter={statusesFilter}
        prioritiesFilter={prioritiesFilter}
        createdAt={createdAt}
        setCreatedAt={setCreatedAt}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        setLanguageFilter={setLanguageFilter}
        setStatusesFilter={setStatusesFilter}
        setGroupFilter={setGroupFilter}
        setPrioritiesFilter={setPrioritiesFilter}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
    </FiltersDrawer>
  );
}
