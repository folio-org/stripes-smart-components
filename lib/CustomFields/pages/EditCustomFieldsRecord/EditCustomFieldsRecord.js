import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { chunk } from 'lodash';
import {
  Accordion,
  Callout,
  Col,
  Row,
  InfoPopover,
} from '@folio/stripes-components';

import { fieldComponents } from '../../constants';
import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';
import {
  useCustomFieldsFetch,
  useSectionTitleFetch,
  useLoadingErrorCallout,
  valuesValidation,
} from '../../utils';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  fieldComponent: PropTypes.node.isRequired,
  okapi: PropTypes.shape({
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

const defaultProps = {
  columnCount: 4,
};

const EditCustomFieldsRecord = ({
  accordionId,
  onToggle,
  expanded,
  okapi,
  backendModuleId,
  backendModuleName,
  entityType,
  fieldComponent,
  columnCount,
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
  const { calloutRef } = useLoadingErrorCallout(customFieldsFetchFailed || sectionTitleFetchFailed);
  const dataIsLoaded = sectionTitleLoaded && customFieldsLoaded;
  const customFieldsIsVisible = customFields?.length > 0 && customFields?.some(customField => customField.visible);
  const accordionIsVisible = dataIsLoaded && customFieldsIsVisible;

  const Field = fieldComponent;
  const formatedCustomFields = chunk(customFields, columnCount);
  const columnWidth = 12 / columnCount;
  const defaultLabel = <FormattedMessage id="stripes-smart-components.customFields.recordAccordion.defaultName" />;

  return (
    <>
      {accordionIsVisible
        ? (
          <Accordion
            open={expanded}
            id={accordionId}
            onToggle={onToggle}
            label={sectionTitle.value || defaultLabel}
          >
            {
              formatedCustomFields.map((row, i) => (
                <Row key={i}>
                  {
                    row.map(customField => (
                      customField.visible ? (
                        <Col
                          data-test-record-edit-custom-field
                          key={customField.refId}
                          xs={columnWidth}
                        >
                          <Field
                            component={fieldComponents[customField.type]}
                            name={`customFields.${customField.refId}`}
                            required={customField.required}
                            label={
                              <>
                                {customField.name}
                                {customField.helpText && (
                                  <InfoPopover
                                    content={customField.helpText}
                                    iconSize="small"
                                  />
                                )}
                              </>
                            }
                            validate={value => {
                              if (valuesValidation[customField.type]) {
                                return valuesValidation[customField.type](value, customField);
                              }

                              return null;
                            }
                          }
                          />
                        </Col>
                      ) : null
                    ))
                  }
                </Row>
              ))
            }
          </Accordion>
        ) : null
      }
      <Callout ref={calloutRef} />
    </>
  );
};

EditCustomFieldsRecord.propTypes = propTypes;
EditCustomFieldsRecord.defaultProps = defaultProps;

export default connect(
  (state, ownProps) => ({
    backendModuleId: selectModuleId(state, ownProps.backendModuleName),
    okapi: selectOkapiData(state),
  })
)(EditCustomFieldsRecord);
