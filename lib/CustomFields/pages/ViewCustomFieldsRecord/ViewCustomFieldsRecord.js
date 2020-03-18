import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { chunk } from 'lodash';

import {
  Accordion,
  Callout,
  KeyValue,
  NoValue,
  Row,
  Col,
} from '@folio/stripes-components';

import { rowShapes } from '../../constants';
import {
  selectModuleId,
  selectOkapiData,
} from '../../selectors';

import {
  useCustomFieldsFetch,
  useSectionTitleFetch,
  useLoadingErrorCallout,
} from '../../utils';

const propTypes = {
  accordionId: PropTypes.string.isRequired,
  backendModuleId: PropTypes.string,
  backendModuleName: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  customFieldsValues: PropTypes.object.isRequired,
  entityType: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
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
  const customFieldsIsVisible = customFields?.length && customFields?.some(customField => customField.visible);
  const accordionIsVisible = dataIsLoaded && customFieldsIsVisible;
  const columnWidth = rowShapes / columnCount;
  const formatedCustomFields = chunk(customFields, columnCount);

  return (
    <>
      {accordionIsVisible && (
        <Accordion
          open={expanded}
          id={accordionId}
          onToggle={onToggle}
          label={sectionTitle.value}
        >
          {
            formatedCustomFields.map((row, i) => (
              <Row key={i}>
                {
                  row.map(customField => customField.visible && (
                    <Col
                      key={customField.refId}
                      xs={columnWidth}
                    >
                      <KeyValue
                        label={customField.name}
                        value={customFieldsValues[customField.refId] || <NoValue />}
                      />
                    </Col>
                  ))
                }
              </Row>
            ))
          }
        </Accordion>
      )}
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
