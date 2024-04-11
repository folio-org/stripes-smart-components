import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Img } from 'react-image';

import { Loading } from '@folio/stripes-components';

import useProfilePicture from './utils';
import placeholderThumbnail from './icons/placeholderThumbnail.png';

import css from './ProfilePicture.css';

const isAValidURL = (str) => {
  return URL.canParse(str);
};

const ProfilePicture = ({ profilePictureSource, croppedLocalImage }) => {
  const intl = useIntl();
  const hasProfilePicture = Boolean(croppedLocalImage) || Boolean(profilePictureSource);
  const isProfilePictureSourceAURL = hasProfilePicture && isAValidURL(profilePictureSource);

  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureSource, isProfilePictureAUUID: !isProfilePictureSourceAURL });
  /**
   * Profile Picture Source can be
   * 1. an id(uuid) of profile picture stored in database or
   * 2. a link to an image - a url
   */
  const profilePictureSrc = croppedLocalImage || (isProfilePictureSourceAURL ? profilePictureSource : 'data:;base64,' + profilePictureData);
  const imgSrc = hasProfilePicture ? profilePictureSrc : placeholderThumbnail;

  if (isFetching) {
    return <Loading />;
  }

  return (
    <div data-test-profile-pic-div>
      <Img
        className={css.profilePlaceholder}
        alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
        src={imgSrc}
        loader={<Loading />}
      />
    </div>
  );
};

ProfilePicture.propTypes = {
  profilePictureSource: PropTypes.string,
  croppedLocalImage: PropTypes.string,
};

export default ProfilePicture;
