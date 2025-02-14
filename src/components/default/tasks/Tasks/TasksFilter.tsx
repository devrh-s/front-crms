import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { useEffect, useState } from 'react';
import { ITaskFilters } from './types';

import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: ITask[];
  view: string;
  commonData: ICommonData;
  handleSetFilters: (newFilters: ITaskFilters) => void;
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

export default function TasksFilter({
  open,
  view,
  commonData,
  handleSetFilters,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [prioritiesFilter, setPrioritiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [assigneesFilter, setAssigneesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [controllersFilter, setControllersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [startDate, setStartDate] = useState<IDateFilter>(dateInitial);
  const [dueDate, setDueDate] = useState<IDateFilter>(dateInitial);

  const statuses = commonData.statuses ?? [];
  const users = commonData.users ?? [];
  const priorities = commonData.priorities ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const task_templates = commonData.task_templates ?? [];
  const professions = commonData.professions ?? [];

  const generateFiltersData = () => {
    const filters: ITaskFilters = {};
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(prioritiesFilter)) {
      filters.priorities = {
        data: prioritiesFilter.value,
        mode: prioritiesFilter.mode,
      };
    }
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(startDate)) {
      filters.startDate = {
        data: {
          start: startDate.value.start ? startDate.value.start.format('DD-MM-YYYY') : '',
          end: startDate.value.end ? startDate.value.end.format('DD-MM-YYYY') : '',
        },
        mode: startDate.mode,
      };
    }
    if (checkFilterValue(assigneesFilter)) {
      filters.assignees = {
        data: assigneesFilter.value,
        mode: assigneesFilter.mode,
      };
    }
    if (checkFilterValue(controllersFilter)) {
      filters.controllers = {
        data: controllersFilter.value,
        mode: controllersFilter.mode,
      };
    }
    if (checkFilterValue(dueDate)) {
      filters.dueDate = {
        data: {
          start: dueDate.value.start ? dueDate.value.start.format('DD-MM-YYYY') : '',
          end: dueDate.value.end ? dueDate.value.end.format('DD-MM-YYYY') : '',
        },
        mode: dueDate.mode,
      };
    }
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setDueDate(dateInitial);
    setStartDate(dateInitial);
    setStatusesFilter({ value: [], mode: 'standard' });
    setAssigneesFilter({ value: [], mode: 'standard' });
    setControllersFilter({ value: [], mode: 'standard' });
    setPrioritiesFilter({ value: [], mode: 'standard' });
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
  }, [
    createdByFilter,
    createdAt,
    dueDate,
    startDate,
    statusesFilter,
    prioritiesFilter,
    controllersFilter,
    assigneesFilter,
    taskTemplatesFilter,
    professionsFilter,
    taskTemplatesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Fields'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={assigneesFilter}
        label='Assignees'
        options={users}
        handleChangeFilter={createFilterHandler(setAssigneesFilter)}
      />
      <MultipleSelectFilter
        filter={controllersFilter}
        label='Controllers'
        options={users}
        handleChangeFilter={createFilterHandler(setControllersFilter)}
      />
      <MultipleSelectFilter
        filter={prioritiesFilter}
        label='Priorities'
        options={priorities}
        handleChangeFilter={createFilterHandler(setPrioritiesFilter)}
      />
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task templates'
        options={task_templates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      {view !== 'calendar' && (
        <CustomCalendar
          label='Created At'
          filter={createdAt as IDateFilter}
          handleChangeFilter={createDateFilterHandler(setCreatedAt)}
        />
      )}
      {view !== 'calendar' && (
        <CustomCalendar
          label='Start date'
          filter={startDate as IDateFilter}
          handleChangeFilter={createDateFilterHandler(setStartDate)}
        />
      )}
      {view !== 'calendar' && (
        <CustomCalendar
          label='Due date'
          filter={dueDate as IDateFilter}
          handleChangeFilter={createDateFilterHandler(setDueDate)}
        />
      )}
    </FiltersDrawer>
  );
}
