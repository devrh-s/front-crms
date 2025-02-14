import { TextField, Theme, useMediaQuery } from '@mui/material';
import { Control, UseFormWatch } from 'react-hook-form';
import CustomTextEditor from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import { useEffect, useState } from 'react';

interface IGuideFormat {
  id: number | string;
  link: string | null;
  object_id: number | string;
  format_id: number | string;
  description: string | null;
}

interface IGuideInputsProps {
  objects: Array<IOption>;
  formats: Array<IOption>;
  errors?: any;
  index?: number;
  single?: boolean;
  guidesArr: Array<IGuideFormat>;
  elem: IGuideFormat;
  onChange?: (event: any[]) => void;
  control: Control<any>;
  register?: any;
  getValues?: any;
  watch: UseFormWatch<any>;
}

export default function GuidesInputs({
  control,
  guidesArr,
  index,
  elem,
  objects,
  formats,
  errors,
  single,
  getValues,
  onChange,
  register,
  watch,
}: IGuideInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [reducedFormats, setReducedFormats] = useState(formats);

  useEffect(() => {
    if (elem?.object_id) {
      const filteredFormats = formats.filter((format: any) =>
        format.objects ? format.objects.some((object: any) => object === elem?.object_id) : false
      );

      setReducedFormats(filteredFormats);

      if (elem?.format_id && !filteredFormats.some((format) => format.id === elem?.format_id)) {
        const newGuidesArr = guidesArr ? [...guidesArr] : [];
        newGuidesArr[index ?? 0].format_id = '';
        if (onChange) {
          onChange(newGuidesArr);
        }
      }
    } else {
      setReducedFormats(formats);
    }
  }, [elem?.object_id, elem?.format_id, formats, guidesArr, onChange, index]);

  return (
    <>
      {single ? (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('link')}
          error={!!errors.link}
          helperText={errors.link ? errors.link?.message : ''}
          label='Link'
          className={mdDown ? 'mobile' : ''}
          sx={{
            minWidth: 'calc(50% - 1rem)',
            flexGrow: 1,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      ) : (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          value={elem?.link ?? ''}
          onChange={(e) => {
            const newValue = guidesArr ? [...guidesArr] : [];
            newValue[index ?? 0].link = e.target.value;
            if (onChange) {
              onChange(newValue);
            }
          }}
          error={!!errors?.guide_formats?.[index ?? 0]?.link}
          helperText={errors?.guide_formats ? errors.guide_formats[index!]?.link?.message : ''}
          label='Link'
          className={mdDown ? 'mobile' : ''}
          sx={{
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      )}

      <CustomSingleSelect
        label='Objects'
        field={{
          value: elem?.object_id,
          onChange: (targetValue: number) => {
            const newValue = guidesArr ? [...guidesArr] : [];
            newValue[index ?? 0].object_id = targetValue;
            if (onChange) {
              onChange(newValue);
            }
          },
        }}
        required
        options={objects}
        error={errors?.guide_formats ? errors.guide_formats?.[index!]?.object_id : ''}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
        }}
      />
      <CustomSingleSelect
        label='Format'
        field={{
          value: elem?.format_id,
          onChange: (targetValue: number) => {
            const newValue = guidesArr ? [...guidesArr] : [];
            newValue[index ?? 0].format_id = targetValue;
            if (onChange) {
              onChange(newValue);
            }
          },
        }}
        required
        options={reducedFormats}
        error={errors?.guide_formats ? errors.guide_formats?.[index!]?.format_id : ''}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
        }}
      />

      <CustomTextEditor
        title='description'
        value={elem?.description ?? ''}
        onEditorChange={(targetValue: string) => {
          const newValue = guidesArr ? [...guidesArr] : [];
          newValue[index ?? 0].description = targetValue;
          if (onChange) {
            onChange(newValue);
          }
        }}
        style={{ width: '100%' }}
        error={errors ? errors[index!]?.description?.message : ''}
        height={200}
      />
    </>
  );
}
