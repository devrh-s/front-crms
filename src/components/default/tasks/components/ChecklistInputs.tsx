import { TextField, Stack } from '@mui/material';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import MoreChips from '../../common/components/MoreChips';
import { Controller, Control } from 'react-hook-form';
import { IChecklistSave } from '../types/types';

interface INameKeys {
  name: string;
  placement_id: string;
}

interface IStepInputsProps {
  index: number;
  control: Control<any>;
  nameKeys: INameKeys;
  commonData: ICommonData;
  checklist: IChecklistSave;
  handleSetModal?: (data: IGuideType | null) => void;
}

export default function ChecklistInputs({
  control,
  index,
  commonData,
  checklist,
  nameKeys,
  handleSetModal,
}: IStepInputsProps) {
  const guidesVisible = !!handleSetModal;
  const placements = commonData.placements ?? [];
  return (
    <>
      <Controller
        name={nameKeys.name}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          return (
            <TextField
              value={value}
              onChange={onChange}
              variant='standard'
              InputLabelProps={{ shrink: true }}
              label={`Name of Checklist ${index + 1}`}
              error={!!error}
              required
              helperText={error?.message}
              sx={{
                minWidth: '100%',
              }}
            />
          );
        }}
      />
      <Controller
        name={nameKeys.placement_id}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Placement'
              link='/placements'
              field={field}
              required
              options={placements}
              error={error}
              style={{
                minWidth: '100%',
              }}
            />
          );
        }}
      />
      {/* {guidesVisible && (
        <Stack sx={{ padding: '0 0 1rem' }}>
          <MoreChips data={checklist.guides} propName='name' handleSetModal={handleSetModal} />
        </Stack>
      )} */}
    </>
  );
}
