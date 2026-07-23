import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const DisplayInAccordion = ({
  value,
  dataOptions,
}) => {
  const label = dataOptions.find(option => option.value === value)?.label;

  return (
    <Col xs={3}>
      <KeyValue
        label={<FormattedMessage id="stripes-smart-components.customFields.displayInAccordion" />}
        value={label || <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />}
      />
    </Col>
  );
};

DisplayInAccordion.propTypes = {
  dataOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string,
};

export default DisplayInAccordion;
