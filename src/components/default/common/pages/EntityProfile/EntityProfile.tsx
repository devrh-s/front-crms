import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import Status from '@/components/default/common/components/Status';
import UserAvailability from '@/components/default/common/components/UserAvailability';
import { blocksWithoutProfile, createModelForURL } from '@/components/default/tasks/Tasks/helpers';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, IconButton, Stack, Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ReactElement, useState } from 'react';
import CustomLink from '../../components/CustomLink';
import NameLink from '../../components/NameLink';
import Translation from '../../components/Translation';
import UserChip from '../../components/UserChip';

type FieldType =
  | 'text'
  | 'date'
  | 'availability'
  | 'translation'
  | 'status'
  | 'link'
  | 'nameLink'
  | 'moreChips'
  | 'user'
  | 'password'
  | 'component'
  | 'format';

export interface IField {
  title: string;
  value: any;
  type: FieldType | string;
  availability?: string;
  exception?: 'user';
  icon?: any;
  href?: string;
  format?: string;
}

interface IChip {
  id: number;
  name: string;
  model_id: number;
}

export interface IProfile {
  name?: string;
  image?: string;
  id?: number;
  fields: IField[];
  topContent?: IField;
  bottomContent?: {
    user: IField;
    dates: IField[];
  };
  accordions?: {
    title: string;
    content?: string;
    component?: ReactElement;
  }[];
}

interface IEntityProfileProps {
  profile: IProfile;
  availableEdit?: boolean;
  handleActions: (value: boolean) => void;
  isDrawer?: boolean;
}

export default function EntityProfile({
  profile,
  handleActions,
  availableEdit = true,
  isDrawer = false,
}: IEntityProfileProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [showMore, setShowMore] = useState(isDrawer);
  const [showPassword, setShowPassword] = useState(false);
  const isDisabled = profile.id === 1 && profile.name === 'English';
  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleClickOnChip = (model: IChip) => {
    const block = model.name.split(/[\s:]+/)[0];
    const isBlockAllowed = !blocksWithoutProfile.includes(block);
    if (isBlockAllowed) {
      window.open(`/${createModelForURL(block).toLowerCase()}/${model.model_id}`);
    }
  };

  return (
    <Stack
      sx={{
        overflowX: 'hidden',
        width: '100%',
        maxWidth: isDrawer ? '100%' : 'none',
      }}
    >
      <Stack
        sx={{
          border: !isDrawer ? '1px solid #0000001f' : 'none',
          borderTopRightRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem',
          padding: '1rem',
          gap: '2.5rem',
          position: 'relative',
        }}
      >
        <Stack
          flexDirection='row'
          alignItems='flex-start'
          gap='1rem'
          sx={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
          }}
        >
          {availableEdit && (
            <IconButton size='small' onClick={() => handleActions(true)} sx={{ p: 0 }}>
              <EditIcon color='primary' />
            </IconButton>
          )}
          {!isDrawer && (
            <IconButton size='small' onClick={() => setShowMore((prev) => !prev)} sx={{ p: 0 }}>
              {showMore ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          )}
        </Stack>

        <Stack
          flexDirection={smDown ? 'column' : 'row'}
          alignItems={smDown ? 'flex-start' : 'center'}
          justifyContent='flex-start'
          key={profile.topContent?.title?.toLowerCase().replace(' ', '_')}
          gap='1rem'
        >
          <Typography
            fontSize='1rem'
            fontWeight={600}
            sx={{
              color: 'rgba(0,0,0, .6)',
              flex: smDown ? '0 0 30%' : '0 0 20%',
              alignSelf: 'flex-start',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            {profile.topContent?.icon}
            {profile.topContent?.title}
          </Typography>
          <Box
            alignSelf='flex-start'
            sx={{
              width: smDown ? '100%' : 'calc(80% - 7.5rem)',
            }}
            dangerouslySetInnerHTML={{
              __html: profile.topContent?.value,
            }}
          />
        </Stack>

        <Stack
          flexDirection={showMore ? 'column' : 'row'}
          flexWrap={showMore ? 'nowrap' : 'wrap'}
          gap={'1.5rem'}
          width={'100%'}
          fontWeight={500}
        >
          {profile.fields.map((field) => (
            <Stack
              flexDirection={smDown && showMore ? 'column' : 'row'}
              alignItems={smDown && showMore ? 'flex-start' : 'center'}
              justifyContent='flex-start'
              key={field.title.toLowerCase().replace(' ', '_')}
              sx={{
                gap: showMore ? '1rem' : !field?.icon ? '0' : '0.5rem',
              }}
            >
              <Typography
                fontSize='1rem'
                fontWeight={600}
                sx={{
                  color: 'rgba(0,0,0, .6)',
                  flex: showMore ? (smDown ? '0 0 30%' : '0 0 20%') : '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Tooltip title={field.title}>{field?.icon}</Tooltip>
                {showMore ? field.title : ''}
              </Typography>
              <>
                {field.type === 'text' && (
                  <Typography
                    fontSize='1rem'
                    fontWeight={500}
                    sx={{
                      flex: '1',
                    }}
                  >
                    {field.value}
                  </Typography>
                )}

                {field.type === 'date' && (
                  <Date
                    date={field.value}
                    format={field.format ? field.format : 'DD-MM-YYYY'}
                    sx={{
                      flex: '1',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  />
                )}
                {field.type === 'component' && field.value}
                {field.type === 'availability' && (
                  <UserAvailability
                    availability={field.value === 'Yes' || field.value === 'active'}
                    text={field.value}
                    sx={{ fontSize: '0.875rem' }}
                  />
                )}

                {field.type === 'translation' && <Translation text={field?.value} />}

                {field.type === 'status' && (
                  <Box
                    sx={{
                      flex: '1',
                    }}
                  >
                    <Status name={field.value?.name} color={field.value?.color} />
                  </Box>
                )}

                {field.type === 'link' && (
                  <CustomLink
                    link={typeof field.value?.link === 'string' ? field.value.link : field.value}
                    sx={{ fontWeight: 700 }}
                    label={field.value?.name ?? 'Link'}
                  />
                )}
                {field.type === 'nameLink' && (
                  <NameLink href={field.href ? field.href : ''} sx={{ pl: 0 }} name={field.value} />
                )}

                {field.title === 'Parent task results' && (
                  <MoreChips
                    data={field.value ?? []}
                    exception={field?.exception}
                    propName={
                      field?.value?.[0]?.iso2 ? 'iso2' : field?.value?.[0]?.title ? 'title' : 'name'
                    }
                    sx={{
                      flex: '1',
                    }}
                    handleSetModal={(data: IChip) => {
                      handleClickOnChip(data);
                    }}
                  />
                )}

                {field.type === 'moreChips' && field.title !== 'Parent task results' && (
                  <MoreChips
                    data={field.value ?? []}
                    exception={field?.exception}
                    propName={
                      field?.value?.[0]?.iso2 ? 'iso2' : field?.value?.[0]?.title ? 'title' : 'name'
                    }
                    sx={{
                      flex: '1',
                    }}
                  />
                )}

                {field.type === 'password' && (
                  <Stack
                    flexDirection='row'
                    alignItems='center'
                    justifyContent='flex-start'
                    gap='1rem'
                    sx={{
                      flex: '1',
                    }}
                  >
                    <Typography
                      fontSize='1rem'
                      fontWeight={500}
                      sx={{
                        flex: '0 0 60%',
                      }}
                    >
                      {showPassword ? field.value : '********'}
                    </Typography>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleShowPassword}
                    >
                      {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </Stack>
                )}

                {field.type === 'user' && (
                  <UserChip
                    data={field.value}
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  />
                )}
              </>
            </Stack>
          ))}

          {!!profile?.bottomContent && (
            <Stack
              flexDirection={smDown ? 'column' : 'row'}
              flexWrap='wrap'
              justifyContent={showMore ? 'space-between' : 'flex-start'}
              alignItems={smDown ? 'start' : 'center'}
              width={showMore || smDown ? '100%' : 'auto'}
              gap={'1.5rem'}
            >
              <Stack>
                {profile?.bottomContent?.user && (
                  <UserChip
                    data={profile?.bottomContent?.user.value}
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  />
                )}
              </Stack>
              <Stack
                gap='1.5rem'
                flexDirection='row'
                justifyContent={smDown ? 'space-between' : 'flex-start'}
                width={smDown ? '100%' : 'auto'}
              >
                {profile?.bottomContent?.dates?.map((field) => (
                  <Date
                    key={field.title}
                    date={field.value}
                    format={field.format ? field.format : 'DD-MM-YYYY'}
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
      {/* {isDrawer ? (
        <Stack
          flexDirection='column'
          alignItems='center'
          flex='1'
          padding='0.2rem'
          width='100%'
          minWidth={320}
        >
          {profile.accordions &&
            profile.accordions.map((accordion, index) => {
              if (accordion.content || accordion.component) {
                return (
                  accordion.title && (
                    <Accordion
                      key={`${accordion.title.toLowerCase().replace(' ', '_')}_${index}`}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel1-content'
                        id='panel1-header'
                      >
                        {accordion.title}
                      </AccordionSummary>
                      <AccordionDetails>
                        {accordion.content && (
                          <Box
                            dangerouslySetInnerHTML={{
                              __html: accordion.content,
                            }}
                            alignSelf='flex-start'
                          />
                        )}
                        {accordion.component && accordion.component}
                      </AccordionDetails>
                    </Accordion>
                  )
                );
              } else return null;
            })}
        </Stack>
      ) : (
        <Stack
          flexDirection='column'
          alignItems='center'
          flex='1'
          padding={lgDown ? '0' : '0 2rem'}
          width={lgDown ? (smDown ? '100%' : '480px') : 'calc(100% - 480px)'}
        >
          {profile.accordions &&
            profile.accordions.map((accordion, index) => {
              if (accordion.content || accordion.component) {
                return (
                  accordion.title && (
                    <Accordion
                      key={`${accordion.title.toLowerCase().replace(' ', '_')}_${index}`}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel1-content'
                        id='panel1-header'
                      >
                        {accordion.title}
                      </AccordionSummary>
                      <AccordionDetails>
                        {accordion.content && (
                          <Box
                            dangerouslySetInnerHTML={{
                              __html: accordion.content,
                            }}
                            alignSelf='flex-start'
                          />
                        )}
                        {accordion.component && accordion.component}
                      </AccordionDetails>
                    </Accordion>
                  )
                );
              } else return null;
            })}
        </Stack>
      )} */}
    </Stack>
  );
}
