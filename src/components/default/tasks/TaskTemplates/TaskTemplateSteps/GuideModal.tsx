import Modal from '@/components/default/common/modals/Modal/Modal';
import { apiGetData } from '@/lib/fetch';
import GuideInfo from '../../components/GuideInfo';
import { useQuery } from '@tanstack/react-query';

interface IGuideModalProps {
  id?: number;
  name?: string;
  open: boolean;
  handleSetModal: (data: IGuideType | null) => void;
}

export default function GuideModal({ id, name, open, handleSetModal }: IGuideModalProps) {
  const { isFetching, data } = useQuery({
    queryKey: [`task-guide-${id}`, id],
    queryFn: async () => {
      const response = await apiGetData(`guides/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  return (
    <Modal
      title={`${name} (ID:${id})`}
      open={open}
      loading={isFetching}
      handleClose={() => handleSetModal(null)}
    >
      {data && <GuideInfo guide={data} />}
    </Modal>
  );
}
