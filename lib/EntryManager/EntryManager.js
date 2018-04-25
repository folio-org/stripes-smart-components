import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
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
    entryFormComponent: PropTypes.func,
    formComponent: (props, propName) => {
      if (!_.isFunction(props.entryFormComponent) && !_.isFunction(props[propName])) {
        return new Error('`entryFormComponent` or `formComponent` prop is isRequired');
      }
      return null;
    },
    detailComponent: PropTypes.func.isRequired,
    permissions: PropTypes.shape({
      put: PropTypes.string.isRequired,
      post: PropTypes.string.isRequired,
      delete: PropTypes.string.isRequired,
    }),
    parentMutator: PropTypes.object,
    nameKey: PropTypes.string.isRequired,
    entryList: PropTypes.arrayOf(PropTypes.object).isRequired,
    resourceKey: PropTypes.string,
    defaultEntry: PropTypes.object,
    paneTitle: PropTypes.string.isRequired,
    validate: PropTypes.func,
    asyncValidate: PropTypes.func,
    deleteDisabled: PropTypes.func,
    deleteDisabledMessage: PropTypes.string,
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      }),
    }),
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
    const rk = this.props.resourceKey ? this.props.resourceKey : 'entries';
    return this.props.parentMutator[rk][action](entry)
      .then(() => this.hideLayer());
  }

  onRemove(entry) {
    const rk = this.props.resourceKey ? this.props.resourceKey : 'entries';
    return this.props.parentMutator[rk].DELETE(entry).then(() => {
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

  showLayer(name) {
    this.props.history.push(`${this.props.location.pathname}?layer=${name}`);
  }

  hideLayer() {
    this.props.history.push(`${this.props.location.pathname}`);
  }

  render() {
    const { entryList, location, permissions } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const defaultEntry = this.props.defaultEntry || {};
    const selectedItem = (this.state.selectedId)
      ? _.find(entryList, entry => entry.id === this.state.selectedId) : defaultEntry;

    const container = document.getElementById('ModuleContainer');
    if (!container) return (<div />);

    const addMenu = (
      <IfPermission perm={permissions.post}>
        {/* In practice, there is point letting someone create something if they can't update it */}
        <IfPermission perm={permissions.put}>
          <PaneMenu>
            <Button title={this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.new_tooltip' }, { entry: this.props.entryLabel })} onClick={this.onAdd} buttonStyle="primary paneHeaderNewButton" marginBottom0>
              {this.props.stripes.intl.formatMessage({ id: 'stripes-core.button.new' })}
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
        detailPaneTitle={selectedItem ? selectedItem[this.props.nameKey] : this.props.entryLabel}
        paneWidth="70%"
        addMenu={addMenu}
      >
        <Layer isOpen={!!(query.layer)} label={this.props.stripes.intl.formatMessage({ id: 'stripes-core.label.editEntry' }, { entry: this.props.entryLabel })} container={container}>
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

export default withRouter(EntryManager);
