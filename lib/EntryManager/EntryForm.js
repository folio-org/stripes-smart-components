import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import stripesForm from '@folio/stripes-form';

class EntryForm extends React.Component {

  static propTypes = {
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    formComponent: PropTypes.func.isRequired,
    entryLabel: PropTypes.string.isRequired,
    nameKey: PropTypes.string.isRequired,
    permissions: PropTypes.shape({
      put: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      delete: PropTypes.string.isRequired,
    }),
    validate: PropTypes.func.isRequired,
    deleteDisabled: PropTypes.func.isRequired,
    deleteDisabledMessage: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.saveEntry = this.saveEntry.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.state = { confirmDelete: false };
  }

  saveEntry(data) {
    this.props.onSave(data);
  }

  beginDelete() {
    this.setState({
      confirmDelete: true,
    });
  }

  confirmDeleteSet(confirmation) {
    const selectedEntry = this.props.initialValues;
    if (confirmation) {
      this.props.onRemove(selectedEntry);
    } else {
      this.setState({ confirmDelete: false });
    }
  }

  addFirstMenu() {
    return (
      <PaneMenu>
        <button id="clickable-close-entry" onClick={this.props.onCancel} title="close" aria-label="Close Entry Dialog">
          <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span>
        </button>
      </PaneMenu>
    );
  }

  saveLastMenu() {
    const { pristine, submitting } = this.props;
    return (
      <PaneMenu>
        <Button
          id="clickable-save-entry"
          type="submit"
          title="Save and close"
          disabled={(pristine || submitting)}
        >Save and close</Button>
      </PaneMenu>
    );
  }

  render() {
    const { handleSubmit, permissions, initialValues } = this.props;
    const selectedEntry = initialValues || {};
    const { confirmDelete } = this.state;
    const disabled = !this.context.stripes.hasPerm(permissions.put);
    const paneTitle = selectedEntry && selectedEntry.id ? `Edit ${this.props.entryLabel}` : `Create ${this.props.entryLabel}`;

    let deleteButton;
    if (selectedEntry && selectedEntry.id && this.context.stripes.hasPerm(permissions.delete)) {
      if (this.props.deleteDisabled(selectedEntry)) {
        deleteButton = <Button title={this.props.deleteDisabledMessage} disabled> Delete {this.props.entryLabel} </Button>;
      } else {
        deleteButton = <Button title={`Delete ${this.props.entryLabel}`} onClick={this.beginDelete} disabled={confirmDelete}> Delete {this.props.entryLabel} </Button>;
      }
    }

    return (
      <form id="entry-form" onSubmit={handleSubmit(this.saveEntry)}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={this.addFirstMenu()} lastMenu={this.saveLastMenu()} paneTitle={paneTitle}>
            <this.props.formComponent
              {...this.props}
              disabled={disabled}
            />

            {deleteButton}

            {selectedEntry &&
              <ConfirmationModal
                open={confirmDelete}
                heading={`Delete ${this.props.entryLabel}?`}
                message={(<span><strong>{selectedEntry[this.props.nameKey] || `Untitled ${this.props.entryLabel}`}</strong> will be <strong>removed</strong>.</span>)}
                onConfirm={() => { this.confirmDeleteSet(true); }}
                onCancel={() => { this.confirmDeleteSet(false); }}
                confirmLabel="Delete"
              />
            }
          </Pane>
        </Paneset>
      </form>
    );
  }
}

EntryForm.contextTypes = {
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default stripesForm({
  form: 'entryForm',
  navigationCheck: true,
  enableReinitialize: false,
})(EntryForm);
