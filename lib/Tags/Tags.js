import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';

class Tags extends React.Component {
  static manifest = Object.freeze({
    tags: {
      type: 'okapi',
      path: 'tags',
      records: 'tags',
      clear: false,
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    onToggle: PropTypes.func,
    resources: PropTypes.shape({
      tags: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  }

  render() {
    const { stripes, resources } = this.props;
    const formatMsg = stripes.intl.formatMessage;
    const tags = (resources.tags || {}).records || [];

    return (
      <Pane
        defaultWidth="20%"
        paneTitle={formatMsg({ id: 'stripes-smart-components.tags' })}
        paneSub={formatMsg({ id: 'stripes-smart-components.numberOfTags' }, { count: tags.length })}
        dismissible
        onClose={this.props.onToggle}
      >
        <div />
      </Pane>
    );
  }
}

export default Tags;
