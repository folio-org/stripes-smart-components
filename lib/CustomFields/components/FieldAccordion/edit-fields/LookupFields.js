import PropTypes from 'prop-types';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { Field } from 'react-final-form';

import {
  Col,
  Layout,
  Row,
  Select,
} from '@folio/stripes-components';

import { getLookupRefEntityTypeOptions } from '../../../lookup';
import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  DisplayInAccordion,
} from './shared-fields';

const propTypes = {
  displayInAccordionOptions: PropTypes.arrayOf(PropTypes.object),
  fieldNamePrefix: PropTypes.string.isRequired,
  hasDisplayInAccordionField: PropTypes.bool,
  isRefEntityTypeInUse: PropTypes.bool,
  isRefEntityTypeLocked: PropTypes.bool,
};

// The selector is also locked while usage is still unknown; the explanation is only
// shown once usage is confirmed, so it never claims records that may not exist.
const LookupFields = ({
  fieldNamePrefix,
  displayInAccordionOptions,
  hasDisplayInAccordionField,
  isRefEntityTypeLocked = false,
  isRefEntityTypeInUse = false,
}) => {
  const { formatMessage } = useIntl();

  return (
    <Row>
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
      <Col xs={3}>
        <Field
          name={`${fieldNamePrefix}.lookupField.refEntityType`}
          label={formatMessage({ id: 'stripes-smart-components.customFields.lookup.refEntityType' })}
          component={Select}
          dataOptions={getLookupRefEntityTypeOptions(formatMessage)}
          disabled={isRefEntityTypeLocked}
          required
          vertical
        />
        {isRefEntityTypeInUse && (
          <Layout className="marginTop1" data-test-lookup-ref-entity-type-locked>
            <FormattedMessage id="stripes-smart-components.customFields.lookup.refEntityType.locked" />
          </Layout>
        )}
      </Col>
      {hasDisplayInAccordionField && (
        <DisplayInAccordion
          fieldNamePrefix={fieldNamePrefix}
          dataOptions={displayInAccordionOptions}
        />
      )}
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
    </Row>
  );
};

LookupFields.propTypes = propTypes;

export default LookupFields;
