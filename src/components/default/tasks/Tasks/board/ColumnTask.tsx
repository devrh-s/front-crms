import { apiGetData } from '@/lib/fetch';
import { Box, Button, Collapse, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { darkenColor } from './helpers';
import ShowMoreBox from './ShowMoreBox';
import { Task } from './types';

interface IColumnTaskProps {
  id: number;
  color: string;
  name: string;
  count_tasks: number;
  current_tasks: number;
  tasks: Task[];
  setIdProfile: Dispatch<SetStateAction<number | null>>;
}

export default function ColumnTask({
  id,
  color,
  name,
  tasks,
  count_tasks,
  current_tasks,
  setIdProfile,
}: IColumnTaskProps) {
  const [tasksArray, setTasksArray] = useState<Task[]>(tasks);
  const [page, setPage] = useState(1);
  const [currentsTasks, setCurrentTasks] = useState(current_tasks);
  const [isLoading, setIsLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const showLoadButton = (mdDown ? showMore : true) && currentsTasks < count_tasks;

  useEffect(() => {
    setTasksArray(tasks);
    setCurrentTasks(current_tasks);
  }, [tasks]);

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await apiGetData(`taskboard/${id}?perPage=6&page=${page + 1}`);
      setTasksArray((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
      setCurrentTasks((prev) => prev + response.data.length);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Droppable droppableId={`${id}`} key={id} type='card'>
      {(provided) => (
        <Stack
          {...provided.droppableProps}
          ref={provided.innerRef}
          padding={'0.5rem'}
          spacing={1}
          alignItems={'center'}
          borderRadius={'1rem'}
          bgcolor={color}
          color={'white'}
          height={'fit-content'}
          minWidth={'300px'}
          sx={{
            flexBasis: { xs: '100%', sm: '48%', md: '300px' },
            maxWidth: { xs: '100%', sm: '48%', md: '450px' },
            width: '100%',
          }}
        >
          <Typography variant='h5'>{name}</Typography>

          {mdDown && showMore && (
            <ShowMoreBox showMore={showMore} setShowMore={setShowMore} hideTasks />
          )}

          <Collapse in={!mdDown || showMore} timeout={300} sx={{ width: '100%' }}>
            <Stack spacing={1} width={'100%'}>
              {tasksArray.map((item, index) => (
                <Draggable draggableId={`${item.id}`} index={index} key={item.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card
                        assignees={item.assignees}
                        controllers={item.controllers}
                        count_completed_steps={item.count_completed_steps}
                        count_edits={item.count_edits}
                        count_incompleted_steps={item.count_incompleted_steps}
                        is_completed={item.is_completed}
                        priority={item.priority}
                        title={item.title}
                        id={item.id}
                        color={color}
                        order={item.order}
                        setIdProfile={setIdProfile}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          </Collapse>

          {showLoadButton && (
            <Button
              fullWidth
              variant='contained'
              onClick={() => loadMore()}
              disabled={isLoading}
              sx={{
                backgroundColor: darkenColor(color),
                borderRadius: '0.75rem',
                '&:hover': {
                  backgroundColor: darkenColor(color, 0.85),
                },
              }}
            >
              Load More
            </Button>
          )}

          {mdDown && <ShowMoreBox showMore={showMore} setShowMore={setShowMore} hideTasks />}
        </Stack>
      )}
    </Droppable>
  );
}
