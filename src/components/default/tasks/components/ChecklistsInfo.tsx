import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import GuideInfo from '../components/GuideInfo';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IChecklistItem } from '../Tasks/types';
import NameLink from '../../common/components/NameLink';
interface IGuidesInfoProps {
  data: IChecklist[] | [];
}

export default function ChecklistsInfo({ data }: IGuidesInfoProps) {
  return (
    <Box sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
      {data.length > 0
        ? data.map((el) => (
            <Box
              key={el.id}
              sx={{
                display: 'flex',
                gap: '0.6rem',
                flexDirection: 'column',
                borderRadius: '0.5rem',
                backgroundColor: '#EBEBEB',
                p: '1rem',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                  }}
                >
                  Checklist Item (ID:{el.id}):
                </Typography>
                <NameLink href={`/checklist-items/${el.id}`} sx={{ pl: 0 }} name={el.name} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItem: 'center',
                  flexDirection: 'column',
                  gap: '0rem',
                }}
              >
                {el.guides.length > 0 &&
                  el.guides.map((el, index) => (
                    <Accordion
                      key={`${el.id}_${index}`}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel1-content'
                        id='panel1-header'
                      >
                        <Stack flexDirection={'row'} flexWrap={'wrap'} columnGap={'0.5rem'}>
                          <Typography
                            sx={{
                              fontSize: '15px',
                              fontWeight: 500,
                            }}
                          >
                            Guide(ID:{el.id}):
                          </Typography>
                          <NameLink href={`/guides/${el.id}`} name={el.name} sx={{ pl: 0 }} />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <GuideInfo guide={el} />
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Box>
            </Box>
          ))
        : null}
    </Box>
  );
}
