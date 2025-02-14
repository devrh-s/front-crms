import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import { apiGetData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DayHeaderContentArg } from '@fullcalendar/core/index.js';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, Stack, alpha, Grow } from '@mui/material';
import dayjs from 'dayjs';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { EventClickArg } from '@fullcalendar/core/index.js';
import { useCustomizerStore } from '@/zustand/customizerStore';

interface ICalendarProps {
  view: string;
  applyFilters: boolean;
  filters: any;
  openTaskProfile: (id: number) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
}

export default function Calendar({
  view,
  filters,
  applyFilters,
  openTaskProfile,
  toggleFilters,
  handleChangeView,
}: ICalendarProps) {
  const [calendarTitle, setCalendarTitle] = useState(dayjs(Date.now()).format('MMMM YYYY'));
  const [date, setDate] = useState<string>(dayjs(Date.now()).format('YYYY-MM-DD'));
  const [skeletonSize, setSkeletonSize] = useState(0);
  const {
    sidebar: { width: sidebarWidth },
  } = useCustomizerStore();
  const calendarRef = useRef<FullCalendar>(null);
  const skeletonContainerRef = useRef<HTMLDivElement>(null);

  const { data: events, isFetching } = useQuery({
    queryKey: ['tasks-calendar', date, applyFilters],
    queryFn: async () => {
      const searchParams = getAppSearchParams({
        filters,
      });
      searchParams.append('date', date);
      const response = await apiGetData(`tasks-calendar?${searchParams}`);
      return response?.data;
    },
    refetchOnWindowFocus: false,
    initialData: [],
  });

  const handleCalendarNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setDate(dayjs(calendarApi.getDate()).format('YYYY-MM-DD'));
      setCalendarTitle(dayjs(calendarApi.getDate()).format('MMMM YYYY'));
    }
  };

  const handleCalendarPrev = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setDate(dayjs(calendarApi.getDate()).format('YYYY-MM-DD'));
      setCalendarTitle(dayjs(calendarApi.getDate()).format('MMMM YYYY'));
    }
  };

  const handleCalendarToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setDate(dayjs(calendarApi.getDate()).format('YYYY-MM-DD'));
      setCalendarTitle(dayjs(calendarApi.getDate()).format('MMMM YYYY'));
    }
  };

  const handleCalendarView = (
    nextView: 'timeGridDay' | 'dayGridWeek' | 'dayGridMonth' | 'listWeek'
  ) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(nextView);
    }
  };

  const handleTaskClick = (taskClickInfo: EventClickArg) => {
    const { event: task } = taskClickInfo;
    openTaskProfile(+task.id);
  };

  const handleSetHeader = (dayHeaderContent: DayHeaderContentArg) => {
    const { date, view } = dayHeaderContent;
    if (view.type === 'timeGridDay' || view.type === 'dayGridWeek' || view.type === 'listWeek') {
      return dayjs(date).format('DD-MM-YYYY');
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (['timeGridDay', 'dayGridWeek', 'dayGridMonth'].includes(view)) {
        calendarApi.changeView(view);
      }
    }
  }, [view]);

  useEffect(() => {
    const skeletonContainer = skeletonContainerRef.current;
    if (skeletonContainer) {
      const rect = skeletonContainer.getBoundingClientRect();
      const size = (rect.width - 40) / 7;
      setSkeletonSize(size);
    }
  }, [sidebarWidth, view]);

  return (
    <Stack
      sx={(theme) => ({
        paddingTop: '.5rem',
        '--fc-today-bg-color': alpha(theme.palette.primary.light, 0.1),
      })}
    >
      <CustomToolbar
        view={view}
        hideToolbarSearch
        handleCalendarNext={handleCalendarNext}
        handleCalendarPrev={handleCalendarPrev}
        handleCalendarView={handleCalendarView}
        handleCalendarToday={handleCalendarToday}
        handleChangeView={handleChangeView}
        toggleFilters={toggleFilters}
        pageName={calendarTitle}
        showCalendar
        showBoard
      />
      <Stack sx={{ position: 'relative' }}>
        {isFetching && (
          <Stack
            ref={skeletonContainerRef}
            flexDirection='row'
            alignItems='flex-start'
            flexWrap='wrap'
            gap='5px'
            sx={{
              overflow: 'hidden',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255)',
              zIndex: 50,
              height: '100%',
            }}
          >
            {[...Array(49).keys()].map((_, id) => (
              <Grow in={!!skeletonSize} key={id}>
                <Skeleton variant='rectangular' width={skeletonSize} height={skeletonSize} />
              </Grow>
            ))}
          </Stack>
        )}
        <FullCalendar
          ref={calendarRef}
          key={sidebarWidth === 286 ? 1 : 2}
          headerToolbar={false}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          events={events}
          eventClick={handleTaskClick}
          initialView={'dayGridMonth'}
          dayHeaderContent={handleSetHeader}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            meridiem: false,
          }}
        />
      </Stack>
    </Stack>
  );
}
