import TowSingleSelects from '@/components/default/common/form/TwoSingleSelects/TwoSingleSelects';
import { getPagePermissions } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Stack, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FieldError, FieldErrors, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import TooltipContent from './TooltipContent';

export interface IProfessionInput {
  id?: number;
  profession_id?: number;
  priority_id?: number;
  department_id?: number;
  is_permission?: number;
  position_id?: number;
}

export const getDefaultProfession = (): IProfessionInput => ({
  profession_id: undefined,
  priority_id: undefined,
  department_id: undefined,
});

interface IProps {
  professions: Array<IOption>;
  departments: Array<IOption>;
  priorities: Array<IOption>;
  positions: Array<IOption>;
  availabilities: Array<IOption>;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IProfessionInput>> | undefined)[]>
    | FieldErrors<IProfessionInput>[];
  index: number;
  professionsArr: Array<IProfessionInput>;
  elem?: IProfessionInput;
  onChange?: (event: IProfessionInput[]) => void;
}

export default function ProfessionInputs({
  professionsArr = [],
  index,
  elem,
  professions,
  departments,
  priorities,
  availabilities,
  positions,
  errors,
  onChange,
}: IProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | number>('');
  const [filteredProfessions, setFilteredProfessions] = useState(professions);
  const { permissions } = useAuthStore();

  const checkIsPermissionField = useMemo(
    () => getPagePermissions('Settings', 'Settings', permissions)?.change_is_permission,
    [permissions]
  );

  useEffect(() => {
    if (professions.length && departments.length) {
      setFilteredProfessions(
        selectedDepartment
          ? professions.filter((p) => p.department_id === +selectedDepartment)
          : professions
      );
    } else {
      setFilteredProfessions(professions);
    }
  }, [professions, departments, selectedDepartment]);

  useEffect(() => {
    if (elem?.department_id && elem.department_id !== selectedDepartment) {
      setSelectedDepartment(elem.department_id);
    }
  }, [elem?.department_id]);

  return (
    <>
      <CustomSingleSelect
        label='Department'
        link='/departments'
        field={{
          value: selectedDepartment,
          onChange: (targetValue: number) => {
            professionsArr[index].profession_id = undefined;
            setSelectedDepartment(targetValue);
            onChange && onChange(professionsArr);
          },
        }}
        options={departments}
      />

      <TowSingleSelects
        options1={filteredProfessions}
        options2={priorities}
        label1='Profession'
        label2='Priority'
        link1='/professions'
        link2='/priorities'
        value1={elem?.profession_id}
        value2={elem?.priority_id}
        onChange1={(targetValue?: number) => {
          professionsArr[index].profession_id = targetValue;
          onChange && onChange(professionsArr);
        }}
        onChange2={(targetValue?: number) => {
          professionsArr[index].priority_id = targetValue;
          onChange && onChange(professionsArr);
        }}
        error1={errors && errors[index]?.profession_id}
        error2={errors && errors[index]?.priority_id}
      />

      <CustomSingleSelect
        label='Position'
        required
        error={errors && errors[index]?.position_id}
        field={{
          value: elem?.position_id,
          onChange: (targetValue: number) => {
            professionsArr[index].position_id = targetValue;
            onChange && onChange(professionsArr);
          },
        }}
        options={positions}
      />

      {!!checkIsPermissionField && (
        <Stack direction={'row'} spacing={2} textAlign={'center'} alignItems={'center'}>
          <CustomSingleSelect
            label='Is Permission'
            required
            field={{
              value: elem?.is_permission,
              onChange: (targetValue?: number) => {
                professionsArr[index].is_permission = targetValue;
                onChange && onChange(professionsArr);
              },
            }}
            error={errors && errors[index]?.is_permission}
            options={availabilities}
          />
          {elem?.is_permission === 1 && (
            <Tooltip
              title={
                <TooltipContent
                  position_id={elem?.position_id}
                  profession_id={elem?.profession_id}
                />
              }
              placement='left-start'
            >
              <ListAltIcon fontSize='large' color='action' />
            </Tooltip>
          )}
        </Stack>
      )}
    </>
  );
}
