import { useState, useEffect, MouseEvent, Dispatch, SetStateAction } from 'react';
import { Stack, Typography, Drawer, Theme, IconButton, useMediaQuery, Box } from '@mui/material';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { Dayjs } from 'dayjs';
import UsersFilter from '../../talents/Users/UsersFilter';
import DateRangeFilter from '../../common/filters/DateRangeFilter';

import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import { ITaskRequestsFilters } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: ITaskRequest[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ITaskRequestsFilters) => void;
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

export default function TaskRequestsFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [tasksFilter, setTasksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [prioritiesFilter, setPrioritiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [assigneesFilter, setAssigneesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);

  const task_templates = commonData.task_templates ?? [];
  const users = commonData.users ?? [];
  const priorities = commonData.priorities ?? [];
  const professions = commonData.professions ?? [];
  const tasks = commonData.tasks ?? [];

  const generateFiltersData = () => {
    const filters: ITaskRequestsFilters = {};
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
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(tasksFilter)) {
      filters.tasks = {
        data: tasksFilter.value,
        mode: tasksFilter.mode,
      };
    }
    if (checkFilterValue(prioritiesFilter)) {
      filters.priorities = {
        data: prioritiesFilter.value,
        mode: prioritiesFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(assigneesFilter)) {
      filters.assignees = {
        data: assigneesFilter.value,
        mode: assigneesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
    setTasksFilter({ value: [], mode: 'standard' });
    setPrioritiesFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setAssigneesFilter({ value: [], mode: 'standard' });

    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdByFilter,
    createdAt,
    taskTemplatesFilter,
    tasksFilter,
    prioritiesFilter,
    professionsFilter,
    assigneesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Task Requests'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={task_templates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={tasksFilter}
        label='Tasks'
        options={tasks}
        handleChangeFilter={createFilterHandler(setTasksFilter)}
      />
      <MultipleSelectFilter
        filter={prioritiesFilter}
        label='Priorities'
        options={priorities}
        handleChangeFilter={createFilterHandler(setPrioritiesFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={assigneesFilter}
        label='Assignees'
        options={users}
        handleChangeFilter={createFilterHandler(setAssigneesFilter)}
      />

      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
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
