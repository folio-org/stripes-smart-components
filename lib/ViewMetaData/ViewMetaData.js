import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import MetaSection from '@folio/stripes-components/lib/MetaSection';

class ViewMetaData extends React.Component {
  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.createdByUserId})',
    },
    updatedBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.updatedByUserId})',
    },
  });

  static propTypes = {
    metadata: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      createdBy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      updatedBy: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  };

  getFullName = (user) => {
    const lastName = get(user, ['personal', 'lastName'], '');
    const firstName = get(user, ['personal', 'firstName'], '');
    const middleName = get(user, ['personal', 'middleName'], '');

    return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
  }

  render() {
    const { metadata, resources: { createdBy, updatedBy } } = this.props;

    return (createdBy && createdBy.hasLoaded && updatedBy && updatedBy.hasLoaded) ?
      <MetaSection
        id="instanceRecordMeta"
        contentId="instanceRecordMetaContent"
        lastUpdatedDate={metadata.updatedDate}
        createdDate={metadata.createdDate}
        lastUpdatedBy={this.getFullName(updatedBy.records[0])}
        createdBy={this.getFullName(createdBy.records[0])}
      />
      :
      <div />;
  }
}

export default ViewMetaData;
