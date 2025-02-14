import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import { IJobRequestsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobRequestsFilters) => void;
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

export default function JobRequestsFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [closeDate, setCloseDate] = useState<IDateFilter>(dateInitial);
  const [demandDate, setDemandDate] = useState<IDateFilter>(dateInitial);
  const [departmentsFilter, setDepartmentsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [jobTemplatesFilter, setJobTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionsFilter, setActionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [managersFilter, setManagersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [ratesFilter, setRatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [shiftsFilter, setShiftsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusFilter, setStatusFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const professions = commonData.professions ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const managers = commonData.managers ?? [];
  const rates = commonData.rates ?? [];
  const shifts = commonData.shifts ?? [];
  const job_templates = commonData.job_templates ?? [];
  const departments = commonData.departments ?? [];
  const statuses = commonData.statuses ?? [];
  const objects = commonData.objects ?? [];
  const actions = commonData.actions ?? [];
  const task_templates = commonData.task_templates ?? [];
  const tools = commonData.tools ?? [];

  const generateFiltersData = () => {
    const filters: IJobRequestsFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(closeDate)) {
      filters.closeDate = {
        data: {
          start: closeDate?.value?.start?.format('DD-MM-YYYY'),
          end: closeDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: closeDate.mode,
      };
    }
    if (checkFilterValue(demandDate)) {
      filters.demandDate = {
        data: {
          start: demandDate?.value?.start?.format('DD-MM-YYYY'),
          end: demandDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: demandDate.mode,
      };
    }
    if (checkFilterValue(departmentsFilter)) {
      filters.departments = {
        data: departmentsFilter.value,
        mode: departmentsFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(jobTemplatesFilter)) {
      filters.jobTemplates = {
        data: jobTemplatesFilter.value,
        mode: jobTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(objectsFilter)) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    if (checkFilterValue(actionsFilter)) {
      filters.actions = {
        data: actionsFilter.value,
        mode: actionsFilter.mode,
      };
    }
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(innerClientsFilter)) {
      filters.innerClients = {
        data: innerClientsFilter.value,
        mode: innerClientsFilter.mode,
      };
    }
    if (checkFilterValue(managersFilter)) {
      filters.managers = {
        data: managersFilter.value,
        mode: managersFilter.mode,
      };
    }
    if (checkFilterValue(ratesFilter)) {
      filters.rates = {
        data: ratesFilter.value,
        mode: ratesFilter.mode,
      };
    }
    if (checkFilterValue(shiftsFilter)) {
      filters.shifts = {
        data: shiftsFilter.value,
        mode: shiftsFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(statusFilter)) {
      filters.statuses = {
        data: statusFilter.value,
        mode: statusFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    closeDate,
    demandDate,
    createdByFilter,
    shiftsFilter,
    ratesFilter,
    managersFilter,
    objectsFilter,
    actionsFilter,
    taskTemplatesFilter,
    toolsFilter,
    innerClientsFilter,
    jobTemplatesFilter,
    professionsFilter,
    departmentsFilter,
    statusFilter,
  ]);
  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCloseDate(dateInitial);
    setDemandDate(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
    setDepartmentsFilter({ value: [], mode: 'standard' });
    setInnerClientsFilter({ value: [], mode: 'standard' });
    setJobTemplatesFilter({ value: [], mode: 'standard' });
    setObjectsFilter({ value: [], mode: 'standard' });
    setActionsFilter({ value: [], mode: 'standard' });
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
    setRatesFilter({ value: [], mode: 'standard' });
    setShiftsFilter({ value: [], mode: 'standard' });
    setManagersFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setStatusFilter({ value: [], mode: 'standard' });
  };

  return (
    <FiltersDrawer
      title='Job Requests'
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
      <CustomCalendar
        label='Close Date'
        filter={closeDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCloseDate)}
      />
      <CustomCalendar
        label='Demand Date'
        filter={demandDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setDemandDate)}
      />
      <MultipleSelectFilter
        filter={statusFilter}
        label='Status'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusFilter)}
      />
      <MultipleSelectFilter
        filter={departmentsFilter}
        label='Departments'
        options={departments}
        handleChangeFilter={createFilterHandler(setDepartmentsFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={ratesFilter}
        label='Rates'
        options={rates}
        handleChangeFilter={createFilterHandler(setRatesFilter)}
      />
      <MultipleSelectFilter
        filter={shiftsFilter}
        label='Shifts'
        options={shifts}
        handleChangeFilter={createFilterHandler(setShiftsFilter)}
      />
      <MultipleSelectFilter
        filter={jobTemplatesFilter}
        label='Job Templates'
        options={job_templates}
        handleChangeFilter={createFilterHandler(setJobTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />
      <MultipleSelectFilter
        filter={actionsFilter}
        label='Actions'
        options={actions}
        handleChangeFilter={createFilterHandler(setActionsFilter)}
      />
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={task_templates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={innerClientsFilter}
        label='Inner Clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientsFilter)}
      />
      <MultipleSelectFilter
        filter={managersFilter}
        label='Managers'
        options={managers}
        handleChangeFilter={createFilterHandler(setManagersFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={managers}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
    </FiltersDrawer>
  );
}
