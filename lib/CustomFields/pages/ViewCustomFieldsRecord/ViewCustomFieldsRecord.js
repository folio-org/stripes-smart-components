import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { chunk } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Accordion,
  Callout,
  KeyValue,
  NoValue,
  Row,
  Col,
  Checkbox,
  Icon,
  Badge,
} from '@folio/stripes-components';

import {
  rowShapes,
  fieldTypes,
} from '../../constants';

import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import {
  useCustomFieldsFetch,
  useSectionTitleFetch,
  useLoadingErrorCallout,
} from '../../utils';

const {
  TEXTAREA,
  TEXTFIELD,
  RADIO_BUTTON_GROUP,
  SELECT,
  MULTISELECT,
  CHECKBOX,
  DATE_PICKER
} = fieldTypes;

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  customFieldsLabel: PropTypes.node,
  customFieldsValues: PropTypes.object.isRequired,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  noCustomFieldsFoundLabel: PropTypes.node,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func,
};

const defaultProps = {
  columnCount: 4,
  customFieldsLabel: <FormattedMessage id="stripes-smart-components.customFields" />,
  noCustomFieldsFoundLabel: <FormattedMessage id="stripes-smart-components.customFields.noCustomFieldsFound" />,
};

const ViewCustomFieldsRecord = ({
  accordionId,
  onToggle,
  expanded,
  okapi,
  backendModuleId,
  backendModuleName,
  entityType,
  customFieldsValues,
  columnCount,
  customFieldsLabel,
  noCustomFieldsFoundLabel,
}) => {
  const {
    customFields,
    customFieldsLoaded,
    customFieldsFetchFailed,
  } = useCustomFieldsFetch(okapi, backendModuleId, entityType);

  const {
    sectionTitle,
    sectionTitleLoaded,
    sectionTitleFetchFailed,
  } = useSectionTitleFetch(okapi, backendModuleName.toUpperCase());

  const { formatDate } = useIntl();

  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const columnWidth = rowShapes / columnCount;

  const visibleCustomFields = customFields?.filter(customField => customField.visible);
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);

  const displayWhenClosed = (sectionTitleLoaded && customFieldsLoaded)
    ? (<Badge>{visibleCustomFields.length}</Badge>)
    : (<Icon icon="spinner-ellipsis" width="10px" />);

  const customFieldsAccordionTitle = sectionTitle.value || customFieldsLabel;

  const findOptionLabelById = customField => optionId => {
    return customField.selectField.options.values.find(option => option.id === optionId).value;
  };

  const getSelectedOptionLabel = customField => {
    const selectedOptionId = customFieldsValues[customField.refId];

    return findOptionLabelById(customField)(selectedOptionId);
  };

  const getMultiselectOptionLabels = customField => {
    const selectedOptionsIds = customFieldsValues[customField.refId];
    const selectedOptionsLabels = selectedOptionsIds.map(findOptionLabelById(customField));

    return selectedOptionsLabels.join(', ');
  };

  const formatValue = customField => {
    const {
      refId,
      type,
    } = customField;

    const customFieldValue = customFieldsValues[refId];

    if (refId in customFieldsValues && customFieldValue !== '') {
      if (type === MULTISELECT && customFieldValue.length) {
        return getMultiselectOptionLabels(customField);
      }

      if (type === CHECKBOX) {
        return (
          <Checkbox
            checked={customFieldValue}
            disabled
          />
        );
      }

      if (type === SELECT || type === RADIO_BUTTON_GROUP) {
        return getSelectedOptionLabel(customField);
      }
      if (type === DATE_PICKER) {
        return formatDate(new Date(customFieldValue));
      }
      if (type === TEXTAREA || type === TEXTFIELD) {
        return customFieldValue;
      }
    }

    return <NoValue />;
  };

  return (
    <>
      <Accordion
        open={expanded}
        id={accordionId}
        onToggle={onToggle}
        label={sectionTitleLoaded
          ? customFieldsAccordionTitle
          : <Icon data-test-custom-fields-loading-icon icon="spinner-ellipsis" />
        }
        displayWhenClosed={displayWhenClosed}
        data-test-custom-fields-view-accordion
      >
        {customFieldsLoaded && formattedCustomFields.length
          ? formattedCustomFields.map((row, i) => (
            <Row key={i}>
              {
                row.map(customField => (
                  <Col
                    key={customField.refId}
                    md={columnWidth}
                    xs={rowShapes}
                    data-test-col-custom-field
                  >
                    <KeyValue
                      label={customField.name}
                      value={formatValue(customField)}
                    />
                  </Col>
                ))
              }
            </Row>
          ))
          : noCustomFieldsFoundLabel
        }
      </Accordion>
      <Callout ref={calloutRef} />
    </>
  );
};

ViewCustomFieldsRecord.propTypes = propTypes;
ViewCustomFieldsRecord.defaultProps = defaultProps;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(ViewCustomFieldsRecord);
