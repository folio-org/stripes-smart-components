import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import EntrySelector from '@folio/stripes-components/lib/EntrySelector';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Callout from '@folio/stripes-components/lib/Callout';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Layer from '@folio/stripes-components/lib/Layer';
import queryString from 'query-string';

import EntryForm from './EntryForm';

class EntryManager extends React.Component {
  static propTypes = {
    entryLabel: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    idFromPathnameRe: PropTypes.string,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    formComponent: PropTypes.func.isRequired,
    detailComponent: PropTypes.func.isRequired,
    permissions: PropTypes.shape({
      put: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      delete: PropTypes.string.isRequired,
    }),
    parentMutator: PropTypes.shape({
      entries: PropTypes.isReqired,
    }),
    nameKey: PropTypes.string.isRequired,
    entryList: PropTypes.arrayOf(PropTypes.object).isRequired,
    paneTitle: PropTypes.string.isRequired,
    validate: PropTypes.func,
    deleteDisabled: PropTypes.func,
    deleteDisabledMessage: PropTypes.string,
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
    const reMatches = new RegExp(re).exec(props.location.pathname);
    const selectedId = reMatches ? reMatches[1] : null;

    this.state = { selectedId };
    this.callout = null;
  }

  onAdd() {
    this.setState({ selectedId: null });
    this.showLayer('add');
  }

  onEdit(entry) {
    this.setState({ selectedId: entry.id });
    this.showLayer('edit');
  }

  onSelect(entry) {
    this.setState({ selectedId: entry.id });
  }

  onSave(entry) {
    const action = (entry.id) ? 'PUT' : 'POST';
    return this.props.parentMutator.entries[action](entry)
      .then(() => this.hideLayer());
  }

  onRemove(entry) {
    return this.props.parentMutator.entries.DELETE(entry).then(() => {
      this.showCalloutMessage(entry[this.props.nameKey]);
      this.hideLayer();
    });
  }

  onCancel(e) {
    e.preventDefault();
    this.hideLayer();
  }

  showCalloutMessage(name) {
    const message = (
      <span>
        The {this.props.entryLabel} <strong>{name || 'Untitled' }</strong> was successfully <strong>deleted</strong>.
      </span>
    );

    this.callout.sendCallout({ message });
  }

  showLayer(name) {
    this.props.history.push(`${this.props.location.pathname}?layer=${name}`);
  }

  hideLayer() {
    this.props.history.push(`${this.props.location.pathname}`);
  }

  render() {
    const { entryList, location, permissions } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const selectedItem = (this.state.selectedId)
      ? _.find(entryList, entry => entry.id === this.state.selectedId) : {};

    const container = document.getElementById('ModuleContainer');
    if (!container) return (<div />);

    const addMenu = (
      <IfPermission perm={permissions.post}>
        {/* In practice, there is point letting someone create something if they can't update it */}
        <IfPermission perm={permissions.put}>
          <PaneMenu>
            <Button title={`Add ${this.props.entryLabel}`} onClick={this.onAdd} buttonStyle="primary paneHeaderNewButton">
              + New
            </Button>
          </PaneMenu>
        </IfPermission>
      </IfPermission>
    );

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
        detailPaneTitle={selectedItem ? selectedItem[this.props.nameKey] : this.props.entryLabel}
        paneWidth="70%"
        addMenu={addMenu}
      >
        <Layer isOpen={!!(query.layer)} label={`Edit ${this.props.entryLabel}`} container={container}>
          <EntryForm
            {...this.props}
            initialValues={selectedItem}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onRemove={this.onRemove}
            onSubmit={this.onSave}
            validate={this.props.validate ? this.props.validate : () => ({})}
            deleteDisabled={this.props.deleteDisabled ? this.props.deleteDisabled : () => (false)}
            deleteDisabledMessage={this.props.deleteDisabledMessage || ''}
          />
        </Layer>
        <Callout ref={(ref) => { this.callout = ref; }} />
      </EntrySelector>
    );
  }
}

export default withRouter(EntryManager);
