import React from 'react';
import PropTypes from 'prop-types';


import {
  Row,
  Col,
  MetaSection,
} from '@folio/stripes-components';

const propTypes = {
  noteMetadata: PropTypes.shape({
    createdBy: PropTypes.string,
    createdDate: PropTypes.string,
    lastUpdatedBy: PropTypes.string,
    lastUpdatedDate: PropTypes.string,
  }),
};

const NoteMetadata = ({ noteMetadata }) => (
  <Row>
    <Col xs={12}>
      <MetaSection
        headingLevel={3}
        {...noteMetadata}
      />
    </Col>
  </Row>
);

NoteMetadata.propTypes = propTypes;

export default NoteMetadata;
