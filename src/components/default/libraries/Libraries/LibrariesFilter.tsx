import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { ILibrariesFilters, ILibrary } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import LibrariesFilters from '@/components/default/common/filters/LibrariesFilters';
import { Dayjs } from 'dayjs';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: ILibrary[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ILibrariesFilters) => void;
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

export default function LibrariesFilter({
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
  const [entityFilter, setEntityFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [groupFilter, setGroupFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [languageFilter, setLanguageFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [prioritiesFilter, setPrioritiesFilter] = useState<IFilter>({
    value: 'all',
  });

  const entities = commonData.entities ?? [];

  const generateFiltersData = () => {
    const filters: ILibrariesFilters = {};
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
    if (checkFilterValue(entityFilter)) {
      filters.entities = {
        data: entityFilter.value,
        mode: entityFilter.mode,
      };
    }
    if (checkFilterValue(groupFilter)) {
      filters.libraries = {
        data: groupFilter.value,
        mode: groupFilter.mode,
      };
    }
    if (checkFilterValue(languageFilter)) {
      filters.translations = {
        data: languageFilter.value,
        mode: languageFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
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
    setEntityFilter({ value: [], mode: 'standard' });
    setGroupFilter({ value: [], mode: 'standard' });
    setLanguageFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setPrioritiesFilter({ value: 'all' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    createdByFilter,
    entityFilter,
    groupFilter,
    languageFilter,
    statusesFilter,
    prioritiesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Libraries'
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
        filter={entityFilter}
        label='Entities'
        options={entities}
        handleChangeFilter={createFilterHandler(setEntityFilter)}
      />
    </FiltersDrawer>
  );
}
