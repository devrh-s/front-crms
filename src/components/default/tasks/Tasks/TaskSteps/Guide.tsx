import { useState, Dispatch, useEffect, useCallback } from 'react';
import {
  Stack,
  TextField,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GuideFormats from './GuideFormats';
import { debounce } from '@/lib/helpers';
import { IGuideFormat } from '../types';

interface IGuideProps {
  guide: any;
  index: number;
  stepInd: number;
  checklistInd: number;
  commonData: ICommonData;
  dispatch: Dispatch<any>;
}

const defaultFormats: IGuideFormat = {
  id: '',
  link: '',
  object_id: '',
  format_id: '',
  description: '',
};

export default function Guide({
  index,
  stepInd,
  checklistInd,
  commonData,
  guide,
  dispatch,
}: IGuideProps) {
  const [guideName, setGuideName] = useState(guide?.name ?? '');
  const [guideTools, setGuideTools] = useState<number[]>(guide?.tools ?? []);
  const [guideEntities, setGuideEntities] = useState<number[]>(guide?.entities ?? []);
  const [guideObjects, setGuideObjects] = useState<number[]>(guide?.objects ?? []);
  const [guideFormats, setGuideFormats] = useState<IGuideFormat[]>(guide?.guide_formats ?? []);

  const tools = commonData.tools ?? [];
  const entities = commonData.entities ?? [];
  const objects = commonData.objects ?? [];
  const formats = commonData.formats ?? [];

  const updateGuide = useCallback(
    debounce(
      ({
        stepInd,
        checklistInd,
        index,
        guideName,
        guideTools,
        guideEntities,
        guideObjects,
        guideFormats,
      }: any) =>
        dispatch({
          type: 'editGuides',
          payload: {
            stepInd,
            checklistInd,
            guideInd: index,
            name: guideName,
            tools: guideTools,
            objects: guideObjects,
            entities: guideEntities,
            guide_formats: guideFormats,
          },
        }),
      500
    ),
    []
  );

  useEffect(() => {
    updateGuide({
      stepInd,
      checklistInd,
      index,
      guideName,
      guideTools,
      guideEntities,
      guideObjects,
      guideFormats,
    });
  }, [guideName, guideTools, guideEntities, guideObjects, guideFormats]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1-content'
        id='panel1-header'
      >
        {index + 1}.&nbsp;{guide?.name}
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <TextField
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          variant='standard'
          InputLabelProps={{ shrink: true }}
          label={`Name of Guide ${index + 1}`}
          sx={{
            width: '100%',
          }}
        />
        <CustomSelect
          type='Tools'
          link='/tooks'
          options={tools}
          value={guideTools}
          handleChange={(ids: number[]) => setGuideTools(ids)}
        />
        <CustomSelect
          type='Entities'
          link='/entities'
          options={entities}
          value={guideEntities}
          handleChange={(ids: number[]) => setGuideEntities(ids)}
        />
        <CustomSelect
          type='Objects'
          link='/objects'
          options={objects}
          value={guideObjects}
          handleChange={(ids: number[]) => setGuideObjects(ids)}
        />

        <Stack
          sx={{
            width: '100%',
          }}
          gap='1rem'
        >
          <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='3px'>
            <Typography
              sx={{
                fontSize: '1.2rem',
              }}
            >
              Formats
            </Typography>
            <IconButton
              size='small'
              color='primary'
              onClick={() => {
                setGuideFormats((prev) => [...prev, defaultFormats]);
              }}
            >
              <AddCircleOutlineIcon
                sx={{
                  width: '1.5rem',
                  height: '1.5rem',
                }}
              />
            </IconButton>
          </Stack>
          <Stack
            gap='1rem'
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {guideFormats.map((el, index) => (
              <Stack
                key={index}
                gap='1rem'
                sx={{
                  position: 'relative',
                  border: '1px solid #555252',
                  padding: '1rem',
                  borderRadius: '6px',
                  width: '100%',
                }}
              >
                <IconButton
                  color='error'
                  onClick={() => setGuideFormats((prev) => prev.filter((_, ind) => ind !== index))}
                  sx={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    zIndex: 100,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <GuideFormats
                  currentGuideFormat={el}
                  guideFormats={guideFormats}
                  formats={formats}
                  objects={objects}
                  index={index}
                  changeFormats={(guideFormats: IGuideFormat[]) => setGuideFormats(guideFormats)}
                  // setEditorRef={(editor: IEditor) =>
                  //   (formatsEditorsRef.current[index] = editor)
                  // }
                />
                {/* <GuidesInputs
                  onChange={(newGuideFormats: IGuideFormat[]) => setGuideFormats(newGuideFormats)}
                  guidesArr={guideFormats}
                  index={index}
                  elem={el}
                  setEditorRef={(editor: IEditor) =>
                    (formatsEditorsRef.current[index] = editor)
                  }
                  objects={objects}
                  formats={formats}
                /> */}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
