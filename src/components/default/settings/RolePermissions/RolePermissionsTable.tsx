import useNotification from '@/hooks/useNotification';
import { apiUpdateData } from '@/lib/fetch';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCustomizerStore } from '@/zustand/customizerStore';
import { IExpandedEntity, IPermissionEntityType, IPermissionType } from './types';

interface RolePermissionsTableProps {
  roleId: number;
  data: Array<IPermissionEntityType>;
}

interface RolePermissionsBlockProps {
  block: IPermissionEntityType;
  roleId: number;
  isSmall: boolean;
}

interface IRolePermissionsItemProps {
  item: IExpandedEntity;
  roleId: number;
  isSmall: boolean;
}

interface IRolePermissionsSelectProps {
  label?: string;
  isSmall?: boolean;
  defaultValue?: number;
  permissionRoleId?: number;
  roleId: number;
  options: Array<IPermissionType>;
}

function RolePermissionsBlock({ roleId, block, isSmall }: RolePermissionsBlockProps) {
  return (
    <Stack gap='1rem'>
      <Typography textAlign='center' fontWeight={600}>
        {block?.name}
      </Typography>
      <Divider />
      {block?.entities.map((elem) => (
        <RolePermissionsItem key={elem.id} isSmall={isSmall} roleId={roleId} item={elem} />
      ))}
    </Stack>
  );
}

function RolePermissionsItem({ item, roleId, isSmall }: IRolePermissionsItemProps) {
  const [open, setOpen] = useState(false);

  const { addPermission, viewPermission, updatePermission, deletePermission } = useMemo(() => {
    return {
      addPermission: item?.permissions.find((el) => el.name?.split('_')?.[0] === 'add'),
      viewPermission: item?.permissions.find((el) => el.name?.split('_')?.[0] === 'view'),
      updatePermission: item?.permissions.find((el) => el.name?.split('_')?.[0] === 'edit'),
      deletePermission: item?.permissions.find((el) => el.name?.split('_')?.[0] === 'delete'),
    };
  }, [item]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Stack>
      <Stack flexDirection={isSmall ? 'column' : 'row'} alignItems='center'>
        <Typography textAlign='center' sx={{ width: isSmall ? '100%' : 'calc(100% / 6)' }}>
          {item?.name}
        </Typography>
        <Stack alignItems='center' sx={{ width: 'calc(100% / 6)' }}>
          <RolePermissionsSelect
            label='add'
            isSmall={isSmall}
            roleId={roleId}
            permissionRoleId={addPermission?.permission_role_id}
            defaultValue={addPermission?.permission_type?.id}
            options={addPermission?.allowed_permissions ?? []}
          />
        </Stack>
        <Stack alignItems='center' sx={{ width: 'calc(100% / 6)' }}>
          <RolePermissionsSelect
            label='view'
            roleId={roleId}
            isSmall={isSmall}
            permissionRoleId={viewPermission?.permission_role_id}
            defaultValue={viewPermission?.permission_type?.id}
            options={viewPermission?.allowed_permissions ?? []}
          />
        </Stack>
        <Stack alignItems='center' sx={{ width: 'calc(100% / 6)' }}>
          <RolePermissionsSelect
            label='update'
            roleId={roleId}
            isSmall={isSmall}
            permissionRoleId={updatePermission?.permission_role_id}
            defaultValue={updatePermission?.permission_type?.id}
            options={updatePermission?.allowed_permissions ?? []}
          />
        </Stack>
        <Stack alignItems='center' sx={{ width: 'calc(100% / 6)' }}>
          <RolePermissionsSelect
            label='delete'
            roleId={roleId}
            isSmall={isSmall}
            permissionRoleId={deletePermission?.permission_role_id}
            defaultValue={deletePermission?.permission_type?.id}
            options={deletePermission?.allowed_permissions ?? []}
          />
        </Stack>
        <Stack alignItems='center' sx={{ width: 'calc(100% / 6)' }}>
          <Button
            variant='contained'
            endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            disabled={!item?.permissions_custom?.length}
            onClick={handleClick}
          >
            More
          </Button>
        </Stack>
      </Stack>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <Stack alignItems='center' sx={{ padding: '1rem 0' }}>
          <Paper
            sx={{
              padding: '1rem',
              display: 'flex',
              width: isSmall ? '95%' : '50%',
              flexDirection: 'column',
            }}
          >
            {item?.permissions_custom?.map((permission) => {
              return (
                <Stack
                  key={permission?.id}
                  flexDirection={isSmall ? 'column' : 'row'}
                  alignItems='center'
                  justifyContent='space-between'
                >
                  <Typography>{permission?.display_name}</Typography>
                  <RolePermissionsSelect
                    roleId={roleId}
                    permissionRoleId={permission?.permission_role_id}
                    defaultValue={permission?.permission_type?.id}
                    options={permission?.allowed_permissions ?? []}
                  />
                </Stack>
              );
            })}
          </Paper>
        </Stack>
      </Collapse>
    </Stack>
  );
}

export function RolePermissionsSelect({
  label,
  isSmall,
  roleId,
  permissionRoleId,
  defaultValue,
  options,
}: IRolePermissionsSelectProps) {
  const [value, setValue] = useState('');
  const showNotification = useNotification();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) =>
      apiUpdateData(`role-permissions/${roleId}/change-permission`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [`role-permissions-${roleId}`],
        });
        showNotification('Permission successfully updated', 'success');
      } else if (result?.error) {
        console.error(result?.error);
      }
    },
  });

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
    updateMutation.mutate({
      role_permissions: {
        id: permissionRoleId,
        permission_type_id: event.target.value,
      },
    });
  };
  useEffect(() => {
    if (defaultValue) {
      setValue(`${defaultValue}`);
    }
  }, [defaultValue]);

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      {label && isSmall && (
        <InputLabel id='demo-select-small-label' sx={{ textTransform: 'capitalize' }}>
          {label}
        </InputLabel>
      )}
      <Select
        labelId='demo-select-small-label'
        id='demo-select-small'
        value={value}
        disabled={!options?.length}
        // displayEmpty
        label={label && isSmall ? label : ''}
        onChange={handleChange}
        sx={{
          textTransform: 'capitalize',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: +value !== 5 ? '#09c709' : 'inherit',
          },
        }}
      >
        {options?.map((option) => (
          <MenuItem key={option.id} value={option?.id} sx={{ textTransform: 'capitalize' }}>
            {option?.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function RolePermissionsTable({ roleId, data }: RolePermissionsTableProps) {
  const {
    sidebar: { width: sidebarWidth },
  } = useCustomizerStore();
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isSmall = useMemo(() => {
    if (lgDown && sidebarWidth !== 56) return true;
    if (mdDown) return true;
    return false;
  }, [sidebarWidth, lgDown, mdDown]);
  const [showCustomHeader, setShowCustomHeader] = useState(false);
  const originalHeaderRef = useRef<HTMLTableSectionElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (originalHeaderRef.current) {
      setWidth(originalHeaderRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (originalHeaderRef.current) {
        setWidth(originalHeaderRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isElementAboveViewport = entry.boundingClientRect.top >= 0;

        if (isElementAboveViewport) {
          setShowCustomHeader(false);
        } else {
          setShowCustomHeader(!entry.isIntersecting);
        }
      },
      {
        root: null,
        threshold: 0,
      }
    );

    if (originalHeaderRef.current) {
      observer.observe(originalHeaderRef.current);
    }

    return () => observer.disconnect();
  }, []);
  return (
    <Stack
      sx={{
        borderRadius: '5px',
        border: '1px solid #bdbdbd',
        padding: '1rem 0',
      }}
    >
      {!lgDown && (
        <>
          {showCustomHeader && (
            <Box
              sx={{
                position: 'fixed',
                top: 48,
                backgroundColor: '#f9f9f9',
                padding: '10px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                width: `${width}px`,
                display: 'flex',
              }}
            >
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                Entity
              </Typography>
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                Add
              </Typography>
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                View
              </Typography>
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                Update
              </Typography>
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                Delete
              </Typography>
              <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
                &nbsp;
              </Typography>
            </Box>
          )}
          <Stack flexDirection='row' ref={originalHeaderRef}>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              Entity
            </Typography>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              Add
            </Typography>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              View
            </Typography>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              Update
            </Typography>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              Delete
            </Typography>
            <Typography textAlign='center' sx={{ width: 'calc(100% / 6)' }}>
              &nbsp;
            </Typography>
          </Stack>
        </>
      )}
      <Stack sx={{ padding: '1rem 0' }}>
        {data?.map((elem) => (
          <RolePermissionsBlock key={elem?.id} isSmall={isSmall} roleId={roleId} block={elem} />
        ))}
      </Stack>
    </Stack>
  );
}
