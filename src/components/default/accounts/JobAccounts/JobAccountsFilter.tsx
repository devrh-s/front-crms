import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { IRootState } from '@/redux/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CustomCalendar from '../../common/components/CustomCalendar';
import MultipleSelectFilter from '../../common/filters/MultipleSelectFilter';
import { IJobAccountsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobAccountsFilters) => void;
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

export default function JobAccountsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const queryFilter = useSelector((state: IRootState) => state.queryFilters['job-accounts']);
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [passCreatedAt, setPassCreatedAt] = useState<IDateFilter>(dateInitial);
  const [passNextChangeDate, setPassNextChangeDate] = useState<IDateFilter>(dateInitial);
  const [jobSitesFilter, setJobSitesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusFilter, setStatusFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientFilter, setInnerClientFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const filtersSetters = {
    'job-sites': setJobSitesFilter,
  };

  const jobSites = commonData.job_sites ?? [];
  const statuses = commonData.statuses ?? [];
  const innerClients = commonData.inner_clients ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IJobAccountsFilters = {};
    if (checkFilterValue(passCreatedAt)) {
      filters.passCreatedAt = {
        data: {
          start: passCreatedAt?.value?.start?.format('DD-MM-YYYY'),
          end: passCreatedAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: passCreatedAt.mode,
      };
    }
    if (checkFilterValue(passNextChangeDate)) {
      filters.passNextChangeDate = {
        data: {
          start: passNextChangeDate?.value?.start?.format('DD-MM-YYYY'),
          end: passNextChangeDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: passNextChangeDate.mode,
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
    if (checkFilterValue(jobSitesFilter)) {
      filters.job_sites = {
        data: jobSitesFilter.value,
        mode: jobSitesFilter.mode,
      };
    }

    if (checkFilterValue(statusFilter)) {
      filters.statuses = {
        data: statusFilter.value,
        mode: statusFilter.mode,
      };
    }

    if (checkFilterValue(innerClientFilter)) {
      filters.inner_clients = {
        data: innerClientFilter.value,
        mode: innerClientFilter.mode,
      };
    }

    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setPassCreatedAt(dateInitial);
    setPassNextChangeDate(dateInitial);
    setJobSitesFilter({ value: [], mode: 'standard' });
    setStatusFilter({ value: [], mode: 'standard' });
    setInnerClientFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    passCreatedAt,
    passNextChangeDate,
    jobSitesFilter,
    statusFilter,
    innerClientFilter,
    createdByFilter,
  ]);

  useEffect(() => {
    if (queryFilter) {
      const filterSetter = filtersSetters?.[queryFilter?.name as keyof typeof filtersSetters];
      if (filterSetter instanceof Function) {
        filterSetter(queryFilter?.value);
      }
    }
  }, [queryFilter]);

  return (
    <FiltersDrawer
      title='Job Accounts'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={jobSitesFilter}
        label='Job Site'
        options={jobSites}
        handleChangeFilter={createFilterHandler(setJobSitesFilter)}
      />

      <MultipleSelectFilter
        filter={statusFilter}
        label='Status'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusFilter)}
      />

      <MultipleSelectFilter
        filter={innerClientFilter}
        label='Inner Client'
        options={innerClients}
        handleChangeFilter={createFilterHandler(setInnerClientFilter)}
      />

      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Password Created At'
        filter={passCreatedAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPassCreatedAt)}
      />
      <CustomCalendar
        label='Password Next Cahnge Date'
        filter={passNextChangeDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPassNextChangeDate)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
