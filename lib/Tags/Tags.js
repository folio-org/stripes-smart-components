import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';

import TagsForm from './TagsForm';

class Tags extends React.Component {
  static manifest = Object.freeze({
    tags: {
      type: 'okapi',
      path: 'tags',
      records: 'tags',
      clear: false,
    },
    tagsEntity: {
      type: 'okapi',
      path: ':{link}',
      fetch: false,
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    onToggle: PropTypes.func,
    resources: PropTypes.shape({
      tagsEntity: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      tags: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,

    mutator: PropTypes.shape({
      tagsEntity: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }),
    entity: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(data) {
    const { entity } = this.props;

    entity.tags = {
      tagList: data.tags.split(' '),
    };

    this.props.mutator.tagsEntity.PUT(entity);
  }

  render() {
    const { stripes } = this.props;
    const formatMsg = stripes.intl.formatMessage;

    return (
      <Pane
        defaultWidth="20%"
        paneTitle={formatMsg({ id: 'stripes-smart-components.tags' })}
        paneSub={formatMsg({ id: 'stripes-smart-components.numberOfTags' }, { count: 0 })}
        dismissible
        onClose={this.props.onToggle}
      >
        <TagsForm
          id="userform-addnote"
          initialValues={{ tags: '' }}
          form="newTag"
          onSubmit={this.handleSubmit}
          stripes={stripes}
        />
      </Pane>
    );
  }
}

export default Tags;
