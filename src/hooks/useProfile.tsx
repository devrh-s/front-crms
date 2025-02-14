import { useState } from 'react';

export default function useProfile() {
  const [profileId, setProfileId] = useState(0);

  const handleSetProfile = (profileId: number) => setProfileId(profileId);
  const handleCloseProfile = () => setProfileId(0);

  return {
    profileId,
    handleSetProfile,
    handleCloseProfile,
  };
}
