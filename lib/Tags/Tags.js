import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get, set, uniq, sortBy, difference, noop, isFunction } from 'lodash';

import {
  Callout,
  Pane,
  Loading,
} from '@folio/stripes-components';
import { stripesConnect } from '@folio/stripes-core';

import TagsForm from './TagsForm';

class Tags extends React.Component {
  static manifest = Object.freeze({
    tags: {
      type: 'okapi',
      path: 'tags?limit=10000',
      records: 'tags',
      clear: false,
      throwErrors: false,
      POST: {
        path: 'tags',
      },
    },
    entities: {
      throwErrors: false,
      type: 'okapi',
      path: '!{link}',
      // make sure previously loaded entity is cleaned up
      resourceShouldRefresh: true,
    },
  });

  static propTypes = {
    children: PropTypes.func,
    entityTagsPath: PropTypes.string,
    getEntity: PropTypes.func,
    getEntityTags: PropTypes.func,
    link: PropTypes.string.isRequired,
    mutator: PropTypes.shape({
      entities: PropTypes.shape({ PUT: PropTypes.func.isRequired }),
      tags: PropTypes.shape({ POST: PropTypes.func.isRequired }),
    }),
    onToggle: PropTypes.func,
    refreshRemote: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      entities: PropTypes.shape({ records: PropTypes.arrayOf(PropTypes.object) }),
      tags: PropTypes.shape({ records: PropTypes.arrayOf(PropTypes.object) }),
    }).isRequired,
  };

  static defaultProps = {
    entityTagsPath: 'tags',
    onToggle: noop,
    getEntity: props => get(props, ['resources', 'entities', 'records', 0], {}),
    getEntityTags: props => {
      const entity = props.getEntity(props);

      return get(entity, ['tags', 'tagList'], []);
    },
  };

  componentDidUpdate(prevProps) {
    // TODO: remove the explicit `refreshRemote` call when https://issues.folio.org/browse/STCON-81 is done.
    // Calling `refreshRemote` is needed to update entities resource when link prop is changed.
    // `stripes-connect` is supposed to do it under the hood but there is a bug,
    // and therefore it is needed to do it manually.
    if (prevProps.link !== this.props.link) {
      this.props.refreshRemote(this.props);
    }
  }

  calloutRef = React.createRef();

  onAdd = tags => {
    this.saveEntityTags(tags);
    this.saveTags(tags);
  };

  onRemove = tag => {
    const {
      getEntity,
      getEntityTags,
      entityTagsPath,
    } = this.props;
    const entity = getEntity(this.props);
    const tags = getEntityTags(this.props);
    const tagList = tags.filter(t => t !== tag);

    set(entity, entityTagsPath, { tagList });
    this.props.mutator.entities.PUT(entity);
  };

  // add tag to the list of entity tags
  saveEntityTags(tags) {
    const {
      getEntity,
      getEntityTags,
      entityTagsPath,
    } = this.props;
    const entity = getEntity(this.props);
    const tagList = getEntityTags(this.props);
    const tagsToSave = { tagList: sortBy(uniq([...tags, ...tagList])) };
    set(entity, entityTagsPath, tagsToSave);
    this.props.mutator.entities.PUT(entity)
    // eslint-disable-next-line no-unused-vars
      .catch(err => this.showCallout('error', 'stripes-smart-components.cannotSaveTagToRecord'));
  }

  // add tags to global list of tags
  saveTags(tags) {
    let saveError = false;
    const records = this.getTags();
    const newTag = difference(tags, records.map(t => t.label.toLowerCase()));

    if (!newTag || !newTag.length) return;

    this.props.mutator.tags.POST({
      label: newTag[0],
      description: newTag[0],
    }).catch(
      // eslint-disable-next-line no-unused-vars
      err => { saveError = true; this.showCallout('error', 'stripes-smart-components.cannotSaveNewTag'); }
    ).finally(() => {
      if (!saveError) {
        this.showCallout('success', 'stripes-smart-components.newTagCreated');
      }
    });
  }

  getTags() {
    return get(this.props, ['resources', 'tags', 'records'], []);
  }

  showCallout(typeOf, messageID) {
    if (this.calloutRef.current) {
      const message = <FormattedMessage id={messageID} />;

      this.calloutRef.current.sendCallout({ type: typeOf, message });
    }
  }

  isLoading() {
    return this.props.resources?.entities?.isPending;
  }

  render() {
    const {
      children,
      onToggle,
      getEntityTags,
    } = this.props;
    const entityTags = getEntityTags(this.props);
    const tags = this.getTags();
    const isLoading = this.isLoading();

    const tagsForm = (
      <>
        <TagsForm
          onRemove={this.onRemove}
          onAdd={this.onAdd}
          tags={tags}
          entityTags={entityTags}
        />
        <Callout ref={this.calloutRef} />
      </>
    );

    if (isFunction(children)) {
      return children({
        entityTags,
        tags,
        tagsForm,
        tagsProps: this.props,
      });
    }

    return (
      <Pane
        defaultWidth="20%"
        paneTitle={<FormattedMessage id="stripes-smart-components.tags" />}
        paneSub={(
          <FormattedMessage
            id="stripes-smart-components.numberOfTags"
            values={{ count: entityTags.length }}
          />
        )}
        dismissible
        onClose={onToggle}
      >
        {tagsForm}
        {isLoading && <Loading />}
      </Pane>
    );
  }
}

export default stripesConnect(Tags);
