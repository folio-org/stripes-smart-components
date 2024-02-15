import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import EditableListFinalForm from './EditableListFinalForm';
import EditableListReduxForm from './EditableListReduxForm';


const propTypes = {
  /**
   * maps column fields to strings that should be rendered in the list headers.
   */
  columnMapping: PropTypes.object,
  /**
   * set custom column widths.
   */
  columnWidths: PropTypes.object,
  /**
   * Array of objects to be rendered as list items.
   */
  contentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  /**
   *  set custom component for editing
   */
  fieldComponents: PropTypes.object,
  /**
   * Used to render custom components within the cells of the list.
   */
  formatter: PropTypes.object,
  /**
   * Form type implementation
   */
  formType: PropTypes.oneOf(['redux-form', 'final-form']),
  /**
   * Function that returns a list of read-only fields for a specific item
   */
  getReadOnlyFieldsForItem: PropTypes.func,
  /**
   * id for add button
   */
  id: PropTypes.string,
  /**
   * The key that uniquely names listed objects: defaults to 'name'.
   */
  nameKey: PropTypes.string,
  /**
   * Readonly fields that will not be editable.
   */
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  nameKey: 'name',
  formType: 'redux-form',
};

const EditableList = (props) => {
  const { contentData, nameKey, formType } = props;
  const EditableListForm = (formType === 'redux-form')
    ? EditableListReduxForm
    : EditableListFinalForm;

  const initialValues = useMemo(() => {
    const items = sortBy(contentData, [t => t[nameKey] && t[nameKey].toLowerCase()]);

    return { items };
  }, [contentData, nameKey]);
  return (<EditableListForm initialValues={initialValues} {...props} />);
};

EditableList.propTypes = propTypes;
EditableList.defaultProps = defaultProps;

export default EditableList;
