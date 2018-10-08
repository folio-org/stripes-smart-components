import { get, uniq, sortBy, difference } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Callout, Pane } from '@folio/stripes-components';

import TagsForm from './TagsForm';

class Tags extends React.Component {
  static manifest = Object.freeze({
    tags: {
      type: 'okapi',
      path: 'tags?limit=100',
      records: 'tags',
      clear: false,
      throwErrors: false,
      POST: {
        path: 'tags',
      },
    },
    entities: {
      type: 'okapi',
      path: '!{link}',
    },
  });

  static propTypes = {
    intl: intlShape,
    mutator: PropTypes.shape({
      entities: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      tags: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
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
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
  };

  constructor(props) {
    super(props);
    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.calloutRef = React.createRef();
  }

  onAdd(tags) {
    this.saveEntityTags(tags);
    this.saveTags(tags);
  }

  onRemove(tag) {
    const entity = this.getEntity();
    const tags = (entity.tags || {}).tagList || [];
    const tagList = tags.filter(t => t !== tag);
    entity.tags = { tagList };
    this.props.mutator.entities.PUT(entity);
  }

  // add tag to the list of entity tags
  saveEntityTags(tags) {
    const entity = this.getEntity();
    const tagList = (entity.tags || {}).tagList || [];
    entity.tags = { tagList: sortBy(uniq([...tags, ...tagList])) };
    this.props.mutator.entities.PUT(entity);
  }

  // add tags to global list of tags
  saveTags(tags) {
    const { intl: { formatMessage }, mutator, resources } = this.props;
    const records = (resources.tags || {}).records || [];
    const newTag = difference(tags, records.map(t => t.label.toLowerCase()));

    if (!newTag || !newTag.length) return;

    mutator.tags.POST({
      label: newTag[0],
      description: newTag[0],
    });

    const message = formatMessage({ id: 'stripes-smart-components.newTagCreated' });
    this.calloutRef.current.sendCallout({ message });
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
    const { intl: { formatMessage }, resources, stripes } = this.props;
    const entityTags = this.getEntityTags();
    const tags = (resources.tags || {}).records || [];

    return (
      <Pane
        defaultWidth="20%"
        paneTitle={formatMessage({ id: 'stripes-smart-components.tags' })}
        paneSub={formatMessage({ id: 'stripes-smart-components.numberOfTags' }, { count: entityTags.length })}
        dismissible
        onClose={this.props.onToggle}
      >
        <TagsForm
          onRemove={this.onRemove}
          onAdd={this.onAdd}
          tags={tags}
          entityTags={entityTags}
          stripes={stripes}
        />

        <Callout ref={this.calloutRef} />
      </Pane>
    );
  }
}

export default injectIntl(Tags);
