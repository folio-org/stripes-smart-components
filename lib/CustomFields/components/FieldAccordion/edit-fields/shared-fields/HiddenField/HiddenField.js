import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  Checkbox,
} from '@folio/stripes-components';

import styles from './HiddenField.css';

const propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
};

const HiddenField = ({ fieldNamePrefix }) => (
  <Col
    xs={1}
    className={styles.hiddenField}
  >
    <Field
      type="checkbox"
      component={Checkbox}
      name={`${fieldNamePrefix}.hidden`}
      label={<FormattedMessage id="stripes-smart-components.customFields.hidden" />}
      vertical
      data-test-custom-fields-hidden-checkbox
    />
  </Col>
);

HiddenField.propTypes = propTypes;

export default HiddenField;
