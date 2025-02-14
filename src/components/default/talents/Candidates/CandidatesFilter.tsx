import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import CountryCity from '../../common/related/filters/CountryCity/CountryCity';

interface IApiDateFilter {
  start?: string | null;
  end?: string | null;
}

export interface IApiFilter {
  data: number[] | string | IApiDateFilter;
  mode?: FilterMode;
}

interface IPureFilters {
  name_translations?: IApiFilter;
  birthday?: IApiFilter;
  genders?: IApiFilter;
  countries?: IApiFilter;
  cities?: IApiFilter;
  inner_clients?: IApiFilter;
  statuses?: IApiFilter;
  shifts?: IApiFilter;
  objects?: IApiFilter;
  departments?: IApiFilter;
  professions?: IApiFilter;
  languages?: IApiFilter;
  managers?: IApiFilter;
  tools?: IApiFilter;
  task_templates?: IApiFilter;
  rates?: IApiFilter;
  created_at?: IApiFilter;
  created_by?: IApiFilter;
}

export interface ICandidatesFilters extends IPureFilters {
  is_student?: string;
}

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: ICandidatesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

const getDateDefault = (): IDateFilter => ({
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
});

interface IFilterData {
  state: IFilter;
  setter: Dispatch<SetStateAction<IFilter>>;
  apiKey: keyof IPureFilters;
  label: string;
  options?: IOption[];
}

export default function CandidatesFilter({
  open,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
  commonData,
}: IFiltersProps) {
  dayjs.extend(isoWeek);
  const [createdAt, setCreatedAt] = useState<IDateFilter>(getDateDefault);
  const [nameTranslationsFilter, setNameTranslationsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [birthday, setBirthday] = useState<IDateFilter>(getDateDefault);
  const [isStudentFilter, setIsStudentFilter] = useState<IFilter>({
    value: '',
  });
  const [gendersFilter, setGendersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [countriesFilter, setCountriesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [citiesFilter, setCitiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [shiftsFilter, setShiftsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [departmentsFilter, setDepartmentsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [languagesFilter, setLanguagesFilter] = useState<IFilter>({
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
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [ratesFilter, setRatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const filterDataArr: IFilterData[] = [
    {
      state: nameTranslationsFilter,
      setter: setNameTranslationsFilter,
      apiKey: 'name_translations',
      label: 'Name Translations',
      options: commonData.languages,
    },
    {
      state: gendersFilter,
      setter: setGendersFilter,
      apiKey: 'genders',
      label: 'Gender',
      options: commonData.genders,
    },
    {
      state: innerClientsFilter,
      setter: setInnerClientsFilter,
      apiKey: 'inner_clients',
      label: 'Inner Clients',
      options: commonData.inner_clients,
    },
    {
      state: statusesFilter,
      setter: setStatusesFilter,
      apiKey: 'statuses',
      label: 'Statuses',
      options: commonData.statuses,
    },
    {
      state: shiftsFilter,
      setter: setShiftsFilter,
      apiKey: 'shifts',
      label: 'Shifts',
      options: commonData.shifts,
    },
    {
      state: departmentsFilter,
      setter: setDepartmentsFilter,
      apiKey: 'departments',
      label: 'Departments',
      options: commonData.departments,
    },
    {
      state: professionsFilter,
      setter: setProfessionsFilter,
      apiKey: 'professions',
      label: 'Professions',
      options: commonData.professions,
    },
    {
      state: languagesFilter,
      setter: setLanguagesFilter,
      apiKey: 'languages',
      label: 'Languages',
      options: commonData.languages,
    },
    {
      state: managersFilter,
      setter: setManagersFilter,
      apiKey: 'managers',
      label: 'Managers',
      options: commonData.users,
    },
    {
      state: toolsFilter,
      setter: setToolsFilter,
      apiKey: 'tools',
      label: 'Tools',
      options: commonData.tools_candidates,
    },
    {
      state: taskTemplatesFilter,
      setter: setTaskTemplatesFilter,
      apiKey: 'task_templates',
      label: 'Task Templates',
      options: commonData.task_templates,
    },
    {
      state: ratesFilter,
      setter: setRatesFilter,
      apiKey: 'rates',
      label: 'Rates',
      options: commonData.rates,
    },
    {
      state: createdByFilter,
      setter: setCreatedByFilter,
      apiKey: 'created_by',
      label: 'Created By',
      options: commonData.users,
    },
    {
      state: objectsFilter,
      setter: setObjectsFilter,
      apiKey: 'objects',
      label: 'Objects',
      options: commonData.objects,
    },
  ];

  const clearFilters = () => {
    setCreatedAt(getDateDefault());
    setBirthday(getDateDefault());
    setIsStudentFilter({ value: '' });
    setCountriesFilter({
      value: [],
      mode: 'standard',
    });
    setCitiesFilter({
      value: [],
      mode: 'standard',
    });
    setObjectsFilter({
      value: [],
      mode: 'standard',
    });
    filterDataArr.forEach(({ setter }) => setter({ value: [], mode: 'standard' }));
  };

  useEffect(() => {
    const generateFiltersData = () => {
      const filters: ICandidatesFilters = {};
      if (checkFilterValue(createdAt)) {
        filters.created_at = {
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
      if (checkFilterValue(countriesFilter)) {
        filters.countries = {
          data: countriesFilter.value,
          mode: countriesFilter.mode,
        };
      }
      if (checkFilterValue(citiesFilter)) {
        filters.cities = {
          data: citiesFilter.value,
          mode: citiesFilter.mode,
        };
      }
      if (checkFilterValue(objectsFilter)) {
        filters.objects = {
          data: objectsFilter.value,
          mode: objectsFilter.mode,
        };
      }

      filterDataArr.forEach(({ state, apiKey }) => {
        if (checkFilterValue(state)) {
          filters[apiKey] = {
            data: state.value,
            mode: state.mode,
          };
        }
      });
      if (isStudentFilter.value !== '' && isStudentFilter.value !== undefined) {
        filters.is_student = +isStudentFilter.value === 1 ? 'true' : 'false';
      }
      handleSetFilters(filters);
    };

    generateFiltersData();
  }, [
    createdAt,
    birthday,
    isStudentFilter,
    countriesFilter,
    citiesFilter,
    ...filterDataArr.map((arg) => arg.state),
  ]);

  return (
    <FiltersDrawer
      title='Candidates'
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
        label='Birthday'
        filter={birthday as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setBirthday)}
      />

      <SingleSelectFilter
        label={'Is Student'}
        filter={isStudentFilter}
        options={commonData.availabilities ?? []}
        handleChangeFilter={createFilterHandler(setIsStudentFilter)}
      />
      <CountryCity
        countryFilter={countriesFilter}
        cityFilter={citiesFilter}
        countries={commonData.countries}
        cities={commonData.cities}
        countryFilterHandler={createFilterHandler(setCountriesFilter)}
        cityFilterHandler={createFilterHandler(setCitiesFilter)}
      />
      {filterDataArr.map(({ state, setter, options, label, apiKey }) => (
        <MultipleSelectFilter
          key={apiKey}
          filter={state}
          label={label}
          options={options ?? []}
          handleChangeFilter={createFilterHandler(setter)}
        />
      ))}
    </FiltersDrawer>
  );
}
