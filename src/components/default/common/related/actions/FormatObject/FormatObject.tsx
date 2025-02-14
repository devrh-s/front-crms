import { useEffect, useState } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import CustomSingleSelect from '../../../form/CustomSingleSelect/CustomSingleSelect';

interface IFormatObjectProps {
  control: Control<any>;
  formats: any;
  objects: any;
  objectName: string;
  formatName: string;
  watch: UseFormWatch<any>;
}
export default function FormatObject({
  control,
  formats,
  objects,
  objectName,
  formatName,
  watch,
}: IFormatObjectProps) {
  const [reducedFormats, setReducedFormats] = useState(formats);
  const watchObjects = watch(objectName);

  useEffect(() => {
    if (watchObjects) {
      const newFormat = formats.filter((format: any) =>
        format.objects ? format.objects.some((object: any) => object === watchObjects) : null
      );
      if (newFormat.length === 0) {
        setReducedFormats(formats);
      } else {
        setReducedFormats(newFormat);
      }
    } else {
      setReducedFormats(formats);
    }
  }, [watchObjects, formats]);
  return (
    <>
      <Controller
        name={objectName}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Object'
              link='/objects'
              field={field}
              required
              options={objects}
              error={error}
              style={{
                minWidth: 'calc(50% - 1rem)',
                flexGrow: 1,
              }}
            />
          );
        }}
      />
      <Controller
        name={formatName}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Format'
              link='/formats'
              field={field}
              required
              options={reducedFormats}
              error={error}
              style={{
                minWidth: 'calc(50% - 1rem)',
                flexGrow: 1,
              }}
            />
          );
        }}
      />
    </>
  );
}
