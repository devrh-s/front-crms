/* eslint-disable react/display-name */
import { Stack, Typography } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { forwardRef, useEffect, useMemo, useState } from 'react';

export interface IEditor {
  getContent: () => string;
  setContent: (content: string, args?: { format: string }) => void;
}

interface ExampleProps {
  value: string;
  height?: number;
  style?: any;
  fullScreen?: boolean;
  error?: string;
  required?: boolean;
  title?: string;
  onEditorChange: (newValue: string) => void;
  setEditorRef?: (editor: IEditor) => void;
  setUpdatedTime?: (time: number) => void;
}

const CustomTextEditor = forwardRef<any, ExampleProps>(
  (
    {
      value,
      height,
      title,
      style,
      fullScreen,
      error,
      required = false,
      setEditorRef,
      onEditorChange,
      setUpdatedTime,
    },
    ref
  ) => {
    const [switchEditor, setSwitchEditor] = useState(false);

    const initValues = useMemo(
      () => ({
        width: 'inherit',
        statusbar: !!switchEditor,
        height: height ?? 200,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'preview',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        init_instance_callback: (editor: any) => {
          editor.on('input', (e: any) => {
            if (setUpdatedTime) {
              setUpdatedTime(e?.timeStamp);
            }
          });
        },
      }),
      [height]
    );

    useEffect(() => {
      if (ref && typeof ref !== 'function') {
        setSwitchEditor(!switchEditor);
      }
    }, [fullScreen]);

    return (
      <Stack sx={{ position: 'relative', ...style }}>
        {title && (
          <Typography
            textTransform='capitalize'
            sx={{
              position: 'absolute',
              top: '-.8rem',
              left: '.4rem',
              zIndex: 10000,
              fontSize: '0.9rem',
              color: error ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
              bgcolor: '#fff',
              padding: '0 0.4rem',
              display: 'inline-flex',
              gap: '.2rem',
            }}
          >
            {title}
            {required && (
              <Typography component='span' color='#e53935'>
                *
              </Typography>
            )}
          </Typography>
        )}
        <Editor
          key={switchEditor ? '1' : '2'}
          tinymceScriptSrc='/tinymce/tinymce.min.js'
          onInit={(_evt, editor) => {
            if (ref) {
              if (typeof ref !== 'function') {
                ref.current = editor;
              }
            } else if (setEditorRef) {
              setEditorRef(editor);
            }
          }}
          onEditorChange={onEditorChange}
          value={value}
          init={initValues}
        />
        {error && <Typography color='error'>{error}</Typography>}
      </Stack>
    );
  }
);

export default CustomTextEditor;
