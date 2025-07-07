import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Select,
  Col,
} from '@folio/stripes-components';

const DisplayInAccordion = ({
  fieldNamePrefix,
  dataOptions,
}) => {
  const intl = useIntl();

  return (
    <Col xs={3}>
      <Field
        name={`${fieldNamePrefix}.displayInAccordion`}
        label={intl.formatMessage({ id: 'stripes-smart-components.customFields.displayInAccordion' })}
        component={Select}
        dataOptions={dataOptions}
        vertical
      />
    </Col>
  );
};

DisplayInAccordion.propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
};

export default DisplayInAccordion;
