import React from 'react';
import PropTypes from 'prop-types';
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
  CUSTOM_FIELDS_SECTION_ID,
} from '../../constants';

import {
  useCustomFieldsQuery,
  useSectionTitleQuery,
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
  backendModuleName: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  configNamePrefix: PropTypes.string,
  customFieldsLabel: PropTypes.node,
  customFieldsValues: PropTypes.object.isRequired,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool,
  noCustomFieldsFoundLabel: PropTypes.node,
  onToggle: PropTypes.func,
  scope: PropTypes.string,
  sectionId: PropTypes.string,
};

const ViewCustomFieldsRecord = ({
  accordionId,
  onToggle,
  expanded,
  backendModuleName,
  entityType,
  customFieldsValues,
  columnCount = 4,
  customFieldsLabel = <FormattedMessage id="stripes-smart-components.customFields" />,
  noCustomFieldsFoundLabel = <FormattedMessage id="stripes-smart-components.customFields.noCustomFieldsFound" />,
  configNamePrefix,
  scope,
  sectionId,
}) => {
  const {
    customFields,
    isLoadingCustomFields,
    isCustomFieldsError: customFieldsFetchFailed,
  } = useCustomFieldsQuery({
    moduleName: backendModuleName,
    entityType,
    sectionId,
  });

  const {
    sectionTitle,
    isLoadingSectionTitle,
    isSectionTitleError: sectionTitleFetchFailed,
  } = useSectionTitleQuery({
    moduleName: backendModuleName.toUpperCase(),
    configNamePrefix,
    scope,
  });

  const { formatDate } = useIntl();

  const { calloutRef } = useLoadingErrorCallout({
    customFieldsFetchFailed,
    sectionTitleFetchFailed,
  });
  const columnWidth = rowShapes / columnCount;

  const visibleCustomFields = customFields?.filter(customField => customField.visible);
  const formattedCustomFields = chunk(visibleCustomFields, columnCount);
  const customFieldsLoaded = !isLoadingCustomFields && !customFieldsFetchFailed;
  const sectionTitleLoaded = !isLoadingSectionTitle;

  const displayWhenClosed = (sectionTitleLoaded && customFieldsLoaded)
    ? (<Badge>{visibleCustomFields.length}</Badge>)
    : (<Icon icon="spinner-ellipsis" width="10px" />);

  const customFieldsAccordionTitle = sectionTitle.value || customFieldsLabel;

  const accordionLabel = sectionTitleLoaded
    ? customFieldsAccordionTitle
    : <Icon data-test-custom-fields-loading-icon icon="spinner-ellipsis" />;

  const accordionProps = {
    open: expanded,
    id: accordionId,
    onToggle,
    label: accordionLabel,
    displayWhenClosed,
    'data-test-custom-fields-view-accordion': true,
  };

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

  const renderCustomField = (customField) => {
    return (
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
    );
  };

  const renderChunkedCustomFields = () => {
    return formattedCustomFields.map((row, i) => (
      <Row key={i}>
        {row.map(renderCustomField)}
      </Row>
    ));
  };

  const renderContent = () => {
    if (sectionId) {
      if (isLoadingCustomFields) {
        return <Icon icon="spinner-ellipsis" />;
      }

      if (customFieldsFetchFailed || !visibleCustomFields?.length) {
        return null;
      }

      if (sectionId === CUSTOM_FIELDS_SECTION_ID) {
        return (
          <Accordion
            {...accordionProps}
          >
            {renderChunkedCustomFields()}
          </Accordion>
        );
      }

      return visibleCustomFields.map(renderCustomField);
    }

    return (
      <Accordion
        {...accordionProps}
      >
        {customFieldsLoaded && formattedCustomFields.length
          ? renderChunkedCustomFields()
          : noCustomFieldsFoundLabel
        }
      </Accordion>
    );
  };

  return (
    <>
      {renderContent()}
      <Callout ref={calloutRef} />
    </>
  );
};

ViewCustomFieldsRecord.propTypes = propTypes;

export default ViewCustomFieldsRecord;
