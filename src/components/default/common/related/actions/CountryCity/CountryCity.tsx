import { useEffect, useState } from 'react';
import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import CustomSingleSelect from '../../../form/CustomSingleSelect/CustomSingleSelect';

interface ICountryCityProps {
  control: Control<any>;
  countries: any;
  styles?: any;
  cities: any;
  required?: {
    country: boolean;
    city: boolean;
  };
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export default function CountryCity({
  control,
  countries,
  cities,
  styles,
  required = {
    country: false,
    city: false,
  },
  watch,
  setValue,
}: ICountryCityProps) {
  const [reducedCities, setReducedCities] = useState(cities);
  const watchContryId = watch('country_id');
  const watchCityId = watch('city_id');

  useEffect(() => {
    if (watchContryId) {
      const newCities = cities.filter((city: any) => city.countryId === watchContryId);
      if (!newCities.find((el: any) => el.id === watchCityId)) {
        setValue('city_id', '');
      }
      setReducedCities(newCities);
    } else {
      setReducedCities(cities);
    }
  }, [watchContryId, cities]);

  return (
    <>
      <Controller
        name='country_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Country'
              link='/countries'
              required={required?.country}
              field={field}
              options={countries}
              error={error}
              style={{
                ...styles,
              }}
            />
          );
        }}
      />
      <Controller
        name='city_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='City'
              link='/cities'
              field={field}
              options={reducedCities}
              required={required?.city}
              error={error}
              style={{
                ...styles,
              }}
            />
          );
        }}
      />
    </>
  );
}
