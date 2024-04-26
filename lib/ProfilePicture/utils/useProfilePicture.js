import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes-core';

const API = 'users/profile-picture';

/**
 * A hook to fetch profile picture blob data of a user.
 *
 * @param {Object} params - Parameters for fetching profile picture.
 *
 * @param {string} params.profilePictureId - The source of the profile picture (can be UUID or an Url).
 *
 * @param {boolean} params.isProfilePictureAUUID - Indicates whether profilePictureLink is a UUID.
 *
 * @param {Object} options - Additional options for the useQuery hook.
 *
 * @returns {Object} - An object containing fetching state and profile picture blob data.
 */
const useProfilePicture = ({ profilePictureId, isProfilePictureAUUID }, options = {}) => {
  const ky = useOkapiKy();
  const stripes = useStripes();
  const [namespace] = useNamespace({ key: 'get-profile-picture-of-a-user' });
  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, profilePictureId],
    () => {
      return ky.get(`${API}/${profilePictureId}`).json();
    },
    {
      enabled: stripes.hasInterface('users', '16.1') && Boolean(profilePictureId) && isProfilePictureAUUID,
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
