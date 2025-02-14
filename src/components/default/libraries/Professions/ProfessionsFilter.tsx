import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import LibrariesFilters from '@/components/default/common/filters/LibrariesFilters';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IProfessionFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IProfession[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProfessionFilters) => void;
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

export default function ProfessionsFilter({
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
  const [prioritiesFilter, setPrioritiesFilter] = useState<IFilter>({
    value: 'all',
  });
  const [groupFilter, setGroupFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [departmentFilter, setDepartmentFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolFilter, setToolFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const departments = commonData.departments ?? [];
  const tools = commonData.tools ?? [];
  const taskTemplates = commonData.task_templates ?? [];

  const generateFiltersData = () => {
    const filters: IProfessionFilters = {};
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
    if (prioritiesFilter.value && prioritiesFilter.value !== 'all') {
      filters.priority = prioritiesFilter.value as string;
    }
    if (checkFilterValue(groupFilter)) {
      filters.groups = {
        data: groupFilter.value,
        mode: groupFilter.mode,
      };
    }
    if (checkFilterValue(departmentFilter)) {
      filters.departments = {
        data: departmentFilter.value,
        mode: departmentFilter.mode,
      };
    }
    if (checkFilterValue(toolFilter)) {
      filters.tools = {
        data: toolFilter.value,
        mode: toolFilter.mode,
      };
    }
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setLanguageFilter({ value: [], mode: 'standard' });
    setPrioritiesFilter({ value: 'all' });
    setGroupFilter({ value: [], mode: 'standard' });
    setDepartmentFilter({ value: [], mode: 'standard' });
    setToolFilter({ value: [], mode: 'standard' });
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    createdByFilter,
    statusesFilter,
    languageFilter,
    prioritiesFilter,
    groupFilter,
    departmentFilter,
    toolFilter,
    taskTemplatesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Professions'
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
        filter={departmentFilter}
        label='Department'
        options={departments}
        handleChangeFilter={createFilterHandler(setDepartmentFilter)}
      />
      <MultipleSelectFilter
        filter={toolFilter}
        label='Tool'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolFilter)}
      />
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={taskTemplates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
    </FiltersDrawer>
  );
}
