import { isEqual, difference } from 'lodash';
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
      const tag = difference(this.state.entityTags, tags);
      this.props.onRemove(tag[0]);
    } else {
      this.props.onAdd(entityTags);
    }

    this.setState({ entityTags });
  }

  addTag = ({ inputValue }) => {
    const tag = inputValue.replace(/\s|\|/g, '');
    const entityTags = this.state.entityTags.concat(tag);
    this.setState({ entityTags });
    this.props.onAdd(entityTags);
  }

  renderTag = ({ filterValue, exactMatch }) => {
    if (exactMatch || !filterValue) {
      return null;
    } else {
      return (<div>Add tag for &quot;{`${filterValue}`}&quot;</div>);
    }
  }

  render() {
    const { tags } = this.props;
    const { entityTags } = this.state;
    const formatMsg = this.props.stripes.intl.formatMessage;
    const dataOptions = tags.map(t => ({ value: t.label, label: t.label }));
    const value = entityTags.map(tag => ({ value: tag, label: tag }));
    const addAction = { onSelect: this.addTag, render: this.renderTag };
    const actions = [addAction];

    return (
      <MultiSelection
        // TODO: remove key prop after MultiSelection is fixed
        key={`multi-select-${Date.now()}`}
        placeholder={formatMsg({ id: 'stripes-smart-components.enterATag' })}
        aria-label={formatMsg({ id: 'stripes-smart-components.tagsTextArea' })}
        actions={actions}
        emptyMessage=" "
        onChange={this.onChange}
        dataOptions={dataOptions}
        value={value}
      />
    );
  }
}

export default TagsForm;
