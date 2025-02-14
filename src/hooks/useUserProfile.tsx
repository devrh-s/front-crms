import { useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useUserProfileStore } from '@/zustand/userProfileStore';
import { apiGetData } from '@/lib/fetch';

export default function useUserProfile() {
  const { user, entityBlockId, setUserProfile, setEntityBlockId, clearUserProfile } =
    useUserProfileStore();

  const { data: currentUser, refetch } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: () => apiGetData('profile'),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (currentUser) {
      setUserProfile(currentUser.data);
      setEntityBlockId(currentUser.entity_block_id);
    }
  }, [currentUser]);

  return {
    userProfile: user,
    entityBlockId: entityBlockId,
    clearUserProfile,
    updateUserProfile: refetch,
  };
}
