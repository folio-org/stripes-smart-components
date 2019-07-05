import React from 'react';
import PropTypes from 'prop-types';
import has from 'lodash/has';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import stripesForm from '@folio/stripes-form';
import {
  Button,
  Checkbox,
  Col,
  Layout,
  Row,
  TextField,
} from '@folio/stripes-components';

const propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/no-unused-prop-types
  addressObject: PropTypes.object,
  canDelete: PropTypes.bool,
  fieldComponents: PropTypes.object,
  handleCancel: PropTypes.func,
  handleDelete: PropTypes.func,
  handleSubmit: PropTypes.func,
  headerComponent: PropTypes.func,
  labelMap: PropTypes.object,
  uiId: PropTypes.string,
  visibleFields: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  fieldComponents: {
    country: TextField,
    addressLine1: TextField,
    addressLine2: TextField,
    city: TextField,
    stateRegion: TextField,
    zipCode: TextField,
    addressType: TextField,
  },
  headerComponent: address => (
    <Field
      label="Primary Address"
      name="primaryAddress"
      type="checkbox"
      id={`PrimaryAddress---${address.id}`}
      component={Checkbox}
    />
  ),
  labelMap: {
    addressType: <FormattedMessage id="stripes-smart-components.addressEdit.label.addressType" />,
    addressLine1: <FormattedMessage id="stripes-smart-components.addressEdit.label.addressLine1" />,
    addressLine2: <FormattedMessage id="stripes-smart-components.addressEdit.label.addressLine2" />,
    stateRegion: <FormattedMessage id="stripes-smart-components.addressEdit.label.stateRegion" />,
    zipCode: <FormattedMessage id="stripes-smart-components.addressEdit.label.zipCode" />,
    country: <FormattedMessage id="stripes-smart-components.addressEdit.label.country" />,
    city: <FormattedMessage id="stripes-smart-components.addressEdit.label.city" />,
  },
  visibleFields: [
    'country',
    'addressLine1',
    'addressLine2',
    'city',
    'stateRegion',
    'zipCode',
    'addressType',
  ],
};

// example validation for a required country field
//
// const validate = values => {
//  const errors = {};
//  if (values.country == "") {
//    errors.country = 'Required';
//  }
//
//  return errors;
// };


const validate = (values, props) => {
  const errors = {};
  const addressType = values.addressType;
  const addresses = props.addresses || [];

  if (!addressType) {
    errors.addressType = <FormattedMessage id="stripes-smart-components.error.addressTypeRequired" />;
  }
  if (addresses.find(addr => addr.addressType === addressType)) {
    errors.addressType = <FormattedMessage id="stripes-smart-components.error.addressTypeTaken" />;
  }

  return errors;
};


const AddressEdit = (props) => {
  const {
    addressObject,
    canDelete,
    uiId,
    handleSubmit,
    handleDelete,
    handleCancel,
    labelMap,
    visibleFields,
    headerComponent,
    fieldComponents
  } = props;

  const mergedFieldComponents = Object.assign(defaultProps.fieldComponents, fieldComponents);
  const groupArray = [];
  let rowArray = [];

  visibleFields.forEach((field, i) => {
    const fieldLabel = has(labelMap, field) ? labelMap[field] : field;
    const componentData = mergedFieldComponents[field];
    let component = componentData;
    let compProps = {};

    if (componentData.component) {
      component = componentData.component;
    }

    if (componentData.props) {
      compProps = componentData.props;
    }

    const fieldComponent = (
      <Col
        key={`col-${i}`}
        xs={4}
        {...{ [`data-test-${field}`]: true }}
      >
        <Field label={fieldLabel} name={field} {...compProps} component={component} />
      </Col>);
    rowArray.push(fieldComponent);

    // 3 fields per row...
    if (rowArray.length === 3 || i === visibleFields.length - 1) {
      groupArray.push(<Row key={`row-${i}`}>{rowArray}</Row>);
      rowArray = [];
    }
  }, this);

  return (
    <div>
      <form onSubmit={handleSubmit} id={`addressEdit-${uiId}`}>
        <Row>
          <Col xs={6}>{headerComponent(addressObject)}</Col>
        </Row>
        {groupArray}
        <Row>
          <Col xs={6}>
            <Field type="hidden" name="id" component="input" />
            <Field type="hidden" name="guiid" component="input" />
          </Col>
          <Col xs={6}>
            <Layout className="right marginTopHalf">
              { canDelete &&
                <Button buttonStyle="marginBottom0" onClick={() => handleDelete(uiId)}>
                  Remove this address
                </Button>
              }
              <Button buttonStyle="primary marginBottom0" type="submit">Save</Button>
              <Button buttonStyle="marginBottom0" onClick={() => handleCancel(uiId)}>Cancel</Button>
            </Layout>
          </Col>
        </Row>
      </form>
    </div>
  );
};

AddressEdit.propTypes = propTypes;
AddressEdit.defaultProps = defaultProps;

export default stripesForm({
  form: 'addressForm',
  validate,
  navigationCheck: true,
  enableReinitialize: true,
})(AddressEdit);
