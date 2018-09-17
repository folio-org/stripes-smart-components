import { isEqual, difference, sortBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { MultiSelection } from '@folio/stripes-components';

class TagsForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.object),
    entityTags: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.state = { entityTags: [] };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.entityTags, prevState.entityTags)) {
      return { entityTags: nextProps.entityTags };
    }

    return null;
  }

  onChange(tags) {
    const entityTags = tags.map(t => t.value);
    if (tags.length < this.state.entityTags.length) {
      const tag = difference(this.state.entityTags, tags.map(t => t.value));
      this.props.onRemove(tag[0]);
    } else {
      this.props.onAdd(entityTags);
    }

    this.setState({ entityTags });
  }

  filterItems(filter, list) {
    if (!filter) {
      return { renderedItems: list };
    }

    const filtered = list.filter(item => item.value.match(new RegExp(filter, 'i')));
    const renderedItems = filtered.sort((tag1, tag2) => {
      const regex = new RegExp(`^${filter}`, 'i');
      const match1 = tag1.value.match(regex);
      const match2 = tag2.value.match(regex);
      if (match1) return -1;
      if (match2) return 1;
      return (tag1.value < tag2.value) ? -1 : 1;
    });

    return { renderedItems };
  }

  addTag = ({ inputValue }) => {
    const tag = inputValue.replace(/\s|\|/g, '').toLowerCase();
    // eslint-disable-next-line react/no-access-state-in-setstate
    const entityTags = this.state.entityTags.concat(tag);
    this.setState({ entityTags });
    this.props.onAdd(entityTags);
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
    const formatMsg = this.props.stripes.intl.formatMessage;
    const dataOptions = tags.map(t => ({ value: t.label.toLowerCase(), label: t.label.toLowerCase() }));
    const tagsList = entityTags.map(tag => ({ value: tag.toLowerCase(), label: tag.toLowerCase() }));
    const addAction = { onSelect: this.addTag, render: this.renderTag };
    const actions = [addAction];

    return (
      <MultiSelection
        placeholder={formatMsg({ id: 'stripes-smart-components.enterATag' })}
        aria-label={formatMsg({ id: 'stripes-smart-components.tagsTextArea' })}
        actions={actions}
        filter={this.filterItems}
        emptyMessage=" "
        onChange={this.onChange}
        dataOptions={sortBy(dataOptions, ['value'])}
        value={sortBy(tagsList, ['value'])}
      />
    );
  }
}

export default TagsForm;
