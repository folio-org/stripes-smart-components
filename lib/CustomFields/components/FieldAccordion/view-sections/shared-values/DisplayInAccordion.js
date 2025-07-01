import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
} from '@folio/stripes-components';

const DisplayInAccordion = ({ value }) => {
  return (
    <Col xs={3}>
      <KeyValue
        label={<FormattedMessage id="stripes-smart-components.customFields.displayInAccordion" />}
        value={value || <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />}
      />
    </Col>
  );
};

DisplayInAccordion.propTypes = {
  value: PropTypes.string,
};

export default DisplayInAccordion;