import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@folio/stripes-components';

import {
  HiddenField,
  NameField,
  HelpTextField,
  RequiredField,
  OptionsFields,
} from './shared-fields';

const propTypes = {
  fieldNamePrefix: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  values: {},
};

const SingleSelectDropdownFields = ({ fieldNamePrefix, values }) => (
  <>
    <Row>
      <HiddenField fieldNamePrefix={fieldNamePrefix} />
      <RequiredField fieldNamePrefix={fieldNamePrefix} />
      <NameField fieldNamePrefix={fieldNamePrefix} />
      <HelpTextField fieldNamePrefix={fieldNamePrefix} />
    </Row>
    <Row>
      <OptionsFields
        fieldNamePrefix={fieldNamePrefix}
        customFieldLabel={values.name}
      />
    </Row>
  </>
);

SingleSelectDropdownFields.propTypes = propTypes;
SingleSelectDropdownFields.defaultProps = defaultProps;

export default SingleSelectDropdownFields;
