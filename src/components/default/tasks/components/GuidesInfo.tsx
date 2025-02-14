import { Box, Typography } from '@mui/material';
import { IGuidesInfo } from '../StepTemplates/types';
import GuideInfo from '../components/GuideInfo';
import NameLink from '../../common/components/NameLink';
interface IGuidesInfoProps {
  guides: IGuideType[];
}

export default function GuidesInfo({ guides }: IGuidesInfoProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        {Array.isArray(guides)
          ? guides.map((el: IGuideType) => (
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
                <NameLink href={`/guides/${el.id}`} name={el.name} sx={{ pl: 0 }} />
                <GuideInfo guide={el} />
              </Box>
            ))
          : null}
      </Box>
    </Box>
  );
}
