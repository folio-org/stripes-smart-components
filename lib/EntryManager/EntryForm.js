import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import ConfirmationModal from '@folio/stripes-components/lib/ConfirmationModal';
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
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
  };

  constructor(props) {
    super(props);

    this.saveEntry = this.saveEntry.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.state = { confirmDelete: false };
  }

  addFirstMenu() {
    return (
      <PaneMenu>
        <button id="clickable-close-entry" onClick={this.props.onCancel} aria-label={this.props.stripes.intl.formatMessage({ id: 'stripes-smart-components.closeEntryDialog' })}>
          <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span>
        </button>
      </PaneMenu>
    );
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

  saveEntry(data) {
    this.props.onSave(data);
  }

  saveLastMenu() {
    const { pristine, submitting } = this.props;
    return (
      <PaneMenu>
        <Button
          id="clickable-save-entry"
          type="submit"
          title={this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.saveAndClose' })}
          disabled={(pristine || submitting)}
          marginBottom0
        >{this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.saveAndClose' })}
        </Button>
      </PaneMenu>
    );
  }

  render() {
    const { handleSubmit, permissions, initialValues } = this.props;
    const selectedEntry = initialValues || {};
    const { confirmDelete } = this.state;
    const disabled = !this.props.stripes.hasPerm(permissions.put);
    const paneTitle = selectedEntry && selectedEntry.id ?
      this.props.stripes.intl.formatMessage({ id: 'stripes-core.label.editEntry' }, { entry: this.props.entryLabel }) :
      this.props.stripes.intl.formatMessage({ id: 'stripes-core.label.createEntry' }, { entry: this.props.entryLabel });
    const deleteButtonText = this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.deleteEntry' }, { entry: this.props.entryLabel });

    let deleteButton;
    if (selectedEntry && selectedEntry.id && this.props.stripes.hasPerm(permissions.delete)) {
      if (this.props.deleteDisabled(selectedEntry)) {
        deleteButton = <Button title={this.props.deleteDisabledMessage} disabled> {deleteButtonText} </Button>;
      } else {
        deleteButton = <Button title={deleteButtonText} onClick={this.beginDelete} disabled={confirmDelete}> {deleteButtonText} </Button>;
      }
    }
    const message = (
      <SafeHTMLMessage
        id="stripes-core.label.confirmDeleteEntry"
        values={{
          name: selectedEntry[this.props.nameKey] || this.props.stripes.intl.formatMessage({ id: 'stripes-core.untitled' }),
        }}
      />
    );

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
                heading={deleteButtonText}
                message={message}
                onConfirm={() => { this.confirmDeleteSet(true); }}
                onCancel={() => { this.confirmDeleteSet(false); }}
                confirmLabel={this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.delete' })}
                cancelLabel={this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.cancel' })}
              />
            }
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'entryForm',
  navigationCheck: true,
  enableReinitialize: false,
})(EntryForm);
