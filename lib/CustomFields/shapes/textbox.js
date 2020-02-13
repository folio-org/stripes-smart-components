import PropTypes from 'prop-types';

import { fieldTypes } from '../constants';

export default PropTypes.shape({
  entityType: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  order: PropTypes.number.isRequired,
  refId: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(Object.values(fieldTypes)).isRequired,
  visible: PropTypes.bool.isRequired,
});
