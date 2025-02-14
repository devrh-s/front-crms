import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import { IProjectsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IProject[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProjectsFilters) => void;
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

export default function ProjectsFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [projectTemplatesFilter, setProjectTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [tasksFilter, setTasksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [startDate, setStartDate] = useState<IDateFilter>(dateInitial);
  const [endDate, setEndDate] = useState<IDateFilter>(dateInitial);
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);

  const project_templates = commonData.project_templates ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const tasks = commonData.tasks ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IProjectsFilters = {};
    if (checkFilterValue(projectTemplatesFilter)) {
      filters.project_templates = {
        data: projectTemplatesFilter.value,
        mode: projectTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(innerClientsFilter)) {
      filters.inner_clients = {
        data: innerClientsFilter.value,
        mode: innerClientsFilter.mode,
      };
    }
    if (checkFilterValue(tasksFilter)) {
      filters.tasks = {
        data: tasksFilter.value,
        mode: tasksFilter.mode,
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
    if (checkFilterValue(endDate)) {
      filters.endDate = {
        data: {
          start: endDate.value.start ? endDate.value.start.format('DD-MM-YYYY') : '',
          end: endDate.value.end ? endDate.value.end.format('DD-MM-YYYY') : '',
        },
        mode: endDate.mode,
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
    setProjectTemplatesFilter({ value: [], mode: 'standard' });
    setTasksFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setStartDate(dateInitial);
    setEndDate(dateInitial);
    setCreatedAt(dateInitial);
    setInnerClientsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectTemplatesFilter,
    tasksFilter,
    createdByFilter,
    startDate,
    endDate,
    createdAt,
    innerClientsFilter,
  ]);

  return (
    <FiltersDrawer
      title='Projects'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={projectTemplatesFilter}
        label='Project Templates'
        options={project_templates}
        handleChangeFilter={createFilterHandler(setProjectTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={tasksFilter}
        label='Tasks'
        options={tasks}
        handleChangeFilter={createFilterHandler(setTasksFilter)}
      />
      <MultipleSelectFilter
        filter={innerClientsFilter}
        label='Inner Clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientsFilter)}
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

      <CustomCalendar
        label='Start date'
        filter={startDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setStartDate)}
      />

      <CustomCalendar
        label='End Date'
        filter={endDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />
    </FiltersDrawer>
  );
}
