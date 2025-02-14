import { Chip, Stack } from '@mui/material';
import { useMemo, useState } from 'react';
import DynamicComponent from './DynamicComponent';

type Exception = 'user';

type Component = 'user' | 'translation';

interface IMoreChipsProps {
  data: Array<any>;
  propName?: 'name' | 'iso2' | 'iso3' | 'title' | 'front_name' | 'link';
  exception?: Exception;
  component?: Component;
  sx?: any;
  click?: any;
  handleSetModal?: any;
  labelStyle?: any;
}

interface IData {
  id: number | string;
  name?: string;
  iso2?: string;
  iso3?: string;
  title?: string;
  front_name?: string;
  image?: string;
  user?: IUser;
  profession_id?: number;
  link?: string;
}

function getComponentName(component?: Component, exception?: Exception) {
  if (exception) {
    return `${exception[0].toUpperCase() + exception.slice(1)}Chip`;
  }
  if (component) {
    return `${component[0].toUpperCase() + component.slice(1)}Chip`;
  }
  return 'CustomChip';
}

export default function MoreChips({
  data,
  propName,
  exception,
  component,
  sx,
  click,
  handleSetModal,
  labelStyle,
}: IMoreChipsProps) {
  const [showMore, setShowMore] = useState(false);

  const visibleData = useMemo(() => {
    if (!data) return [];
    if (!exception) {
      return data;
    }
    return data.map((elem) => elem[exception]).filter(Boolean);
  }, [data, exception]);

  const is = getComponentName(component, exception);

  return (
    <Stack
      className='customScroll'
      flexDirection='row'
      flexWrap='wrap'
      gap='.5rem'
      sx={{ ...sx, overflowX: 'hidden' }}
    >
      {!showMore && (
        <>
          {visibleData?.[0] && !exception && (
            <DynamicComponent
              click={click}
              handleSetModal={handleSetModal}
              is={is}
              data={visibleData[0]}
              label={
                propName && typeof visibleData[0] === 'object'
                  ? (visibleData[0] as IData)[propName]
                  : (visibleData[0] as IData)?.name
              }
              sx={{ labelStyle }}
            />
          )}
          {visibleData?.[1] && !exception && (
            <DynamicComponent
              click={click}
              handleSetModal={handleSetModal}
              is={is}
              data={visibleData[1]}
              label={
                propName && typeof visibleData[1] === 'object'
                  ? (visibleData[1] as IData)[propName]
                  : (visibleData[1] as IData)?.name
              }
              sx={{ labelStyle }}
            />
          )}
          {visibleData?.length - 2 > 0 && (
            <Chip
              color='primary'
              label={`+${visibleData?.length - 2}`}
              onClick={() => setShowMore(true)}
            />
          )}
        </>
      )}
      {showMore && (
        <>
          {visibleData?.map((elem, index) => (
            <DynamicComponent
              click={click}
              handleSetModal={handleSetModal}
              is={is}
              key={index}
              data={elem}
              label={
                propName && typeof visibleData[index] === 'object'
                  ? (visibleData[index] as IData)[propName]
                  : (visibleData[index] as IData)?.name
              }
              sx={{ labelStyle }}
            />
          ))}
          <Chip
            color='primary'
            label='CLOSE'
            onClick={() => setShowMore(false)}
            sx={{ fontSize: '.6rem' }}
          />
        </>
      )}
    </Stack>
  );
}
