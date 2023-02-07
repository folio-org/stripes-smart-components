import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEqual, difference, sortBy, noop } from 'lodash';

import { MultiSelection } from '@folio/stripes-components';

const localeCompareCB = (a, b) => a.value.localeCompare(b.value);

class TagsForm extends React.Component {
  static propTypes = {
    entityTags: PropTypes.arrayOf(PropTypes.string),
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    entityTags: [],
    onAdd: noop,
    onRemove: noop,
    tags: [],
  };

  constructor() {
    super();

    const addAction = { onSelect: this.addTag, render: this.renderTag };

    this.actions = [addAction];
  }

  state = { entityTags: [] };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.entityTags, prevState.entityTags)) {
      return { entityTags: nextProps.entityTags };
    }

    return null;
  }

  onChange = tags => {
    const entityTags = tags.map(t => t.value);
    if (tags.length < this.state.entityTags.length) {
      const tag = difference(this.state.entityTags, tags.map(t => t.value));
      this.props.onRemove(tag[0]);
    } else {
      this.props.onAdd(entityTags);
    }

    this.setState({ entityTags });
  };

  filterItems = (filter, list) => {
    if (!filter) {
      return { renderedItems: list };
    }
    const filterLowercased = filter.toLowerCase();

    const renderedItems = [
      ...list
        .filter(({ value }) => value.toLowerCase().startsWith(filterLowercased))
        .sort(localeCompareCB),
      ...list
        .filter(({ value }) => (
          !value.toLowerCase().startsWith(filterLowercased)
          && value.toLowerCase().includes(filterLowercased)
        ))
        .sort(localeCompareCB),
    ];

    return { renderedItems };
  };

  addTag = ({ inputValue }) => {
    const tag = inputValue.replace(/\s|\|/g, '').trim().toLowerCase();

    if (tag) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      const entityTags = this.state.entityTags.concat(tag);
      this.setState({ entityTags });
      this.props.onAdd(entityTags);
    }
  }

  renderTag = ({ filterValue, exactMatch }) => {
    if (exactMatch || !filterValue) {
      return null;
    } else {
      return (
        <div>
          Add tag for:&nbsp;
          <strong>
            {filterValue}
          </strong>
        </div>
      );
    }
  }

  render() {
    const { tags } = this.props;
    const { entityTags } = this.state;
    const dataOptions = tags.map(t => ({ value: t.label.toLowerCase(), label: t.label.toLowerCase() }));
    const tagsList = entityTags.map(tag => ({ value: tag.toLowerCase(), label: tag.toLowerCase() }));

    return (
      <FormattedMessage id="stripes-smart-components.enterATag">
        {([placeholder]) => (
          <FormattedMessage id="stripes-smart-components.tagsTextArea">
            {([ariaLabel]) => (
              <MultiSelection
                id="input-tag"
                placeholder={placeholder}
                aria-label={ariaLabel}
                actions={this.actions}
                filter={this.filterItems}
                emptyMessage=" "
                onChange={this.onChange}
                dataOptions={sortBy(dataOptions, ['value'])}
                value={sortBy(tagsList, ['value'])}
              />
            )}
          </FormattedMessage>
        )}
      </FormattedMessage>
    );
  }
}

export default memo(TagsForm, (prevProps, nextProps) => {
  return isEqual(prevProps.entityTags, nextProps.entityTags) &&
    isEqual(prevProps.tags, nextProps.tags);
});
