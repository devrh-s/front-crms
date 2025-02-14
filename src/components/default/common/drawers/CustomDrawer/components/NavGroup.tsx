import { Dispatch, SetStateAction } from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
} from '@mui/material';
import { IMenuTheme } from '../types';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import NavLink from './NavLink';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IMenuItem } from '../types';

const Accordion: any = styled((props: any) => (
  <MuiAccordion component='div' disableGutters elevation={0} square {...props}>
    {props.children}
  </MuiAccordion>
))(({ theme }) => ({
  backgroundColor: theme.palette.menu.main,
  border: `none`,
  '&:not(:last-child)': {
    borderBottom: 'none',
  },
  '&::before': {
    display: 'none',
  },
  '& .MuiButtonBase-root': {
    minHeight: 'unset',
    borderBottom: 'none',
    outline: 'none',
  },
}));

const AccordionSummary: any = styled((props: { isActive?: boolean }) => {
  const cleanedProps = { ...props };
  delete cleanedProps.isActive;
  return (
    <MuiAccordionSummary
      expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
      {...cleanedProps}
    />
  );
})((props) => {
  const isActive = props.isActive;
  const theme = props.theme as IMenuTheme;
  return {
    backgroundColor: theme.palette.menu.main,
    padding: 0,
    color: isActive ? theme.palette.secondary.main : theme.palette.menu.contrastText,
    '&:hover': {
      color: theme.palette.secondary.main,
      '& .MuiSvgIcon-root': {
        color: theme.palette.secondary.main,
      },
    },
    flexDirection: 'row',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(180deg)',
    },
    '& .MuiAccordionSummary-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      margin: 0,
    },
  };
});

const AccordionDetails = styled(MuiAccordionDetails)((props) => {
  const theme = props.theme as IMenuTheme;
  return {
    padding: '1rem 1rem 0 1rem',
    backgroundColor: theme.palette.menu.main,
    width: '100%',
    border: 'none',
    outline: 'none',
  };
});

interface INavGroup extends IMenuItem {
  closeNavSubDesk: () => void;
  collapsed: boolean;
  index: number;
  expanded: Array<boolean>;
  setExpanded: Dispatch<SetStateAction<boolean[]>>;
}

export default function NavGroup({
  title,
  icon,
  closeNavSubDesk,
  collapsed,
  childItems,
  index,
  expanded,
  setExpanded,
}: INavGroup) {
  const pathname = usePathname();

  const isActive = childItems?.some(
    (item) => item.href !== '/' && pathname?.match(new RegExp(`^${item.href}(/\n)*`))
  );

  const handleExpandedChange = () =>
    setExpanded((prev) => prev.map((elem, ind) => (ind === index ? !elem : false)));

  return (
    <Accordion expanded={expanded[index]} onChange={handleExpandedChange}>
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon
            sx={{
              color: (theme: any) =>
                isActive ? theme.palette.secondary.main : theme.palette.menu.contrastText,
            }}
          />
        }
        aria-controls='panel1-content'
        id='panel1-header'
        isActive={isActive}
      >
        {icon}&nbsp;{title}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {childItems?.map((item: IMenuItem) => {
          return (
            <NavLink
              key={item.id}
              closeNavSubDesk={closeNavSubDesk}
              icon={item.icon}
              title={item.title}
              href={item.href}
              collapsed={collapsed}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
