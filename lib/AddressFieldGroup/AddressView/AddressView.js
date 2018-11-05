import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { has } from 'lodash';

import { Col, KeyValue, LayoutHeader, Row } from '@folio/stripes-components';
import css from './AddressView.css';

const propTypes = {
  addressObject: PropTypes.object,
  canEdit: PropTypes.bool,
  handleEdit: PropTypes.func,
  headerField: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  headerFormatter: PropTypes.func,
  labelMap: PropTypes.object,
  uiId: PropTypes.string,
  visibleFields: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  headerField: 'primaryAddress',
  headerFormatter: address => (address.primaryAddress ? 'Primary' : 'Alternate'),
  visibleFields: [
    'addressType',
    'addressLine1',
    'addressLine2',
    'city',
    'stateRegion',
    'zipCode',
    'country',
  ],
};

function AddressView(props) {
  const {
    addressObject,
    canEdit,
    handleEdit,
    uiId,
    visibleFields,
    headerFormatter,
  } = props;

  const defaultLabelMap = {

    addressLine1: <FormattedMessage id="stripes-components.addressLine1" />,
    addressLine2: <FormattedMessage id="stripes-components.addressLine2" />,
    stateRegion: <FormattedMessage id="stripes-components.stateProviceOrRegion" />,
    zipCode: <FormattedMessage id="stripes-components.zipOrPostalCode" />,
    addressType: <FormattedMessage id="stripes-components.addressType" />,
    city: <FormattedMessage id="stripes-components.city" />,
    country: <FormattedMessage id="stripes-components.country" />
  };
  const labelMap = props.labelMap || defaultLabelMap;
  const groupArray = [];
  let rowArray = [];

  props.visibleFields.forEach((field, i) => {
    const fieldLabel = has(labelMap, field) ? labelMap[field] : field;
    const fieldComponent = (
      <Col xs={3} key={`${fieldLabel}-${field}`}>
        <KeyValue label={fieldLabel} value={addressObject[field]} />
      </Col>
    );
    rowArray.push(fieldComponent);

    // 3 fields per row...
    if (rowArray.length === 4 || i === visibleFields.length - 1) {
      groupArray.push(<Row key={i}>{rowArray}</Row>);
      rowArray = [];
    }
  }, this);

  const actions = [{
    title: <FormattedMessage id="stripes-components.editThisAddress" />,
    icon: 'edit',
    handler: () => handleEdit(uiId)
  }];
  const primaryAddressMsg = <FormattedMessage id="stripes-components.primaryAddress" />;
  const alternateAddressMsg = <FormattedMessage id="stripes-components.alternateAddress" />;

  return (
    <div
      className={css.addressItem}
      aria-label={(addressObject.primaryAddress && primaryAddressMsg) || alternateAddressMsg}
      tabIndex="0"
      role="tabpanel"
      data-group-id={uiId}
    >
      <LayoutHeader level={5} title={headerFormatter(addressObject)} actions={actions} noActions={!canEdit} />
      <div className={css.addressItemContent}>
        {groupArray}
      </div>
    </div>
  );
}

AddressView.propTypes = propTypes;
AddressView.defaultProps = defaultProps;

export default AddressView;
