import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Icon,
  NoValue,
} from '@folio/stripes-components';

// Imported directly rather than through `utils/index` to keep this file out of the
// import cycle that `constants.js` would otherwise form via `fieldComponents`.
import useLookupRecord from '../../utils/useLookupRecord';

const propTypes = {
  asLink: PropTypes.bool,
  id: PropTypes.string,
  refEntityType: PropTypes.string,
};

/**
 * Renders the display label for a referenced record, or the reason it cannot be
 * shown. The raw UUID stays visible in those messages rather than an empty field.
 */
const LookupLabel = ({
  refEntityType,
  id,
  asLink = false,
}) => {
  const {
    label,
    isLoadingRecord,
    messageId,
    viewPath,
  } = useLookupRecord({ refEntityType, id });

  if (!id) return <NoValue />;

  if (messageId) {
    return (
      <span data-test-lookup-message>
        <FormattedMessage
          id={messageId}
          values={{ id, refEntityType }}
        />
      </span>
    );
  }

  if (isLoadingRecord) return <Icon icon="spinner-ellipsis" width="60px" />;

  if (asLink && viewPath) {
    return <Link to={viewPath}>{label}</Link>;
  }

  return <span data-test-lookup-label>{label}</span>;
};

LookupLabel.propTypes = propTypes;

export default LookupLabel;
