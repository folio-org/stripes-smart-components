import React from 'react';
import PropTypes from 'prop-types';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Button,
  Col,
  Icon,
  Row,
  Select,
  Selection,
  TextField,
} from '@folio/stripes-components';

import { countriesOptions } from '../data/countries';
import css from './AddressEdit.css';

const omitUsedOptions = (list, usedValues, key, id) => {
  const unUsedValues = cloneDeep(list);
  usedValues.forEach((item, i) => {
    if (id !== i) {
      const usedValueIndex = findIndex(unUsedValues, v => v.value === item[key]);
      if (usedValueIndex !== -1) {
        unUsedValues.splice(usedValueIndex, 1);
      }
    }
  });
  return unUsedValues;
};

class EmbeddedAddressForm extends React.Component {
  static propTypes = {
    addressFieldName: PropTypes.string,
    addressLabel: PropTypes.node,
    // addressObject: PropTypes.object,
    canDelete: PropTypes.bool,
    change: PropTypes.func,
    displayKey: PropTypes.bool,
    displayPrimary: PropTypes.bool,
    Field: PropTypes.node,
    fieldComponents: PropTypes.object,
    fieldKey: PropTypes.number,
    handleDelete: PropTypes.func,
    // headerField: PropTypes.node,
    headerFields: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object,
    // headerComponent: PropTypes.func,
    labelMap: PropTypes.object,
    primary: PropTypes.func,
    values: PropTypes.object,
    visibleFields: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    addressLabel: <FormattedMessage id="stripes-smart-components.address.addressLabel" />,
    fieldComponents: {
      addressType: Select,
      addressLine1: TextField,
      addressLine2: TextField,
      city: TextField,
      stateRegion: TextField,
      zipCode: TextField,
      country: { component: Selection, props: { placeholder: 'Select Country', dataOptions: countriesOptions } },
    },
    headerFields: ['primaryAddress'],
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
      'addressType',
      'addressLine1',
      'addressLine2',
      'city',
      'stateRegion',
      'zipCode',
      'country',
    ],
    displayKey: true,
    displayPrimary: true,
  };

  constructor(props) {
    super(props);
    this.singlePrimary = this.singlePrimary.bind(this);
  }

  singlePrimary(id) {
    const { change, values } = this.props;

    values.personal.addresses.forEach((a, i) => {
      if (i === id) {
        change(`personal.addresses[${i}].primaryAddress`, true);
        change(`personal.addresses[${i}].primary`, true);
      } else {
        change(`personal.addresses[${i}].primaryAddress`, false);
        change(`personal.addresses[${i}].primary`, false);
      }
    });
  }

  render() {
    const {
      addressFieldName,
      addressLabel,
      fieldKey,
      labelMap,
      canDelete,
      fieldComponents,
      visibleFields,
      displayKey,
      displayPrimary,
      values,
      Field,
    } = this.props;

    const PrimaryRadio = ({ input, ...props }) => (
      <label className={css.primaryToggle} htmlFor={props.id}>
        <input
          type="radio"
          checked={input.value}
          id={props.id}
          onChange={() => { this.singlePrimary(fieldKey); }}
          name="primary"
        />
        <FormattedMessage id="stripes-smart-components.addressEdit.useAsPrimaryAddress" />
      </label>
    );

    const mergedFieldComponents = Object.assign(EmbeddedAddressForm.defaultProps.fieldComponents, fieldComponents);

    const renderedFields = visibleFields.map((fieldName, i) => {
      const fieldLabel = Object.prototype.hasOwnProperty.call(labelMap, fieldName) ?
        labelMap[fieldName] : fieldName;

      let field;
      if (Object.prototype.hasOwnProperty.call(mergedFieldComponents, fieldName)) {
        if (typeof (mergedFieldComponents[fieldName]) === 'object' && mergedFieldComponents[fieldName].component) {
          if (fieldName === 'addressType') {
            const list = omitUsedOptions(
              mergedFieldComponents[fieldName].props.dataOptions,
              values.personal ? values.personal.addresses : [],
              'addressType',
              fieldKey,
            );
            field = (
              <Field
                name={`${addressFieldName}.${fieldName}`}
                label={fieldLabel}
                component={mergedFieldComponents[fieldName].component}
                {...mergedFieldComponents[fieldName].props}
                dataOptions={list}
              />
            );
          } else {
            field = (
              <Field
                name={`${addressFieldName}.${fieldName}`}
                label={fieldLabel}
                component={mergedFieldComponents[fieldName].component}
                {...mergedFieldComponents[fieldName].props}
              />
            );
          }
        } else {
          field = (
            <Field
              name={`${addressFieldName}.${fieldName}`}
              label={fieldLabel}
              component={mergedFieldComponents[fieldName]}
            />
          );
        }
      }
      return (
        <Col xs={12} sm={3} key={`${fieldKey}-${i}`}>
          {field}
        </Col>
      );
    });

    return (
      <div className={css.addressForm}>
        <div className={css.addressFormHeader} start="xs">
          <div className={css.addressLabel}>
            { addressLabel }
            { displayKey && (this.props.fieldKey + 1) }
          </div>
          <div>
            { displayPrimary &&
              <Field
                component={PrimaryRadio}
                name={`${addressFieldName}.primary`}
                id={`PrimaryAddress---${addressFieldName}`}
                fieldKey={this.props.fieldKey}
              />
            }
          </div>
          <div className={css.addressHeaderActions}>
            {
              canDelete &&
              <Button
                data-test-delete-address-button
                buttonStyle="link slim"
                style={{ margin: 0, padding: 0 }}
                onClick={() => { this.props.handleDelete(fieldKey); }}
              >
                <Icon icon="trash" width="24px" height="24px" />
                <span className="sr-only">
                  <FormattedMessage id="stripes-smart-components.addressEdit.removeAddress" />
                  {this.props.fieldKey + 1}
                </span>
              </Button>
            }
          </div>
        </div>
        <div className={css.addressFormBody}>
          <Row key={fieldKey}>
            {renderedFields}
          </Row>
        </div>
      </div>
    );
  }
}

export default injectIntl(EmbeddedAddressForm);
