import { useSnackbar, VariantType } from 'notistack';

export default function useNotification() {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (text: string, variant: VariantType) => {
    enqueueSnackbar(text, { variant });
  };

  return showNotification;
}
