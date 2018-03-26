import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import Callout from '@folio/stripes-components/lib/Callout';

import UserLink from '../UserLink';

class ControlledVocab extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
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
      selectedItem: {},
    };

    this.validate = this.validate.bind(this);
    this.onCreateItem = this.onCreateItem.bind(this);
    this.onUpdateItem = this.onUpdateItem.bind(this);
    this.onDeleteItem = this.onDeleteItem.bind(this);
    this.showConfirmDialog = this.showConfirmDialog.bind(this);
    this.hideConfirmDialog = this.hideConfirmDialog.bind(this);
  }

  validate({ items }) {
    const primaryField = this.props.visibleFields[0];

    if (Array.isArray(items)) {
      const errors = [];

      items.forEach((item, index) => {
        if (!item[primaryField]) {
          errors[index] = {
            [primaryField]: 'Please fill this in to continue',
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
    return this.props.mutator.values.DELETE(selectedItem)
      .then(() => this.deleteItemResolve())
      .then(() => this.showDeletionSuccessCallout(selectedItem))
      .catch(() => this.deleteItemReject())
      .finally(() => this.hideConfirmDialog());
  }

  showDeletionSuccessCallout(name) {
    const message = (
      <span>
        The material type <strong>{name.name}</strong> was successfully <strong>deleted</strong>.
      </span>
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

  render() {
    if (!this.props.resources.values) return <div />;

    const modalMessage = <span>The {this.props.labelSingular.toLowerCase()} <strong>{this.state.selectedItem.name}</strong> will be <strong>deleted.</strong></span>;

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.label}>
          <EditableList
            {...this.props}
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.resources.values.records || []}
            createButtonLabel="+ Add new"
            itemTemplate={this.props.itemTemplate}
            visibleFields={[
              ...this.props.visibleFields,
              'lastUpdated',
              'numberOfObjects',
            ].filter(field => !this.props.hiddenFields.includes(field))}
            columnMapping={{
              name: this.props.labelSingular,
              lastUpdated: 'Last Updated',
              numberOfObjects: `# of ${this.props.objectLabel}`,
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
            isEmptyMessage={`There are no ${this.props.label.toLowerCase()}`}
            validate={this.validate}
          />
          <ConfirmationModal
            open={this.state.showConfirmDialog}
            heading={`Delete ${this.props.labelSingular.toLowerCase()}?`}
            message={modalMessage}
            onConfirm={this.onDeleteItem}
            onCancel={this.hideConfirmDialog}
            confirmLabel="Delete"
          />
          <Callout ref={(ref) => { this.callout = ref; }} />
        </Pane>
      </Paneset>
    );
  }
}

export default ControlledVocab;
