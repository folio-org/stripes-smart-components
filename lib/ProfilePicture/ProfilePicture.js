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

const ProfilePicture = ({ profilePictureLink, croppedLocalImage }) => {
  const intl = useIntl();
  const hasProfilePicture = Boolean(croppedLocalImage) || Boolean(profilePictureLink);
  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);

  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink, isProfilePictureAUUID: !isProfilePictureLinkAURL });
  /**
   * Profile Picture Link can be
   * 1. an id(uuid) of profile picture stored in database or
   * 2. a link to an image - a url
   */
  const profilePictureSrc = croppedLocalImage || (isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData);
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
  profilePictureLink: PropTypes.string,
  croppedLocalImage: PropTypes.string,
};

export default ProfilePicture;
