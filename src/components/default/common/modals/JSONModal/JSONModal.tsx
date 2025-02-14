import { Box, Modal, List, Typography, Divider, ListItem } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
};

interface IHTMLModalProps {
  json: string;
  handleClose: () => void;
}

export default function JSONModal({ json, handleClose }: IHTMLModalProps) {
  const data = json ? JSON.parse(json) : {};
  const generateList = (data: any, k = 'main') => {
    const keys = Object.keys(data);
    return keys.map((key, ind) => {
      const value = data[key];
      if (Array.isArray(value)) {
        return (
          <ListItem
            key={`${key}-${k}-${ind}`}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <Typography
              sx={{
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              {key}:
            </Typography>
            <List>
              {value.map((el, ind) => {
                if (el instanceof Object) {
                  return (
                    <>
                      {generateList(el, `${ind}`)}
                      <Divider />
                    </>
                  );
                }
                return (
                  <ListItem
                    key={`${key}-${k}-${ind}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '0.5rem',
                    }}
                  >
                    <Typography>{el}:</Typography>
                  </ListItem>
                );
              })}
            </List>
          </ListItem>
        );
      }
      if (value instanceof Object) {
        const keyNumber = Number(key);
        const showKey = !Number.isNaN(keyNumber) ? keyNumber + 1 : key;
        return (
          <ListItem
            key={`${key}-${k}-${ind}`}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.5rem',
            }}
          >
            <Typography
              sx={{
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              {showKey}:
            </Typography>
            <List>{generateList(value)}</List>
          </ListItem>
        );
      }
      return (
        <ListItem
          key={`${key}-${k}-${ind}`}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
          }}
        >
          <Typography
            sx={{
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            {key}:
          </Typography>
          <Typography>{value}</Typography>
        </ListItem>
      );
    });
  };
  return (
    <Modal
      open={!!json}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <List
          sx={{
            overflow: 'auto',
            maxHeight: '100dvh',
          }}
        >
          {generateList(data)}
        </List>
      </Box>
    </Modal>
  );
}
