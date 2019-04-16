import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { isEqual } from 'lodash';

import { Button, Callout, Col, ConfirmationModal, Modal, Pane, Paneset, Row } from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import EditableList from '../EditableList';
import css from './ControlledVocab.css';

class ControlledVocab extends React.Component {
  static manifest = Object.freeze({
    values: {
      type: 'okapi',
      path: '!{baseUrl}',
      records: '!{records}',
      throwErrors: false,
      PUT: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      DELETE: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      GET: {
        path: '!{baseUrl}?query=cql.allRecords=1 sortby !{sortby}&limit=500'
      }
    },
    activeRecord: {},
    updaters: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      GET: {
        params: {
          query: (queryParams, pathComponents, resourceValues) => {
            if (resourceValues.updaterIds && resourceValues.updaterIds.length) {
              return `(${resourceValues.updaterIds.join(' or ')})`;
            }
            return null;
          },
        }
      }
    },
    updaterIds: [],
  });

  static propTypes = {
    actionProps: PropTypes.object,
    actionSuppressor: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
    columnMapping: PropTypes.object,
    formatter: PropTypes.object,
    hiddenFields: PropTypes.arrayOf(PropTypes.string),
    itemTemplate: PropTypes.object,
    label: PropTypes.node.isRequired,
    labelSingular: PropTypes.node.isRequired,
    listSuppressor: PropTypes.func,
    listSuppressorText: PropTypes.node,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      updaters: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      values: PropTypes.shape({
        DELETE: PropTypes.func,
        GET: PropTypes.func,
        POST: PropTypes.func,
        PUT: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired,
    nameKey: PropTypes.string,
    objectLabel: PropTypes.node.isRequired,
    preCreateHook: PropTypes.func,
    preUpdateHook: PropTypes.func,
    readOnlyFields: PropTypes.arrayOf(PropTypes.string),
    records: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      updaters: PropTypes.object,
      values: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    rowFilter: PropTypes.element,
    rowFilterFunction: PropTypes.func,
    sortby: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired
    }).isRequired,
    /*
    * Allows for custom field validation. The function is called for each record (row) and should
    * return an empty object for no errors, or an object where the keys are the field names and
    * the values are the error message components/strings to display.
    * e.g., (item, index, items) => ({ name: item.name === 'Admin' ? 'Name cannot be admin' : undefined })
    */
    validate: PropTypes.func,
    visibleFields: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    visibleFields: ['name', 'description'],
    hiddenFields: [],
    readOnlyFields: [],
    columnMapping: {},
    itemTemplate: {},
    nameKey: undefined,
    formatter: {
      numberOfObjects: () => '-',
    },
    actionSuppressor: {
      edit: item => item.readOnly,
      delete: item => item.readOnly,
    },
    preCreateHook: (row) => row,
    preUpdateHook: (row) => row,
    sortby: 'name',
    validate: () => ({}),
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      primaryField: props.visibleFields[0],
      userIds: [],
    };

    this.validate = this.validate.bind(this);
    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.hideItemInUseDialog = this.hideItemInUseDialog.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.visibleFields[0] !== prevState.primaryField) {
      return {
        primaryField: nextProps.visibleFields[0],
      };
    }

    return null;
  }

  componentDidUpdate() {
    // build a list of the ids of users who have updated CV items so
    // we can look them up all at once
    const { stripes, resources: { values: { records } } } = this.props;
    if (stripes.hasPerm('ui-users.view')) {
      // convert the list of values-plus-metadata to a de-duped list of
      // metadata-userids
      const userIds = [...new Set(records
        .filter(r => r.metadata && r.metadata.updatedByUserId)
        .map(r => `id=="${r.metadata.updatedByUserId}"`))
      ];

      // only query if we have users to look for
      // when loading system data; the list may be empty!
      // quiet, lint, I know what I'm doing. yes, I know this will kick
      // off another render. THAT'S EXACTLY WHAT I'M TRYING TO DO.
      // so helpful, you are.
      if (!isEqual(userIds, this.state.userIds)) {
        this.setState({ userIds }); // eslint-disable-line react/no-did-update-set-state
        this.props.mutator.updaterIds.replace(userIds);
      }
    }
  }

  onCreateItem(item) {
    return this.props.mutator.values.POST(this.props.preCreateHook(item));
  }

  onDeleteItem() {
    const { selectedItem } = this.state;

    this.props.mutator.activeRecord.update({ id: selectedItem.id });

    return this.props.mutator.values.DELETE({ id: selectedItem.id })
      .then(() => {
        this.showDeletionSuccessCallout(selectedItem);
        this.deleteItemResolve();
      })
      .catch(() => {
        this.setState({ showItemInUseDialog: true });
        this.deleteItemReject();
      })
      .finally(() => this.hideConfirmDialog());
  }

  onUpdateItem(item) {
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.values.PUT(this.props.preUpdateHook(item));
  }

  filteredRows(rows) {
    if (!this.props.rowFilterFunction) {
      return rows;
    }

    return rows.filter(row => this.props.rowFilterFunction(row));
  }

  hideConfirmDialog() {
    this.setState({
      showConfirmDialog: false,
      selectedItem: {},
    });
  }

  hideItemInUseDialog() {
    this.setState({
      showItemInUseDialog: false,
      selectedItem: {},
    });
  }

  showConfirmDialog(itemId) {
    const selectedItem = this.props.resources.values.records.find(t => t.id === itemId);

    this.setState({
      showConfirmDialog: true,
      selectedItem,
    });

    return new Promise((resolve, reject) => {
      this.deleteItemResolve = resolve;
      this.deleteItemReject = reject;
    });
  }

  showDeletionSuccessCallout(item) {
    if (this.callout) {
      const message = (
        <SafeHTMLMessage
          id="stripes-smart-components.cv.termDeleted"
          values={{
            type: this.props.labelSingular,
            term: item[this.state.primaryField],
          }}
        />
      );

      this.callout.sendCallout({ message });
    }
  }

  validate({ items }) {
    const { primaryField } = this.state;

    if (Array.isArray(items)) {
      const errors = [];

      items.forEach((item, index) => {
        // Start with getting a validation check from the parent component.
        const itemErrors = this.props.validate(item, index, items) || {};

        // Check if the primary field has had data entered into it.
        if (!item[primaryField]) {
          itemErrors[primaryField] =
            <FormattedMessage id="stripes-core.label.missingRequiredField" />;
        }

        // Add the errors if we found any for this record.
        if (itemErrors && Object.keys(itemErrors).length) {
          errors[index] = itemErrors;
        }
      });

      if (errors.length) {
        return { items: errors };
      }
    }

    return {};
  }

  renderItemInUseDialog() {
    const type = this.props.labelSingular;

    return (
      <Modal
        open={this.state.showItemInUseDialog}
        label={<FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermHeader" values={{ type }} />}
        size="small"
      >
        <Row>
          <Col xs>
            <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermMessage" values={{ type }} />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <Button buttonStyle="primary" onClick={this.hideItemInUseDialog}>
              <FormattedMessage id="stripes-core.label.okay" />
            </Button>
          </Col>
        </Row>
      </Modal>
    );
  }

  renderLastUpdated = (metadata) => {
    const updaters = this.props.resources.updaters.records || [];
    const record = updaters.find(r => r.id === metadata.updatedByUserId);

    let user = '';
    if (record) {
      const { firstName, lastName } = record.personal;
      const name = firstName ? `${lastName}, ${firstName}` : lastName;
      user = <Link to={`/users/view/${metadata.updatedByUserId}`}>{name}</Link>;
    }

    return (
      <div className={css.lastUpdated}>
        <FormattedMessage
          id="stripes-smart-components.cv.updatedAtAndBy"
          values={{
            date: <FormattedDate value={metadata.updatedDate} />,
            user,
          }}
        />
      </div>
    );
  }

  render() {
    if (!this.props.resources.values) return <div />;

    const type = this.props.labelSingular;
    const term = this.state.selectedItem[this.state.primaryField];

    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );

    const rows = this.filteredRows(this.props.resources.values.records || []);

    const hideList = this.props.listSuppressor && this.props.listSuppressor();

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.label}>
          {this.props.rowFilter}
          { hideList && this.props.listSuppressorText && <div>{this.props.listSuppressorText}</div> }
          { !hideList &&
            <EditableList
              {...this.props}
              // TODO: not sure why we need this OR if there are no groups
              // Seems to load this once before the groups data from the manifest
              // is pulled in. This still causes a JS warning, but not an error
              contentData={rows}
              totalCount={rows.length}
              createButtonLabel={<FormattedMessage id="stripes-core.button.new" />}
              itemTemplate={this.props.itemTemplate}
              visibleFields={[
                ...this.props.visibleFields,
                'lastUpdated',
                'numberOfObjects',
              ].filter(field => !this.props.hiddenFields.includes(field))}
              columnMapping={{
                name: this.props.labelSingular,
                lastUpdated: <FormattedMessage id="stripes-smart-components.cv.lastUpdated" />,
                numberOfObjects: (
                  <FormattedMessage
                    id="stripes-smart-components.cv.numberOfObjects"
                    values={{ objects: this.props.objectLabel }}
                  />
                ),
                ...this.props.columnMapping,
              }}
              formatter={{
                lastUpdated: (item) => {
                  if (item.metadata) {
                    return this.renderLastUpdated(item.metadata);
                  }

                  return '-';
                },
                ...this.props.formatter,
              }}
              readOnlyFields={[
                ...this.props.readOnlyFields,
                'lastUpdated',
                'numberOfObjects',
              ]}
              actionSuppression={this.props.actionSuppressor}
              actionProps={this.props.actionProps}
              onUpdate={this.onUpdateItem}
              onCreate={this.onCreateItem}
              onDelete={this.showConfirmDialog}
              isEmptyMessage={
                <FormattedMessage
                  id="stripes-smart-components.cv.noExistingTerms"
                  values={{ terms: this.props.label }}
                />
              }
              validate={this.validate}
            />
          }
          <ConfirmationModal
            id="delete-controlled-vocab-entry-confirmation"
            open={this.state.showConfirmDialog}
            heading={<FormattedMessage id="stripes-core.button.deleteEntry" values={{ entry: type }} />}
            message={modalMessage}
            onConfirm={this.onDeleteItem}
            onCancel={this.hideConfirmDialog}
            confirmLabel={<FormattedMessage id="stripes-core.button.delete" />}
          />
          { this.renderItemInUseDialog() }
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default ControlledVocab;
