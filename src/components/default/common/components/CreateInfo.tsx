'use client';
import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface ICreateInfoProps {
  id?: number | string | null;
  creationInfo?: ICreationInfo | null;
}
export default function CreateInfo({ id, creationInfo }: ICreateInfoProps) {
  const isVisible = creationInfo?.created_by || creationInfo?.created_at;
  if (!isVisible) {
    return;
  }
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignSelf='center'
      sx={{ color: '#909090', maxWidth: '28rem', width: '100%' }}
    >
      {id && <Typography fontSize='.75rem'>ID: {id}</Typography>}

      <Typography fontSize='.75rem'>Created By: {creationInfo?.created_by?.name}</Typography>
      <Typography fontSize='.75rem'>
        Created At: {dayjs(creationInfo?.created_at).format('DD-MM-YY')}
      </Typography>

      {/* {!creationInfo && (
        <>
          <Typography fontSize=".75rem">Created By: {userProfile?.name} </Typography>
          <Typography fontSize=".75rem">Created At: {dayjs().format("DD-MM-YY")}</Typography>
        </>
      )} */}
    </Stack>
  );
}
