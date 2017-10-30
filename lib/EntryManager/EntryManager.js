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
  };

  constructor(props) {
    super(props);

    this.onAdd = this.onAdd.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onCancel = this.onCancel.bind(this);

    const path = props.location.pathname;
    const selectedId = (/perms\//.test(path))
      ? /perms\/(.*)$/.exec(path)[1]
      : null;

    this.state = { selectedId };
    this.callout = null;
  }

  onAdd() {
    this.showLayer('add');
  }

  onEdit(entry) {
    this.setState({ selectedId: entry.id });
    this.showLayer('edit');
  }

  onSave(entry) {
    const action = (entry.id) ? 'PUT' : 'POST';
    console.log(this.props);
    return this.props.parentMutator.entries[action](entry)
      .then(() => this.hideLayer());
  }

  onRemove(entry) {
    console.log(this.props);
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
    const { entryList, location, stripes, permissions } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const selectedItem = (query.layer === 'edit')
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
        detailComponent={this.props.detailComponent}
        contentData={entryList}
        parentMutator={this.props.parentMutator}
        paneTitle={this.props.paneTitle}
        detailPaneTitle={this.props.paneTitle}
        paneWidth="70%"
        addMenu={addMenu}
      >
        <Layer isOpen={!!(query.layer)} label={`Edit ${this.props.entryLabel}`} container={container}>
          <EntryForm
            {...this.props}
            initialValues={selectedItem}
            stripes={stripes}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onRemove={this.onRemove}
            onSubmit={this.onSave}
          />
        </Layer>
        <Callout ref={(ref) => { this.callout = ref; }} />
      </EntrySelector>
    );
  }
}

export default withRouter(EntryManager);
