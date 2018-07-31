import { get, uniq, sortBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';

import TagsForm from './TagsForm';
import TagsList from './TagsList';

class Tags extends React.Component {
  static manifest = Object.freeze({
    tags: {
      type: 'okapi',
      path: 'tags',
      records: 'tags',
      clear: false,
    },
    entities: {
      type: 'okapi',
      path: '!{link}',
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    onToggle: PropTypes.func,
    resources: PropTypes.shape({
      entities: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      tags: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,

    mutator: PropTypes.shape({
      entities: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      tags: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleSubmit(data) {
    const tag = data.tags.replace(/\s|\|/g, '');
    this.saveEntityTag(tag);
    this.saveTags(tag);
  }

  // add tag to the list of entity tags
  saveEntityTag(tag) {
    const entity = this.getEntity();
    const entityTags = this.getEntityTags();
    const tagList = sortBy(uniq(entityTags.concat([tag])));
    entity.tags = { tagList };
    this.props.mutator.entities.PUT(entity);
  }

  // add tag to global list of tags
  saveTags(tag) {
    const tags = (this.props.resources.tags || {}).records || [];
    const tagExists = tags.find(t => t.label === tag);

    if (tagExists) return;

    this.props.mutator.tags.POST({
      label: tag,
      description: tag,
    });
  }

  handleRemove(tag) {
    const entity = this.getEntity();
    const tags = this.getEntityTags();
    const tagList = tags.filter(t => (t !== tag));
    entity.tags = { tagList };
    this.props.mutator.entities.PUT(entity);
  }

  getEntity() {
    const entities = (this.props.resources.entities || {}).records || [];
    return entities[0] || {};
  }

  getEntityTags() {
    const entity = this.getEntity();
    return get(entity, ['tags', 'tagList'], []);
  }

  render() {
    const { stripes } = this.props;
    const formatMsg = stripes.intl.formatMessage;
    const tags = this.getEntityTags();

    return (
      <Pane
        defaultWidth="20%"
        paneTitle={formatMsg({ id: 'stripes-smart-components.tags' })}
        paneSub={formatMsg({ id: 'stripes-smart-components.numberOfTags' }, { count: tags.length })}
        dismissible
        onClose={this.props.onToggle}
      >
        <TagsList tags={tags} onRemove={this.handleRemove} />
        <br />
        <TagsForm
          id="addtag-form"
          form="addtag-form"
          onSubmit={this.handleSubmit}
          stripes={stripes}
        />
      </Pane>
    );
  }
}

export default Tags;
