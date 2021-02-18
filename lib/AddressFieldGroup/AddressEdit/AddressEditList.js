/*
*   Component for editing a list of addresses in the midst of a form.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray as FinalFormFieldArray } from 'react-final-form-arrays';
import { FieldArray as ReduxFormFieldArray } from 'redux-form';
import { FormSpy } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import { Button, Col, Layout, Row } from '@folio/stripes-components';

import EmbeddedAddressFinalForm from './EmbeddedAddressFinalForm';
import EmbeddedAddressReduxForm from './EmbeddedAddressReduxForm';

import css from './AddressEdit.css';

const propTypes = {
  formType: PropTypes.oneOf(['redux-form', 'final-form']),
  label: PropTypes.node,
  name: PropTypes.string,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};

const defaultProps = {
  label: <FormattedMessage id="stripes-smart-components.addresses" />,
  formType: 'redux-form',
};

class AddressEditList extends React.Component {
  constructor(props) {
    super(props);

    this.renderFieldGroups = this.renderFieldGroups.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  onAdd(fields) {
    fields.push({});
    if (this.props.onAdd) {
      this.props.onAdd(fields.length - 1);
    }
  }

  onDelete(fields, index) {
    fields.remove(index);
    if (this.props.onDelete) {
      this.props.onDelete(index);
    }
  }

  renderFinalFormItems = (fields) => {
    return (
      <FormSpy>
        {
          ({ values, form: { change } }) => (
            fields.map((fieldName, i) => (
              <li className={css.addressFormListItem} key={i}>
                <EmbeddedAddressFinalForm
                  fieldKey={i}
                  values={values}
                  change={change}
                  addressFieldName={fieldName}
                  handleDelete={(index) => { this.onDelete(fields, index); }}
                  {...this.props}
                />
              </li>
            ))
          )
        }
      </FormSpy>
    );
  }

  renderReduxFormItems = (fields) => {
    return fields.map((fieldName, i) => (
      <li className={css.addressFormListItem} key={i}>
        <EmbeddedAddressReduxForm
          fieldKey={i}
          addressFieldName={fieldName}
          handleDelete={(index) => { this.onDelete(fields, index); }}
          {...this.props}
        />
      </li>
    ));
  }

  renderFieldGroups({ fields }) {
    const { formType } = this.props;

    return (
      <div className={css.addressEditList}>
        <Row>
          <Col xs>
            <div className={css.legend} id="addressGroupLabel">{this.props.label}</div>
          </Col>
        </Row>
        <Row>
          <Col xs>
            {fields.length === 0 &&
              <div><em><FormattedMessage id="stripes-smart-components.address.noAddressesStored" /></em></div>
            }
            <ul className={css.addressFormList} aria-labelledby="addressGroupLabel">
              { formType === 'redux-form' ?
                this.renderReduxFormItems(fields) :
                this.renderFinalFormItems(fields)
              }
            </ul>
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Layout>
              <Button
                type="button"
                onClick={() => { this.onAdd(fields); }}
                data-test-add-address-button
              >
                <FormattedMessage
                  id="stripes-smart-components.address.addAddress"
                />
              </Button>
            </Layout>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { formType } = this.props;
    const FieldArray = (formType === 'redux-form') ?
      ReduxFormFieldArray :
      FinalFormFieldArray;

    return (
      <FieldArray name={this.props.name} component={this.renderFieldGroups} />
    );
  }
}

AddressEditList.propTypes = propTypes;
AddressEditList.defaultProps = defaultProps;

export default AddressEditList;
