import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes-core';

const PROFILE_PIC_API = 'users/profile-picture';

/**
 * A hook to fetch profile picture blob data of a user.
 *
 * @param {Object} params - Parameters for fetching oprofile picture.
 *
 * @param {string} params.profilePictureId - The source of the profile picture (can be UUID or an Url).
 *
 * @param {boolean} params.isProfilePictureAUUID - Indicates whether profilePictureSource is a UUID.
 *
 * @param {Object} options - Additional options for the useQuery hook.
 *
 * @returns {Object} An object containing fetching state and profile picture blob data.
 */
const useProfilePicture = ({ profilePictureId, isProfilePictureAUUID }, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'get-profile-picture-of-a-user' });
  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, profilePictureId],
    () => {
      return ky.get(`${PROFILE_PIC_API}/${profilePictureId}`).json();
    },
    {
      enabled: Boolean(profilePictureId) && isProfilePictureAUUID,
      ...options,
    }
  );

  return ({
    isLoading,
    isFetching,
    profilePictureData: data?.profile_picture_blob,
  });
};
export default useProfilePicture;
