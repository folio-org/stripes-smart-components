import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';
import Button from '@folio/stripes-components/lib/Button';
import Callout from '@folio/stripes-components/lib/Callout';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Modal from '@folio/stripes-components/lib/Modal';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import UserLink from '../UserLink';

class ControlledVocab extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    label: PropTypes.string.isRequired,
    labelSingular: PropTypes.string.isRequired,
    objectLabel: PropTypes.string.isRequired,
    baseUrl: PropTypes.string.isRequired,
    records: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      values: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      values: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
    visibleFields: PropTypes.arrayOf(PropTypes.string),
    hiddenFields: PropTypes.arrayOf(PropTypes.string),
    columnMapping: PropTypes.object,
    itemTemplate: PropTypes.object,
    nameKey: PropTypes.string,
    formatter: PropTypes.object,
    actionSuppressor: PropTypes.object,
    actionProps: PropTypes.object,
  };

  static defaultProps = {
    visibleFields: ['name', 'description'],
    hiddenFields: [],
    columnMapping: {},
    itemTemplate: {},
    nameKey: undefined,
    formatter: {
      numberOfObjects: () => '-',
    },
  };

  static manifest = Object.freeze({
    values: {
      type: 'okapi',
      path: '!{baseUrl}',
      records: '!{records}',
      PUT: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      DELETE: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);

    this.state = {
      showConfirmDialog: false,
      showItemInUseDialog: false,
      selectedItem: {},
      primaryField: props.visibleFields[0],
    };

    this.validate = this.validate.bind(this);
    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
    this.hideItemInUseDialog = this.hideItemInUseDialog.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visibleFields[0] !== this.state.primaryField) {
      this.setState({
        primaryField: nextProps.visibleFields[0],
      });
    }
  }

  validate({ items }) {
    const { primaryField } = this.state;

    if (Array.isArray(items)) {
      const errors = [];

      items.forEach((item, index) => {
        if (!item[primaryField]) {
          errors[index] = {
            [primaryField]: this.props.stripes.intl.formatMessage({ id: 'stripes-core.label.missingRequiredField' }),
          };
        }
      });

      if (errors.length) {
        return { items: errors };
      }
    }

    return {};
  }

  onCreateItem(item) {
    return this.props.mutator.values.POST(item);
  }

  onUpdateItem(item) {
    this.props.mutator.activeRecord.update({ id: item.id });
    return this.props.mutator.values.PUT(item);
  }

  onDeleteItem() {
    const { selectedItem } = this.state;

    this.props.mutator.activeRecord.update({ id: selectedItem.id });

    return this.deleteItem(selectedItem.id)
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

  // TODO: Refactor this to use the mutator when errors generated in mutators
  // can be intercepted to prevent throwing the alert() in connectErrorEpic.js
  deleteItem(itemId) {
    const { baseUrl, stripes } = this.props;

    const options = {
      method: 'DELETE',
      headers: {
        'X-Okapi-Tenant': stripes.okapi.tenant,
        'X-Okapi-Token': stripes.store.getState().okapi.token,
        'Content-Type': 'application/json',
      }
    };

    return fetch(`${stripes.okapi.url}/${baseUrl}/${itemId}`, options)
      .then((resp) => {
        if (resp.status === 400) {
          throw Error('Cannot delete item because it is in use');
        }
      });
  }

  showDeletionSuccessCallout(item) {
    const message = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termDeleted"
        values={{
          type: this.props.labelSingular.toLowerCase(),
          term: item[this.state.primaryField],
        }}
      />
    );

    this.callout.sendCallout({ message });
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

  renderItemInUseDialog() {
    const type = this.props.labelSingular.toLowerCase();

    return (
      <Modal
        open={this.state.showItemInUseDialog}
        label={this.props.stripes.intl.formatMessage({ id: 'stripes-smart-components.cv.cannotDeleteTermHeader' }, { type })}
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

  render() {
    if (!this.props.resources.values) return <div />;

    const { formatMessage } = this.props.stripes.intl;
    const type = this.props.labelSingular.toLowerCase();
    const term = this.state.selectedItem[this.state.primaryField];

    const modalMessage = (
      <SafeHTMLMessage
        id="stripes-smart-components.cv.termWillBeDeleted"
        values={{ type, term }}
      />
    );

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.label}>
          <EditableList
            {...this.props}
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.resources.values.records || []}
            createButtonLabel={formatMessage({ id: 'stripes-core.button.new' })}
            itemTemplate={this.props.itemTemplate}
            visibleFields={[
              ...this.props.visibleFields,
              'lastUpdated',
              'numberOfObjects',
            ].filter(field => !this.props.hiddenFields.includes(field))}
            columnMapping={{
              name: this.props.labelSingular,
              lastUpdated: formatMessage({ id: 'stripes-smart-components.cv.lastUpdated' }),
              numberOfObjects: formatMessage({ id: 'stripes-smart-components.cv.numberOfObjects' }, { objects: this.props.objectLabel }),
              ...this.props.columnMapping,
            }}
            formatter={{
              lastUpdated: (item) => {
                if (item.metadata) {
                  return (
                    <span>
                      <FormattedDate value={item.metadata.updatedDate} />
                      <span> by </span>
                      <UserLink stripes={this.props.stripes} id={item.metadata.updatedByUserId} />
                    </span>
                  );
                }

                return '-';
              },
              ...this.props.formatter,
            }}
            readOnlyFields={['lastUpdated', 'numberOfObjects']}
            actionSuppression={this.props.actionSuppressor}
            actionProps={this.props.actionProps}
            onUpdate={this.onUpdateItem}
            onCreate={this.onCreateItem}
            onDelete={this.showConfirmDialog}
            isEmptyMessage={formatMessage({ id: 'stripes-smart-components.cv.noExistingTerms' }, { terms: this.props.label.toLowerCase() })}
            validate={this.validate}
          />
          <ConfirmationModal
            open={this.state.showConfirmDialog}
            heading={formatMessage({ id: 'stripes-core.button.deleteEntry' }, { entry: type })}
            message={modalMessage}
            onConfirm={this.onDeleteItem}
            onCancel={this.hideConfirmDialog}
            confirmLabel={formatMessage({ id: 'stripes-core.button.delete' })}
          />
          { this.renderItemInUseDialog() }
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default ControlledVocab;
