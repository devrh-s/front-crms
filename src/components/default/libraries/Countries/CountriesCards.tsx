import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import {
  Avatar,
  Box,
  CardContent,
  Divider,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MouseEvent, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import CardActionsButton from '../../common/components/CardActionsButton';
import Translation from '../../common/components/Translation';
import CustomToolbar from '../../common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '../../common/UI/InfinityScroll/InfinityScroll';
import { IViewProps } from './types';

const pinIcon = new Icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [24, 41],
});

interface ICountryCard {
  elem: ICountry;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function CountryCard({
  elem,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  isSmall,
}: ICountryCard) {
  const { userProfile } = useUserProfile();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const position = [elem.latitude, elem.longitude] as LatLngTuple;
  const isLatLng = elem?.latitude && elem.longitude;
  return (
    <Card
      className={mdDown ? 'mobile' : ''}
      sx={{
        width: 345,
        borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          padding: 0,
          flexDirection: 'column',
          gap: '.5rem',
          '&:last-child': {
            pb: '18px',
          },
        }}
      >
        <Box className={isSmall ? 'small' : 'normal'}>
          {!isSmall ? (
            <MapContainer
              center={isLatLng ? position : [0, 0]}
              zoom={3}
              scrollWheelZoom={false}
              style={{ height: 150 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              <Marker position={isLatLng ? position : [0, 0]} icon={pinIcon}>
                <Popup>{elem.name}</Popup>
              </Marker>
            </MapContainer>
          ) : null}
        </Box>
        <Stack
          flexDirection='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ padding: '0 1rem' }}
        >
          <Stack
            flexDirection='row'
            justifyContent='center'
            alignItems='center'
            gap='1rem'
            flexGrow={1}
          >
            <Avatar
              src={elem?.image ?? '/images/question_mark.svg'}
              sx={{ boxShadow: '0px 4px 32.3px 10px #1928281A' }}
            />
            <Typography>{elem.name}</Typography>
            <Divider
              color='#1976d2'
              orientation='vertical'
              sx={{ height: '1.5rem', alignSelf: 'center' }}
              flexItem
            />
            <Typography sx={{ fontSize: '16px', textTransform: 'uppercase' }}>
              {elem.iso3}
            </Typography>
            <Divider
              color='#1976d2'
              orientation='vertical'
              sx={{ height: '1.5rem', alignSelf: 'center' }}
              flexItem
            />
            <Typography sx={{ fontSize: '16px', textTransform: 'uppercase' }}>
              {elem.iso2}
            </Typography>
          </Stack>
          <CardActionsButton
            id={elem.id}
            open={open}
            handleClick={handleClick}
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            availableEdit={checkPermission({
              pagePermissions,
              permissionType: 'edit_countries',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_countries',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            url={`/countries/${elem.id}`}
          />
        </Stack>
        <Stack>
          <Translation text={elem.translation.name}></Translation>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CountriesCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  pagePermissions,
  handlePagination,
  loading,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  isSmall,
}: IViewProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [visibleCards, setVisibleCards] = useState<typeof rows>([]);
  const { isAdmin, permissions } = useAuthStore();
  useEffect(() => {
    if (cardsStorageActive) {
      setVisibleCards((prev) => [...prev, ...rows]);
      handleCardsStorage(false);
    } else {
      setVisibleCards(rows);
    }
  }, [rows]);

  return (
    <Stack
      gap='2rem'
      sx={{
        padding: '.5rem 0',
        minHeight: mdDown ? 'calc(80dvh - 2rem - 64px)' : 'calc(80dvh - 2rem - 56px)',
      }}
    >
      <CustomToolbar
        view={view}
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_countries']}
        pageName='Countries'
      />
      <Box
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 345px)',
          justifyContent: 'center',
          gap: '1rem',
          '&.mobile': {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
            alignItems: 'center',
            minHeight: '100dvh',
          },
        }}
      >
        {visibleCards.map((row) => (
          <CountryCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
          />
        ))}
      </Box>
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
      <ScrollBtn />
    </Stack>
  );
}
