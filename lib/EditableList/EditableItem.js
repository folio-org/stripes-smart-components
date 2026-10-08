import React from 'react';
import PropTypes from 'prop-types';
import ItemView from './ItemView';
import ItemEdit from './ItemEdit';

// eslint-disable-next-line jsx-a11y/no-autofocus -- focus the first field when a row enters edit mode
const EditableItem = props => (props.editing ? <ItemEdit {...props} autoFocus /> : <ItemView {...props} />);

EditableItem.propTypes = {
  editing: PropTypes.bool,
};

export default EditableItem;
