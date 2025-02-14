import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import { IJobTemplatesFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IJobTemplate[];
  filters: IJobTemplatesFilters;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobTemplatesFilters) => void;
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

export default function JobTemplatesFilter({
  open,
  filters,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [professionFilter, setProfessionFilter] = useState<IFilter>({
    value: [],
    mode: filters?.professions?.mode ?? 'standard',
  });
  const [similarProfessionFilter, setSimilarProfessionFilter] = useState<IFilter>({
    value: [],
    mode: filters?.similar_professions?.mode ?? 'standard',
  });
  const [departmentFilter, setDepartmentFilter] = useState<IFilter>({
    value: [],
    mode: filters?.professions?.mode ?? 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusFilter, setStatusFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [jobRequestsFilter, setJobRequestsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const professions = commonData?.professions ?? [];
  const similar_professions = commonData?.similar_professions ?? [];
  const departments = commonData?.departments ?? [];
  const job_requests = commonData?.job_requests ?? [];
  const users = commonData?.users ?? [];
  const statuses = commonData?.statuses ?? [];

  const generateFiltersData = () => {
    const filters: IJobTemplatesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(professionFilter)) {
      filters.professions = {
        data: professionFilter.value,
        mode: professionFilter.mode,
      };
    }
    if (checkFilterValue(similarProfessionFilter)) {
      filters.similar_professions = {
        data: similarProfessionFilter.value,
        mode: similarProfessionFilter.mode,
      };
    }
    if (checkFilterValue(departmentFilter)) {
      filters.departments = {
        data: departmentFilter.value,
        mode: departmentFilter.mode,
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
    if (checkFilterValue(jobRequestsFilter)) {
      filters.job_requests = {
        data: jobRequestsFilter.value,
        mode: jobRequestsFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setProfessionFilter({ value: [], mode: 'standard' });
    setSimilarProfessionFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setDepartmentFilter({ value: [], mode: 'standard' });
    setStatusFilter({ value: [], mode: 'standard' });
    setJobRequestsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statusFilter,
    createdAt,
    professionFilter,
    departmentFilter,
    createdByFilter,
    similarProfessionFilter,
    jobRequestsFilter,
  ]);

  return (
    <FiltersDrawer
      title='Job Templates'
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
        filter={departmentFilter}
        label='Departments'
        options={departments}
        handleChangeFilter={createFilterHandler(setDepartmentFilter)}
      />
      <MultipleSelectFilter
        filter={professionFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionFilter)}
      />
      <MultipleSelectFilter
        filter={similarProfessionFilter}
        label='Similar Professions'
        options={similar_professions}
        handleChangeFilter={createFilterHandler(setSimilarProfessionFilter)}
      />
      <MultipleSelectFilter
        filter={statusFilter}
        label='Status'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusFilter)}
      />
      <MultipleSelectFilter
        filter={jobRequestsFilter}
        label='Job Requests'
        options={job_requests}
        handleChangeFilter={createFilterHandler(setJobRequestsFilter)}
      />

      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
    </FiltersDrawer>
  );
}
