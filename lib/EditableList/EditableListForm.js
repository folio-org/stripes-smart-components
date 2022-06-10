import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

import {
  Button,
  Col,
  checkScope,
  HasCommand,
  Headline,
  IconButton,
  MultiColumnList,
  Row,
  Layout,
} from '@folio/stripes-components';
import EditableItem from './EditableItem';
import processBadResponse from './processBadResponse';
import { errorCodes } from './constants';
import css from './EditableList.css';

const propTypes = {
  /**
   * Object containing properties of list action names: 'delete', 'edit' and
   * values of sentinel functions that return objects to destructure onto the
   * action button props:
   * { delete: (item) => {return { disabled: item.item.inUse } } }
   */
  actionProps: PropTypes.object,
  /**
   * Object containing properties of list action names: 'delete', 'edit' and
   * values of sentinel functions that return booleans based on object
   * properties" { delete: (item) => {return (!item.item.inUse)} }
   */
  actionSuppression: PropTypes.object,
  /**
   * Additional fields that require building.
   */
  additionalFields: PropTypes.object,
  /**
   * boolean that indicates if form can create a new item
   */
  canCreate: PropTypes.bool,
  /**
   *  set custom rendered column names
   */
  columnMapping: PropTypes.object,
  /**
   * manually set column widths, if necessary.
   */
  columnWidths: PropTypes.object,
  /**
   * Collection of items to render.
   */
  contentData: PropTypes.arrayOf(PropTypes.object),
  /**
   * Label for the 'Add' button
   */
  createButtonLabel: PropTypes.node,
  /**
   *  boolean that indicates if the component is editable (has 'New' button and column 'actions').
   */
  editable: PropTypes.bool,
  /**
   * FieldArray implementation coming from final-form or redux-form
   */
  FieldArray: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * FieldComponent implementation coming from final-form or redux-form
   */
  FieldComponent: PropTypes.object,
  /**
   *  set custom component for editing
   */
  fieldComponents: PropTypes.object,
  /**
   * form object provided by final-form and redux-form
   */
  form: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  /**
   * passed to MultiColumnList, formatter allows control over how the data is rendered in the cells of the grid.
   */
  formatter: PropTypes.object,

  handleSubmit: PropTypes.func.isRequired,
  /**
   * id for Add action.
   */
  id: PropTypes.string,
  /**
   * Callback provided by redux-form to set the initialValues to something else.
   */
  initialize: PropTypes.func,
  /**
  * Initial form values
  */
  initialValues: PropTypes.object,
  /**
   * boolean that indicates if there are validation errors.
   */
  invalid: PropTypes.bool,
  /**
   * Message to display for an empty list.
   */
  isEmptyMessage: PropTypes.node,
  /**
   * Object where each key's value is the default value for that field.
   * { resourceType: 'book' }
   */
  itemTemplate: PropTypes.object,
  /**
   * The text for the H3 tag in the header of the component
   */
  label: PropTypes.node,
  /**
   * Callback for creating new list items.
   */
  onCreate: PropTypes.func,
  /**
   * Callback for list item deletion.
   */
  onDelete: PropTypes.func,
  /**
   * Callback for saving editted list items.
   */
  onUpdate: PropTypes.func,
  /**
   * boolean that shows if the form has been modified.
   */
  pristine: PropTypes.bool,
  /**
   * List of read-only fields
   */
  readOnlyFields: PropTypes.arrayOf(PropTypes.string),
  /**
   * Callback provided by redux-form to set the field values to their initialValues
   */
  reset: PropTypes.func,
  /**
   * boolean that indicates that the form is being submitted.
   */
  submitting: PropTypes.bool,

  /**
   * Fieldname that includes the unique identifier for the list.
   */
  uniqueField: PropTypes.string,
  /**
   * Callback for validating editable form
   */
  validate: PropTypes.func,
  /**
   * Array of fields to render. These will also be editable.
   */
  visibleFields: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  actionProps: {},
  actionSuppression: { delete: () => false, edit: () => false },
  canCreate: true,
  createButtonLabel: '+ Add new',
  editable: true,
  fieldComponents: {},
  itemTemplate: {},
  uniqueField: 'id',
  validate: noop,
};

const buildStatusArray = (items = []) => items.map(() => ({ editing: false, error: false }));

class EditableListForm extends React.Component {
  constructor(props) {
    super(props);

    let status = [];
    if (props.initialValues) {
      status = buildStatusArray(props.initialValues.items);
    }

    this.state = {
      status,
      creating: false,
      lastAction: {},
    };

    this.RenderItems = this.RenderItems.bind(this);
    this.setError = this.setError.bind(this);
    this.getColumnWidths = this.getColumnWidths.bind(this);
    this.getVisibleColumns = this.getVisibleColumns.bind(this);
    this.getReadOnlyColumns = this.getReadOnlyColumns.bind(this);
    this.getColumnMapping = this.getColumnMapping.bind(this);

    if (this.props.id) {
      this.testingId = this.props.id;
    } else if (this.props.label) {
      this.testingId = this.props.label.replace(/\s/, '').toLowerCase();
    } else {
      this.testingId = uniqueId();
    }
  }

  // needed for instances where initialValues arrive AFTER initialization.
  static getDerivedStateFromProps(props, state) {
    if (!state.status) {
      return {
        status: buildStatusArray(props.initialValues.items)
      };
    }

    return null;
  }

  onAdd(fields) {
    const { itemTemplate } = this.props;
    const item = { ...itemTemplate };
    fields.unshift(item);
    // add field to edit-tracking in edit mode.
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      if (newState.status.length === 0 && fields.length > 0) {
        newState.status = buildStatusArray();
        newState.creating = true;
      }
      newState.status.unshift({ editing: true, error: false });
      newState.lastAction = new Date().getTime();
      return newState;
    });
  }

  onCancel(fields, index) {
    const { uniqueField } = this.props;
    const item = this.getValue(fields, index);

    // if the item has a unique identifier, toggle its edit mode... if not, remove it.
    if (item[uniqueField]) {
      this.toggleEdit(index);
    } else {
      fields.remove(index);
      this.setState((curState) => {
        const newState = cloneDeep(curState);
        newState.status.splice(index, 1);
        newState.creating = false;
        return newState;
      });
    }

    // Reset the field values.
    this.reset();
  }

  getValues(fields = {}) {
    const { getAll, value } = fields;
    return getAll ? getAll() : value;
  }

  getValue(fields = {}, index) {
    const { get, value } = fields;
    return get ? get(index) : value[index];
  }

  reset = () => {
    const { reset, form } = this.props;
    (reset || form.reset)();
  }

  // Set props.initialValues to the currently-saved field values.
  initializeValues = () => {
    const { initialize, form } = this.props;
    (initialize || form.initialize)();
  }

  onSave(fields, index) {
    const { validate } = this.props;
    const item = this.getValue(fields, index);
    const errors = validate({ items: fields.value });

    // In redux form this error validation was executed automatically.
    // This is not a case in final form so we do it manually.

    if (!isEmpty(errors?.items?.[index])) {
      return this.setError(index, { fieldErrors: errors.items[index] });
    }

    // if item has no id, it's new...
    const callback = (item.id) ?
      this.props.onUpdate :
      this.props.onCreate;
    const res = callback(item);

    return Promise.resolve(res).then(
      () => {
        this.initializeValues(this.getValues());

        this.toggleEdit(index);
        this.setState({ creating: false });
      },
      async (response) => this.setError(index, await processBadResponse(response, errorCodes.defaultSaveError))
    );
  }

  onEdit(index) {
    this.toggleEdit(index);
  }

  onDelete(fields, index) {
    const { uniqueField } = this.props;
    const item = this.getValue(fields, index);
    const res = this.props.onDelete(item[uniqueField]);

    return Promise.resolve(res).then(
      () => {
        fields.remove(index);
        // remove item from editable tracking...
        this.setState((curState) => {
          const newState = cloneDeep(curState);
          newState.status.splice(index, 1);
          return newState;
        });
      },
      async (response) => this.setError(index, await processBadResponse(response, errorCodes.defaultRemoveError))
    );
  }

  setError(index, errorMsg) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.status[index].error = errorMsg;
      newState.lastAction = new Date().getTime();
      return newState;
    });
  }

  getColumnWidths() {
    if (!this.props.columnWidths) {
      const visibleColumns = this.getVisibleColumns();
      const totalColumns = this.props.editable ? (visibleColumns.length - 1) : (visibleColumns.length);
      const staticWidth = this.props.editable ? (80 / totalColumns) : (100 / totalColumns);
      const widthsObject = {};
      visibleColumns.forEach((f) => {
        if (f !== 'actions') {
          widthsObject[f] = `${staticWidth}%`;
        }
      });
      if (this.props.editable) {
        widthsObject.actions = '20%';
      }

      return widthsObject;
    }

    return this.props.columnWidths;
  }

  getVisibleColumns() {
    const {
      editable,
      visibleFields,
    } = this.props;

    if (editable) {
      return visibleFields.concat(['actions']);
    }

    return visibleFields;
  }

  getColumnMapping() {
    const {
      editable,
      columnMapping,
    } = this.props;

    const map = { ...columnMapping };

    if (editable) {
      map.actions = <FormattedMessage id="stripes-smart-components.actions" />;
    }

    return map;
  }

  getReadOnlyColumns() {
    const actionsArray = ['actions'];
    const {
      readOnlyFields,
      editable,
    } = this.props;

    if (readOnlyFields && editable) {
      return readOnlyFields.concat(actionsArray);
    }

    return actionsArray;
  }

  toggleEdit(index) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      if (!newState.status[index]) {
        newState.status = buildStatusArray(this.props.contentData);
      }
      newState.status[index].editing = !newState.status[index].editing;
      newState.lastAction = new Date().getTime();
      return newState;
    });
  }

  rowUpdater = (rowData, rowIndex) => {
    const { status, creating } = this.state;
    return {
      status: status[rowIndex],
      creating
    };
  };

  ItemFormatter = ({
    rowClass,
    rowIndex,
    rowData,
    cells,
    columnWidths,
    rowProps,
  }) => {
    const {
      FieldComponent,
      columnMapping,
      actionSuppression,
      actionProps,
      additionalFields,
      fieldComponents,
    } = this.props;
    let isEditing;
    let hasError;

    if (this.state.status.length > 0 && this.state.status[rowIndex]) {
      isEditing = this.state.status[rowIndex].editing;
      hasError = this.state.status[rowIndex].error;
    } else {
      isEditing = false;
      hasError = false;
    }

    return (
      <EditableItem
        editing={isEditing}
        error={hasError}
        key={rowIndex}
        field="items"
        FieldComponent={FieldComponent}
        item={rowData}
        rowIndex={rowIndex}
        columnMapping={columnMapping}
        actionSuppression={actionSuppression}
        actionProps={actionProps}
        visibleFields={this.getVisibleColumns()}
        additionalFields={additionalFields}
        readOnlyFields={this.getReadOnlyColumns()}
        fieldComponents={fieldComponents}
        widths={columnWidths}
        cells={cells}
        rowClass={rowClass}
        {...rowProps}
      />
    );
  };

  getActions = (fields, item) => {
    const {
      actionProps,
      actionSuppression,
      pristine,
      submitting,
      invalid,
      editable,
    } = this.props;
    const { status } = this.state;

    const isEditing = status.some(el => el.editing === true);

    if (!editable) {
      return null;
    }

    if (status[item.rowIndex]?.editing) {
      return (
        <Layout className="flex">
          <Button
            data-type-button="cancel"
            marginBottom0
            id={`clickable-cancel-${this.testingId}-${item.rowIndex}`}
            onClick={() => this.onCancel(fields, item.rowIndex)}
            {...(typeof actionProps.cancel === 'function' ? actionProps.cancel(item) : {})}
          >
            <FormattedMessage id="stripes-core.button.cancel" />
          </Button>
          <Button
            buttonStyle="primary"
            disabled={pristine || submitting || invalid}
            marginBottom0
            id={`clickable-save-${this.testingId}-${item.rowIndex}`}
            onClick={() => this.onSave(fields, item.rowIndex)}
            {...(typeof actionProps.save === 'function' ? actionProps.save(item) : {})}
          >
            <FormattedMessage id="stripes-core.button.save" />
          </Button>
        </Layout>
      );
    }

    return (
      <div style={{ display: 'flex' }}>
        {!actionSuppression.edit(item) &&
          <FormattedMessage id="stripes-components.editThisItem">
            {([ariaLabel]) => (
              <IconButton
                disabled={isEditing}
                icon="edit"
                size="small"
                id={`clickable-edit-${this.testingId}-${item.rowIndex}`}
                aria-label={ariaLabel}
                onClick={() => this.onEdit(item.rowIndex)}
                {...(typeof actionProps.edit === 'function' ? actionProps.edit(item) : {})}
              />
            )}
          </FormattedMessage>
        }
        {!actionSuppression.delete(item) &&
          <FormattedMessage id="stripes-components.deleteThisItem">
            {([ariaLabel]) => (
              <IconButton
                disabled={isEditing}
                icon="trash"
                size="small"
                id={`clickable-delete-${this.testingId}-${item.rowIndex}`}
                aria-label={ariaLabel}
                onClick={() => this.onDelete(fields, item.rowIndex)}
                {...(typeof actionProps.delete === 'function' ? actionProps.delete(item) : {})}
              />
            )}
          </FormattedMessage>
        }
      </div>
    );
  };

  RenderItems({ fields }) {
    const {
      pristine,
      submitting,
      invalid,
      actionProps,
      editable,
      canCreate,
      columnMapping,
    } = this.props;

    const actionColumnMapping = {
      actions: <FormattedMessage id="stripes-smart-components.editableList.actionsColumnHeader" />
    };

    const adjustedColumnMapping = { ...columnMapping, ...actionColumnMapping };
    const activeRowIndex = this.state.status.findIndex(({ editing }) => editing);
    const isEditing = activeRowIndex !== -1;
    const isCreateDisabled = isEditing || !canCreate;

    const cellFormatters = Object.assign({}, this.props.formatter, { actions: item => this.getActions(fields, item) });
    const contentData = this.getValues(fields);

    const shortcuts = [
      {
        name: 'new',
        handler: () => {
          if (!isCreateDisabled) this.onAdd(fields);
        },
      },
      {
        name: 'save',
        handler: e => {
          e.preventDefault();

          if (!(pristine || submitting || invalid)) {
            this.onSave(fields, activeRowIndex);
          }
        },
      },
      {
        name: 'cancel',
        shortcut: 'esc',
        handler: () => {
          if (isEditing) this.onCancel(fields, activeRowIndex);
        },
      },
    ];

    return (
      <HasCommand
        commands={shortcuts}
        isWithinScope={checkScope}
        scope={document.body}
      >
        <Row between="xs" className={css.editableListFormHeader}>
          <Col xs>
            <Headline size="medium" margin="none">{this.props.label}</Headline>
          </Col>
          { editable &&
            <Col xs>
              <Row end="xs">
                <Col xs>
                  <Button
                    disabled={isCreateDisabled}
                    marginBottom0
                    id={`clickable-add-${this.testingId}`}
                    onClick={() => this.onAdd(fields)}
                    {...(typeof actionProps.create === 'function' ? actionProps.create() : {})}
                  >
                    {this.props.createButtonLabel}
                  </Button>
                </Col>
              </Row>
            </Col>
          }
        </Row>
        <Row>
          <Col xs={12}>
            <MultiColumnList
              {...this.props}
              columnMapping={adjustedColumnMapping}
              visibleColumns={this.getVisibleColumns()}
              rowUpdater={this.rowUpdater}
              contentData={contentData}
              rowFormatter={this.ItemFormatter}
              rowProps={{ fields }}
              formatter={cellFormatters}
              columnWidths={this.getColumnWidths()}
              rowContainerClass={css.mclRowContainer}
              isEmptyMessage={this.props.isEmptyMessage}
              headerRowClass={css.editListHeaders}
              id={`editList-${this.testingId}`}
              editable={editable}
              getCellClass={(defaultClass) => `${defaultClass} ${css.mclCellStyle}`}
            />
          </Col>
        </Row>
      </HasCommand>
    );
  }

  render() {
    const { FieldArray } = this.props;

    return (
      <form>
        <FieldArray name="items" component={this.RenderItems} toUpdate={this.state.lastAction} />
      </form>
    );
  }
}

EditableListForm.propTypes = propTypes;
EditableListForm.defaultProps = defaultProps;

export default EditableListForm;
