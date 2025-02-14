import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import MoreChips from '../../common/components/MoreChips';
import GuideFormat from './GuideFormat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IGuide } from '../Tasks/types';
interface IGuideInfoProps {
  guide: IGuideType | null;
}

export default function GuideInfo({ guide }: IGuideInfoProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        {guide && (
          <>
            {guide?.tools?.length > 0 && (
              <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Typography>Tools:</Typography> <MoreChips data={guide.tools} />
              </Box>
            )}

            {guide?.objects?.length > 0 && (
              <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Typography>Objects:</Typography> <MoreChips data={guide.objects} />
              </Box>
            )}

            {guide?.entities?.length > 0 && (
              <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Typography>Entities:</Typography> <MoreChips data={guide.entities} />
              </Box>
            )}

            {guide?.guide_formats?.length > 0 && (
              <Stack
                gap={'0.5rem'}
                sx={{
                  p: '0 0 0.5rem 0.2rem',
                }}
              >
                {guide.guide_formats.map((el: IGuideFormatType, index: number) => (
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
                      Guide Format: {el.format?.name} (ID:{el.id})
                    </AccordionSummary>
                    <AccordionDetails>
                      <GuideFormat data={el} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
