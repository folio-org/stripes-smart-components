import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import { Button, Callout, EntrySelector, IfPermission, Layer, PaneMenu } from '@folio/stripes-components';
import queryString from 'query-string';
import isFunction from 'lodash/isFunction';
import find from 'lodash/find';

import EntryForm from './EntryForm';

class EntryWrapper extends React.Component {
  static manifest = Object.freeze({
    query: { initialValue: {} },
  });

  static propTypes = {
    asyncValidate: PropTypes.func,
    defaultEntry: PropTypes.object,
    deleteDisabled: PropTypes.func,
    deleteDisabledMessage: PropTypes.string,
    detailComponent: PropTypes.func.isRequired,
    entryFormComponent: PropTypes.func,
    entryLabel: PropTypes.string.isRequired,
    entryList: PropTypes.arrayOf(PropTypes.object).isRequired,
    formComponent: (props, propName) => {
      if (!isFunction(props.entryFormComponent) && !isFunction(props[propName])) {
        return new Error('`entryFormComponent` or `formComponent` prop is isRequired');
      }
      return null;
    },
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    idFromPathnameRe: PropTypes.string,
    location: PropTypes.object.isRequired,
    mutator: PropTypes.object,
    nameKey: PropTypes.string.isRequired,
    paneTitle: PropTypes.string.isRequired,
    parentMutator: PropTypes.object,
    permissions: PropTypes.shape({
      delete: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      put: PropTypes.string.isRequired,
    }),
    resourceKey: PropTypes.string,
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
    validate: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.onAdd = this.onAdd.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onCancel = this.onCancel.bind(this);

    const re = props.idFromPathnameRe ? props.idFromPathnameRe : '/([^/]+)$';
    const editMode = props.location.search.match('layer=edit');
    const reMatches = new RegExp(re).exec(props.location.pathname);
    const selectedId = (editMode && reMatches) ? reMatches[1] : null;

    this.state = { selectedId };
    this.callout = null;
  }

  onAdd() {
    this.setState({ selectedId: null });
    this.showLayer('add');
  }

  onCancel(e) {
    e.preventDefault();
    this.hideLayer();
  }

  onEdit(entry) {
    this.setState({ selectedId: entry.id });
    this.showLayer('edit');
  }

  onRemove(entry) {
    const rk = this.props.resourceKey ? this.props.resourceKey : 'entries';
    return this.props.parentMutator[rk].DELETE(entry).then(() => {
      this.showCalloutMessage(entry[this.props.nameKey]);
      this.hideLayer();
    });
  }

  onSave(entry) {
    const action = (entry.id) ? 'PUT' : 'POST';
    const rk = this.props.resourceKey ? this.props.resourceKey : 'entries';
    return this.props.parentMutator[rk][action](entry)
      .then(() => this.hideLayer());
  }

  onSelect(entry) {
    this.setState({ selectedId: entry.id });
  }

  hideLayer() {
    this.props.mutator.query.update({
      _path: this.props.location.pathname,
      layer: '',
    });
  }

  showLayer(name) {
    this.props.mutator.query.update({
      _path: this.props.location.pathname,
      layer: name,
    });
  }

  showCalloutMessage(name) {
    const message = (
      <SafeHTMLMessage
        id="stripes-core.successfullyDeleted"
        values={{
          entry: this.props.entryLabel,
          name: name || '',
        }}
      />
    );

    this.callout.sendCallout({ message });
  }

  render() {
    const { entryList, location, permissions, entryLabel, nameKey, stripes: { intl } } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const defaultEntry = this.props.defaultEntry || {};
    const baseId = entryLabel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const selectedItem = (this.state.selectedId)
      ? find(entryList, entry => entry.id === this.state.selectedId) : defaultEntry;

    const container = document.getElementById('ModuleContainer');
    if (!container) return (<div />);

    const addMenu = (
      <IfPermission perm={permissions.post}>
        {/* In practice, there is point letting someone create something if they can't update it */}
        <IfPermission perm={permissions.put}>
          <PaneMenu>
            <Button
              id={`${baseId}-add-new`}
              title={intl.formatMessage({ id: 'stripes-core.button.new_tooltip' }, { entry: entryLabel })}
              onClick={this.onAdd}
              buttonStyle="primary paneHeaderNewButton"
              marginBottom0
            >
              {intl.formatMessage({ id: 'stripes-core.button.new' })}
            </Button>
          </PaneMenu>
        </IfPermission>
      </IfPermission>
    );

    const EntryFormComponent = (this.props.entryFormComponent) ? this.props.entryFormComponent : EntryForm;

    return (
      <EntrySelector
        {...this.props}
        onAdd={this.onAdd}
        onEdit={this.onEdit}
        onClick={this.onSelect}
        detailComponent={this.props.detailComponent}
        contentData={entryList}
        parentMutator={this.props.parentMutator}
        paneTitle={this.props.paneTitle}
        detailPaneTitle={selectedItem ? selectedItem[nameKey] : entryLabel}
        paneWidth="70%"
        addMenu={addMenu}
      >
        <Layer
          isOpen={!!(query.layer)}
          label={intl.formatMessage({ id: 'stripes-core.label.editEntry' }, { entry: entryLabel })}
          container={container}
        >
          <EntryFormComponent
            {...this.props}
            initialValues={selectedItem}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onRemove={this.onRemove}
            onSubmit={this.onSave}
            validate={this.props.validate ? this.props.validate : () => ({})}
            asyncValidate={this.props.asyncValidate}
            deleteDisabled={this.props.deleteDisabled ? this.props.deleteDisabled : () => (false)}
            deleteDisabledMessage={this.props.deleteDisabledMessage || ''}
          />
        </Layer>
        <Callout ref={(ref) => { this.callout = ref; }} />
      </EntrySelector>
    );
  }
}

export default EntryWrapper;
