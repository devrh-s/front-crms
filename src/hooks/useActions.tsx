import { useState } from 'react';

export default function useActions(id: number | null = null) {
  const [actionsData, setActionsData] = useState<IActionsData>({
    visible: false,
    id,
    isDuplicate: false,
  });
  const [deleteModal, setDeleteModal] = useState<IDeleteModal>({
    open: false,
    ids: [],
  });
  const [note, setNote] = useState('');
  const [description, setDescription] = useState('');

  const handleSetDescription = (newDescription: string) => setDescription(newDescription);
  const handleSetNote = (newNote: string) => setNote(newNote);

  const handleActions = (visible: boolean, id?: number | null, isDuplicate?: boolean) =>
    setActionsData({ id: id ?? null, visible, isDuplicate });

  const handleDeleteModal = (open: boolean, ids?: number[] | null) =>
    setDeleteModal({ ids: ids ?? [], open });

  const handleClose = () => {
    setDeleteModal((prev) => ({
      ids: [],
      open: false,
    }));
  };

  return {
    note,
    description,
    actionsData,
    deleteModal,
    handleActions,
    handleSetDescription,
    handleSetNote,
    handleDeleteModal,
    handleClose,
  };
}
