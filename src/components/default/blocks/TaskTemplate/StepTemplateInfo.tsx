import { Box, Typography } from '@mui/material';
import NameLink from '../../common/components/NameLink';
import ChecklistsInfo from '../../tasks/components/ChecklistsInfo';

interface IGuidesInfoProps {
  data: { name: string; checklist_items?: IChecklist[]; tool?: ITool };
}

export default function StepTemplateInfo({ data }: IGuidesInfoProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        {data?.tool && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 500,
                }}
              >{`Tool (ID:${data.tool.id}):`}</Typography>
              <Typography sx={{ fontWeight: 500 }}>{data.tool.name}</Typography>
            </Box>
            <NameLink
              href={data.tool.link ? data.tool.link : ''}
              name={data.tool.link}
              sx={{
                pl: 0,
                textTransform: 'lowercase',
              }}
            />
          </Box>
        )}
        <ChecklistsInfo data={data.checklist_items ? data.checklist_items : []} />
      </Box>
    </Box>
  );
}
