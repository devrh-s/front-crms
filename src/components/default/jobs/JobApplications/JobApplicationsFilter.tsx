import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Dayjs } from 'dayjs';
import { IJobApplicationsFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import CountryCity from '@/components/default/common/related/filters/CountryCity/CountryCity';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import { useSelector } from 'react-redux';
import { IRootState } from '@/redux/store';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobApplicationsFilters) => void;
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

export default function JobApplicationsFilter({
  open,
  commonData,
  toggleFilters,
  handleSetFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const queryFilter = useSelector((state: IRootState) => state.queryFilters['job-applications']);
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [birthday, setBirthday] = useState<IDateFilter>(dateInitial);
  const [gendersFilter, setGendersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [countryFilter, setCountryFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [cityFilter, setCityFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [managersFilter, setManagersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [jobPostsFilter, setJobPostsFilter] = useState<IFilter>({
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
  const [jobRequestsFilter, setJobRequestsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [communicationTypesFilter, setCommunicationTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const filtersSetters = {
    'job-posts': setJobPostsFilter,
    'job-requests': setJobRequestsFilter,
    'job-templates': setJobTemplatesFilter,
  };

  const genders = commonData.genders ?? [];
  const countries = commonData.countries ?? [];
  const cities = commonData.cities ?? [];
  const statuses = commonData.statuses ?? [];
  const users = commonData.users ?? [];
  const tools = commonData.tools ?? [];
  const job_posts = commonData.job_posts ?? [];
  const job_requests = commonData.job_requests ?? [];
  const communication_types = commonData.communication_types ?? [];
  const job_templates = commonData.job_templates ?? [];
  const professions = commonData.professions ?? [];

  const generateFiltersData = () => {
    const filters: IJobApplicationsFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(birthday)) {
      filters.birthday = {
        data: {
          start: birthday?.value?.start?.format('DD-MM-YYYY'),
          end: birthday?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: birthday.mode,
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
    if (checkFilterValue(gendersFilter)) {
      filters.genders = {
        data: gendersFilter.value,
        mode: gendersFilter.mode,
      };
    }
    if (checkFilterValue(countryFilter)) {
      filters.countries = {
        data: countryFilter.value,
        mode: countryFilter.mode,
      };
    }
    if (checkFilterValue(cityFilter)) {
      filters.cities = {
        data: cityFilter.value,
        mode: cityFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(managersFilter)) {
      filters.managers = {
        data: managersFilter.value,
        mode: managersFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(jobPostsFilter)) {
      filters.job_posts = {
        data: jobPostsFilter.value,
        mode: jobPostsFilter.mode,
      };
    }
    if (checkFilterValue(jobRequestsFilter)) {
      filters.job_requests = {
        data: jobRequestsFilter.value,
        mode: jobRequestsFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(jobTemplatesFilter)) {
      filters.job_templates = {
        data: jobTemplatesFilter.value,
        mode: jobTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(communicationTypesFilter)) {
      filters.communication_types = {
        data: communicationTypesFilter.value,
        mode: communicationTypesFilter.mode,
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
    setBirthday(dateInitial);
    setGendersFilter({ value: [], mode: 'standard' });
    setCountryFilter({ value: [], mode: 'standard' });
    setCityFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setManagersFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
    setJobPostsFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setJobRequestsFilter({ value: [], mode: 'standard' });
    setJobTemplatesFilter({ value: [], mode: 'standard' });
    setCommunicationTypesFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    birthday,
    gendersFilter,
    countryFilter,
    cityFilter,
    statusesFilter,
    managersFilter,
    toolsFilter,
    jobPostsFilter,
    jobRequestsFilter,
    professionsFilter,
    jobTemplatesFilter,
    communicationTypesFilter,
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
      title='Job Applications'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={gendersFilter}
        label='Genders'
        options={genders}
        handleChangeFilter={createFilterHandler(setGendersFilter)}
      />
      <CountryCity
        countryFilter={countryFilter}
        cityFilter={cityFilter}
        countries={countries}
        cities={cities}
        countryFilterHandler={createFilterHandler(setCountryFilter)}
        cityFilterHandler={createFilterHandler(setCityFilter)}
      />
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={managersFilter}
        label='Managers'
        options={users}
        handleChangeFilter={createFilterHandler(setManagersFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={jobPostsFilter}
        label='Job Posts'
        options={job_posts}
        handleChangeFilter={createFilterHandler(setJobPostsFilter)}
      />
      <MultipleSelectFilter
        filter={jobRequestsFilter}
        label='Job Requests'
        options={job_requests}
        handleChangeFilter={createFilterHandler(setJobRequestsFilter)}
      />
      <MultipleSelectFilter
        filter={jobTemplatesFilter}
        label='Job Templates'
        options={job_templates}
        handleChangeFilter={createFilterHandler(setJobTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={communicationTypesFilter}
        label='Communication Types'
        options={communication_types}
        handleChangeFilter={createFilterHandler(setCommunicationTypesFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Birthday'
        filter={birthday as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setBirthday)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
