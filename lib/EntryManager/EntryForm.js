import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { Button, ConfirmationModal, Pane, PaneMenu, Paneset } from '@folio/stripes-components';
import stripesForm from '@folio/stripes-form';

class EntryForm extends React.Component {
  static propTypes = {
    deleteDisabled: PropTypes.func.isRequired,
    deleteDisabledMessage: PropTypes.string.isRequired,
    entryLabel: PropTypes.string.isRequired,
    formComponent: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    nameKey: PropTypes.string.isRequired,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    onSave: PropTypes.func,
    permissions: PropTypes.shape({
      delete: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      put: PropTypes.string.isRequired,
    }),
    pristine: PropTypes.bool,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired
    }),
    submitting: PropTypes.bool,
    validate: PropTypes.func.isRequired,
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
        <FormattedMessage id="stripes-smart-components.closeEntryDialog">
          {ariaLabel => (
            <button
              id="clickable-close-entry"
              onClick={this.props.onCancel}
              aria-label={ariaLabel}
              type="button"
            >
              <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }}>&times;</span>
            </button>
          )}
        </FormattedMessage>
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
          disabled={(pristine || submitting)}
          marginBottom0
        >
          <FormattedMessage id="stripes-core.button.saveAndClose" />
        </Button>
      </PaneMenu>
    );
  }

  render() {
    const { handleSubmit, initialValues, permissions, stripes } = this.props;
    const selectedEntry = initialValues || {};
    const { confirmDelete } = this.state;
    const disabled = !stripes.hasPerm(permissions.put);
    const paneTitle = selectedEntry && selectedEntry.id ?
      <FormattedMessage id="stripes-core.label.editEntry" values={{ entry: this.props.entryLabel }} /> :
      <FormattedMessage id="stripes-core.label.createEntry" values={{ entry: this.props.entryLabel }} />;
    const deleteButtonText =
      <FormattedMessage id="stripes-core.button.deleteEntry" values={{ entry: this.props.entryLabel }} />;

    let deleteButton;
    if (selectedEntry && selectedEntry.id && this.props.stripes.hasPerm(permissions.delete)) {
      if (this.props.deleteDisabled(selectedEntry)) {
        deleteButton = (
          <Button disabled>
            {deleteButtonText}
          </Button>
        );
      } else {
        deleteButton = (
          <Button onClick={this.beginDelete} disabled={confirmDelete}>
            {deleteButtonText}
          </Button>
        );
      }
    }
    const message = (
      <SafeHTMLMessage
        id="stripes-core.label.confirmDeleteEntry"
        values={{
          name: selectedEntry[this.props.nameKey] || <FormattedMessage id="stripes-core.untitled" />,
        }}
      />
    );

    return (
      <form id="entry-form" onSubmit={handleSubmit(this.saveEntry)}>
        <Paneset isRoot>
          <Pane
            defaultWidth="100%"
            firstMenu={this.addFirstMenu()}
            lastMenu={this.saveLastMenu()}
            paneTitle={paneTitle}
          >
            <this.props.formComponent
              {...this.props}
              disabled={disabled}
            />

            {deleteButton}

            {selectedEntry &&
              <ConfirmationModal
                id={`delete${this.props.entryLabel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-confirmation`}
                open={confirmDelete}
                heading={deleteButtonText}
                message={message}
                onConfirm={() => { this.confirmDeleteSet(true); }}
                onCancel={() => { this.confirmDeleteSet(false); }}
                confirmLabel={<FormattedMessage id="stripes-core.button.delete" />}
                cancelLabel={<FormattedMessage id="stripes-core.button.cancel" />}
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
