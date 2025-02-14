import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { useEffect, useState } from 'react';

interface ICountryCityProps {
  countryFilter: IFilter;
  cityFilter: IFilter;
  countries: any;
  cities: any;
  countryFilterHandler: (value: FilterMode | number[]) => void;
  cityFilterHandler: (value: FilterMode | number[]) => void;
}

export default function CountryCity({
  countryFilter,
  cityFilter,
  countries,
  cities,
  countryFilterHandler,
  cityFilterHandler,
}: ICountryCityProps) {
  const [reducedCities, setReducedCities] = useState(cities);

  useEffect(() => {
    const values = countryFilter?.value as number[];
    const cityValues = cityFilter?.value as number[];
    if (values.length > 0 && values[0]) {
      const newCities = cities.filter((city: any) => {
        return values.includes(city.countryId);
      });
      const newCitiesIds = newCities.map((el: any) => el.id);
      cityFilterHandler(cityValues.filter((el: any) => newCitiesIds.includes(el)));
      setReducedCities(newCities);
    } else {
      setReducedCities(cities);
      cityFilterHandler([]);
    }
  }, [countryFilter.value]);

  useEffect(() => {
    const values = countryFilter?.value as number[];
    if (values.length === 0 || !values[0]) {
      const cityValues = cityFilter?.value as number[];
      const newCityId = Array.isArray(countries)
        ? countries.reduce((id: number | string, country: any) => {
            if (country?.cities?.includes(cityValues[0])) {
              return country.id;
            }
            return id;
          }, '')
        : '';

      if (newCityId) {
        countryFilterHandler([newCityId]);
      }
    }
  }, [cityFilter.value]);

  return (
    <>
      <MultipleSelectFilter
        filter={countryFilter}
        label='Countries'
        options={countries}
        handleChangeFilter={countryFilterHandler}
      />
      <MultipleSelectFilter
        filter={cityFilter}
        label='Cities'
        options={reducedCities}
        handleChangeFilter={cityFilterHandler}
      />
    </>
  );
}
