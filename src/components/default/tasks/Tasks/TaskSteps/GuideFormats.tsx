import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { TextField } from '@mui/material';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import { IGuideFormat } from '../types';

interface IGuideFormatsProps {
  objects: Array<IOption>;
  formats: Array<IOption>;
  errors?: any;
  index: number;
  currentGuideFormat: IGuideFormat;
  guideFormats: IGuideFormat[];
  changeFormats: (event: any[]) => void;
}

export default function GuideFormats({
  index,
  currentGuideFormat,
  guideFormats,
  errors,
  objects,
  formats,
  changeFormats,
}: IGuideFormatsProps) {
  const editorRef = useRef<IEditor>();

  const setEditorRef = useCallback((editor: IEditor) => (editorRef.current = editor), []);

  return (
    <>
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={currentGuideFormat?.link}
        onChange={(e) => {
          const newValue = guideFormats ? [...guideFormats] : [];
          newValue[index ?? 0].link = e.target.value;
          changeFormats(newValue);
        }}
        error={!!errors?.guide_formats}
        helperText={errors?.guide_formats ? errors.guide_formats[index!]?.link?.message : ''}
        label='Link'
      />
      <CustomSingleSelect
        label='Objects'
        link='/objects'
        field={{
          value: currentGuideFormat?.object_id,
          onChange: (id: number | string) => {
            const newValue = guideFormats ? [...guideFormats] : [];
            newValue[index ?? 0].object_id = id;
            changeFormats(newValue);
          },
        }}
        required
        options={objects}
        error={errors?.guide_formats ? errors.guide_formats[index!]?.object_id?.message : ''}
      />

      <CustomSingleSelect
        label='Formats'
        link='/formats'
        field={{
          value: currentGuideFormat?.format_id,
          onChange: (id: number | string) => {
            const newValue = guideFormats ? [...guideFormats] : [];
            newValue[index ?? 0].format_id = id;
            changeFormats(newValue);
          },
        }}
        required
        options={formats}
        error={errors?.guide_formats ? errors.guide_formats[index!]?.format_id?.message : ''}
      />

      <CustomTextEditor
        setEditorRef={setEditorRef}
        title='description'
        value={currentGuideFormat?.description}
        onEditorChange={(editorText: string) => {
          const newValue = guideFormats ? [...guideFormats] : [];
          newValue[index ?? 0].description = editorText;
          changeFormats(newValue);
        }}
        error={errors?.guide_formats ? errors.guide_formats[index!]?.description?.message : ''}
        height={200}
      />
    </>
  );
}
