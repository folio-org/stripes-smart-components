import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Checkbox,
} from '@folio/stripes-components';

import styles from './HiddenValue.css';

const propTypes = { value: PropTypes.bool.isRequired };

const HiddenValue = ({ value }) => (
  <Col
    xs={1}
    className={styles.hiddenField}
  >
    <Checkbox
      checked={!value}
      label={<FormattedMessage id="stripes-smart-components.customFields.hidden" />}
      disabled
      vertical
    />
  </Col>
);

HiddenValue.propTypes = propTypes;

export default HiddenValue;
