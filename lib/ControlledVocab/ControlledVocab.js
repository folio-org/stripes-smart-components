import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { isEqual, uniqueId, pickBy, noop } from 'lodash';
import { deprecated } from 'prop-types-extra';

import {
  Button,
  Callout,
  Col,
  ConfirmationModal,
  Modal,
  Pane,
  Paneset,
  Row,
  Loading,
  ModalFooter,
} from '@folio/stripes-components';

import EditableList from '../EditableList';
import css from './ControlledVocab.css';
import makeRefdataActuatorsBoundTo from './actuators-refdata';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
const ACTIONS = {
  CREATE: 'termCreated',
  EDIT: 'termUpdated',
  DELETE: 'termDeleted',
};

const getTenantFromRESTResource = (queryParams, pathComponents, resourceValues, logger, props) => {
  const {
    tenant,
    stripes,
  } = props;

  return tenant || stripes.okapi.tenant;
};

class ControlledVocab extends React.Component {
  static manifest = Object.freeze({
    values: {
      type: 'okapi',
      path: '!{baseUrl}',
      records: '!{records}',
      throwErrors: false,
      tenant: getTenantFromRESTResource,
      clientGeneratePk: '!{clientGeneratePk}',
      PUT: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      DELETE: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      GET: {
        path: '!{baseUrl}?query=cql.allRecords=1 sortby !{sortby:-name}&!{limitParam:-limit}=2000'
      }
    },
    // Only used when actuatorType="refdata"
    refdataValues: {
      type: 'okapi',
      fetch: false,
      clientGeneratePk: '!{clientGeneratePk}',
      throwErrors: false,
      PUT: {
        path: '!{baseUrl}',
      },
    },
    activeRecord: {},
    updaters: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      tenant: getTenantFromRESTResource,
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
    updaterIds: {},
  });

  static propTypes = {
    actionProps: PropTypes.object,
    actionSuppressor: PropTypes.object,
    actuatorType: PropTypes.string,
    baseUrl: PropTypes.string.isRequired,
    canCreate: PropTypes.bool,
    clientGeneratePk: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    columnMapping: PropTypes.object,
    editable: PropTypes.bool,
    formatter: PropTypes.object,
    hiddenFields: PropTypes.arrayOf(PropTypes.string),
    hideCreateButton: PropTypes.bool,
    id: PropTypes.string,
    itemTemplate: PropTypes.object,
    label: PropTypes.node.isRequired,
    labelSingular: deprecated(
      PropTypes.node,
      'Provide translation prop instead'
    ),
    limitParam: PropTypes.string,
    listFormLabel: PropTypes.node,
    listSuppressor: PropTypes.func,
    listSuppressorText: PropTypes.node,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      updaterIds: PropTypes.shape({
        replace: PropTypes.func,
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
    onCreateFail: PropTypes.func,
    parseRow: PropTypes.func,
    preCreateHook: PropTypes.func,
    preUpdateHook: PropTypes.func,
    readOnlyFields: PropTypes.arrayOf(PropTypes.string),
    records: PropTypes.string,
    resources: PropTypes.shape({
      updaterIds: PropTypes.oneOfType([
        PropTypes.object, // It comes back as this early in the lifecycle
        PropTypes.arrayOf(PropTypes.string),
      ]),
      updaters: PropTypes.object,
      values: PropTypes.shape({
        isPending: PropTypes.bool,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    rowFilter: PropTypes.element,
    rowFilterFunction: PropTypes.func,
    sortby: PropTypes.string,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
      okapi: PropTypes.shape({
        tenant: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    /*
      sample translation prop
      {
        cannotDeleteTermHeader: "Cannot delete patron group",
        cannotDeleteTermMessage: "This patron group cannot be deleted, as it is in use by one or more records.",
        deleteEntry: "Delete patron group",
        termCreated: "The patron group <b>{term}</b> was successfully <b>created</b>",
        termDeleted: "The patron group <b>{term}</b> was successfully <b>deleted</b>",
        termUpdated: "The patron group <b>{term}</b> was successfully <b>updated</b>",
        termWillBeDeleted: "The patron group <b>{term}</b> will be <b>deleted.</b>"
      }
    */
    tenant: PropTypes.string,
    translations: PropTypes.shape({
      cannotDeleteTermHeader: PropTypes.string,
      cannotDeleteTermMessage: PropTypes.string,
      deleteEntry: PropTypes.string,
      termDeleted: PropTypes.string,
      termCreated: PropTypes.string,
      termUpdated: PropTypes.string,
      termWillBeDeleted: PropTypes.string,
    }),
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
    hideCreateButton: false,
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
    validate: () => ({}),
    clientGeneratePk: true,
    editable: true,
    // We would like to use
    //  limitParam: 'limit'
    //  sortby: 'name',
    // here, but that doesn't work as defaultProps are not visible to
    // react-redux. As a result, they don't show up for substitution
    // in a stripes-connect manifest, which is why we hardwire the
    // default value "limit" right into the expression
    //  !{limitParam:-limit}
    // in the manifest above.
    actuatorType: 'rest',
    canCreate: true,
    translations: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      primaryField: props.visibleFields[0],
    };

    this.paneTitleRef = React.createRef();

    this.validate = this.validate.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.hideItemInUseDialog = this.hideItemInUseDialog.bind(this);
    this.id = props.id || uniqueId('controlled-vocab-');

    if (this.props.actuatorType === 'refdata') {
      this.actuators = makeRefdataActuatorsBoundTo(this);
    } else {
      this.actuators = {
        onCreate: this.onCreateItem.bind(this),
        onDelete: this.onDeleteItem.bind(this),
        onUpdate: this.onUpdateItem.bind(this),
      };
    }
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
    if (stripes.hasPerm('users.collection.get')) {
      // convert the list of values-plus-metadata to a de-duped list of
      // metadata-userids
      const userIds = [...new Set(records
        .filter(r => r.metadata && r.metadata.updatedByUserId)
        .map(r => `id=="${r.metadata.updatedByUserId}"`))
      ];

      // only query if we have users to look for
      // when loading system data; the list may be empty!
      if (!isEqual(userIds, this.props.resources.updaterIds)) {
        this.props.mutator.updaterIds.replace(userIds);
      }
    }
  }

  onCreateItem(item) {
    return this.props.mutator.values.POST(this.props.preCreateHook(item))
      .then(() => {
        this.showSuccessCallout(item, ACTIONS.CREATE);
      })
      .catch(res => {
        if (!this.props.onCreateFail) {
          throw res; // throw again so handlers in EditableListForm can handle it
        }

        this.props.onCreateFail(res);
      });
  }

  onDeleteItem() {
    const { selectedItem } = this.state;

    this.props.mutator.activeRecord.update({ id: selectedItem.id });

    return this.props.mutator.values.DELETE({ id: selectedItem.id })
      .then(() => {
        this.showSuccessCallout(selectedItem, ACTIONS.DELETE);
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
    return this.props.mutator.values.PUT(this.props.preUpdateHook(item))
      .then(() => {
        this.showSuccessCallout(item, ACTIONS.EDIT);
      });
  }

  filteredRows(rows) {
    if (!this.props.rowFilterFunction) {
      return rows;
    }

    return rows.filter(row => this.props.rowFilterFunction(row));
  }

  parseRows(rows) {
    if (!this.props.parseRow) {
      return rows;
    }

    return rows.map(this.props.parseRow);
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

  showSuccessCallout(item, action) {
    if (!this.callout) {
      return;
    }

    const {
      termCreated,
      termDeleted,
      termUpdated,
    } = this.props.translations;

    const translationByAction = {
      [ACTIONS.CREATE]: termCreated,
      [ACTIONS.DELETE]: termDeleted,
      [ACTIONS.EDIT]: termUpdated,
    };

    const translation = translationByAction[action];

    const message = (
      translation ?
        <FormattedMessage
          id={translation}
          values={{
            term: item[this.state.primaryField],
          }}
        /> :
        <FormattedMessage
          id={`stripes-smart-components.cv.${action}`}
          values={{
            type: this.props.labelSingular,
            term: item[this.state.primaryField],
          }}
        />
    );

    this.callout.sendCallout({ message });
  }

  handlePaneFocus({ paneTitleRef }) {
    if (paneTitleRef) paneTitleRef.current.focus();
  }

  validate({ items }) {
    const { primaryField } = this.state;

    if (Array.isArray(items)) {
      const errors = [];

      items.forEach((item, index) => {
        // Start with getting a validation check from the parent component.
        const itemErrors = this.props.validate(item, index, items) || {};

        // Check if the primary field has had data entered into it.
        if (!item[primaryField]?.trim()) {
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
    const { cannotDeleteTermHeader, cannotDeleteTermMessage } = this.props.translations ?? {};

    const footer = (
      <ModalFooter>
        <Button
          buttonStyle="primary"
          onClick={this.hideItemInUseDialog}
          marginBottom0
        >
          <FormattedMessage id="stripes-core.label.okay" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        footer={footer}
        open={this.state.showItemInUseDialog}
        label={
          cannotDeleteTermHeader ?
            <FormattedMessage id={cannotDeleteTermHeader} /> :
            <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermHeader" values={{ type }} />
        }
        size="small"
      >
        <Row>
          <Col xs>
            {
              cannotDeleteTermMessage ?
                <FormattedMessage id={cannotDeleteTermMessage} /> :
                <FormattedMessage id="stripes-smart-components.cv.cannotDeleteTermMessage" values={{ type }} />
            }
          </Col>
        </Row>
      </Modal>
    );
  }

  renderLastUpdated = (metadata) => {
    const updaters = this.props.resources.updaters.records || [];
    const record = updaters.find(r => r.id === metadata.updatedByUserId);

    let user = '';
    if (record?.personal) {
      const { firstName, lastName = '' } = record.personal;
      const name = firstName ? `${lastName}, ${firstName}` : lastName;
      user = <Link to={`/users/view/${metadata.updatedByUserId}`}>{name}</Link>;
    } else if (metadata.updatedByUserId === SYSTEM_USER_ID || !metadata.updatedByUserId) {
      user = <FormattedMessage id="stripes-smart-components.system" />;
    } else {
      user = <FormattedMessage id="stripes-components.metaSection.unknownUser" />;
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
    const { values } = this.props.resources;
    const { termWillBeDeleted, deleteEntry } = this.props.translations ?? {};

    if (!values) return <div />;

    const type = this.props.labelSingular;
    const term = this.state.selectedItem[this.state.primaryField];

    const modalMessage = (
      termWillBeDeleted ?
        <FormattedMessage
          id={termWillBeDeleted}
          values={{ term }}
        /> :
        <FormattedMessage
          id="stripes-smart-components.cv.termWillBeDeleted"
          values={{ type, term }}
        />
    );

    const rows = this.parseRows(
      this.filteredRows(values.records || [])
    );

    const hideList = this.props.listSuppressor && this.props.listSuppressor();
    const dataProps = pickBy(this.props, (_, key) => /^data-test/.test(key));

    return (
      <Paneset id={this.id} {...dataProps}>
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={this.props.label}
          paneTitleRef={this.paneTitleRef}
          onMount={this.handlePaneFocus}
          id="controlled-vocab-pane"
        >
          {this.props.rowFilter}
          { hideList && this.props.listSuppressorText && <div>{this.props.listSuppressorText}</div> }
          { !hideList &&
            <EditableList
              {...this.props}
              // TODO: not sure why we need this OR if there are no groups
              // Seems to load this once before the groups data from the manifest
              // is pulled in. This still causes a JS warning, but not an error
              canCreate={this.props.canCreate}
              contentData={rows}
              totalCount={rows.length}
              createButtonLabel={<FormattedMessage id="stripes-core.button.new" />}
              label={this.props.listFormLabel || this.props.label}
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
              onUpdate={this.actuators.onUpdate}
              onCreate={this.actuators.onCreate}
              onDelete={this.showConfirmDialog}
              onSubmit={noop}
              isEmptyMessage={
                values.isPending
                  ? <Loading />
                  : (
                    <FormattedMessage
                      id="stripes-smart-components.cv.noExistingTerms"
                      values={{ terms: this.props.label }}
                    />
                  )
              }
              validate={this.validate}
            />
          }
          <ConfirmationModal
            id="delete-controlled-vocab-entry-confirmation"
            open={this.state.showConfirmDialog}
            heading={
              deleteEntry ?
                <FormattedMessage id={deleteEntry} /> :
                <FormattedMessage id="stripes-core.button.deleteEntry" values={{ entry: type }} />
            }
            message={modalMessage}
            onConfirm={this.actuators.onDelete}
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
