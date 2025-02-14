import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import Icon from './Icon';

export interface IGPTAnswer {
  answer: string;
  link: string;
  thread_id: string;
}

interface IProps {
  isMobile?: boolean;
  isFullScreen?: boolean;
  isLoading: boolean;
  data: Record<string, any>;
  validationData: Record<string, boolean>;
  generateResponse: (data: Record<string, any>) => void;
  buttonText?: string;
}

const AiButton: FC<IProps> = ({
  buttonText,
  isLoading,
  data,
  validationData,
  isMobile = false,
  isFullScreen = false,
  generateResponse,
}) => {
  const validation = useMemo(() => {
    // const isPostTemplateValid = !!postTemplateId;
    // const isJobTemplateValid = !!jobTemplateId;
    // const isAccountPresent = !!accountId || !!jobAccountId;
    // const isContactAccountsValid = contactAccounts && contactAccounts?.length > 0;
    // const isTranslationValid = !!jobTemplateId && !!translationId;

    const requiredFields: string[] = [];
    for (const [key, value] of Object.entries(validationData)) {
      if (!value) {
        requiredFields.push(key as string);
      }
    }

    const isValid = !requiredFields.length;

    return {
      isValid,
      requiredFields,
    };
  }, [JSON.stringify(validationData)]);

  // const generateGPTMutation = useMutation({
  //   mutationFn: async (data: {
  //     postTemplateId?: number;
  //     jobAccountId?: number;
  //     accountId?: number;
  //   }) => {
  //     const { postTemplateId, jobAccountId, accountId } = data;

  //     const params = new URLSearchParams();
  //     if (accountId) params.append('account_id', accountId.toString());
  //     if (jobAccountId) params.append('job_account_id', jobAccountId.toString());
  //     if (postTemplateId) params.append('post_template_id', postTemplateId.toString());
  //     if (jobTemplateId) params.append('job_template_id', jobTemplateId.toString());
  //     if (translationId) params.append('translation_id', translationId.toString());

  //     contactAccounts?.forEach((account) => {
  //       params.append('contact_accounts[]', account.toString());
  //     });

  //     if (isRoleOverviewTranslation) {
  //       return apiGetDataUnsafe(`openai/role-overview-translation?${params.toString()}`);
  //     }

  //     if (jobTemplateId) {
  //       return apiGetDataUnsafe(`openai/post-template?${params.toString()}`);
  //     }

  //     if (jobAccountId) {
  //       return apiGetDataUnsafe(`openai/job-post?${params.toString()}`);
  //     }

  //     return apiGetDataUnsafe(`openai/job-post/instagram?${params.toString()}`);
  //   },
  //   onSuccess: (result) => {
  //     const { answer, thread_id, link } = result;
  //     onFullPostGet({ answer, thread_id, link });
  //   },
  //   onError: (responseError: ResponseError) => {
  //     const status = responseError?.status;
  //     const { error } = responseError.response?.data;
  //     handleErrors(error, status);
  //   },
  // });

  const handleGenerateGPTClick = () => {
    if (!validation.isValid) return;
    generateResponse(data);
  };

  return (
    <Stack
      flexDirection='column'
      alignItems='center'
      sx={{
        width: '100%',
      }}
    >
      <Button
        variant='contained'
        size='large'
        color='secondary'
        className={isMobile ? 'mobile' : ''}
        onClick={handleGenerateGPTClick}
        sx={{
          width: !isFullScreen ? '100%' : 'unset',
        }}
        endIcon={
          isLoading ? (
            <CircularProgress size={20} />
          ) : (
            <Icon
              type='gpt'
              size={20}
              color={!validation.isValid || isLoading ? '#00000042' : '#000'}
            />
          )
        }
        disabled={!validation.isValid || isLoading}
      >
        {`AI Generate ${buttonText}`}
      </Button>
      {!validation.isValid && (
        <Typography variant='caption' textAlign='center'>
          Add {` ${validation.requiredFields.join(', ')} `} for AI generate
        </Typography>
      )}
    </Stack>
  );
};

export default AiButton;
