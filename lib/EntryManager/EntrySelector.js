import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes-core';
import {
  Button,
  Icon,
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  PaneMenu,
  Paneset,
  ConfirmationModal,
  Modal,
} from '@folio/stripes-components';
import ConnectedWrapper from './ConnectedWrapper';

class EntrySelector extends React.Component {
  static propTypes = {
    addButtonTitle: PropTypes.string,
    addMenu: PropTypes.node,
    children: PropTypes.node,
    clonable: PropTypes.bool,
    contentData: PropTypes.arrayOf(
      PropTypes.object,
    ).isRequired,
    detailComponent: PropTypes.func.isRequired,
    detailPaneTitle: PropTypes.node,
    editable: PropTypes.bool,
    enableDetailsActionMenu: PropTypes.bool,
    entryLabel: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isEntryInUse: PropTypes.func,
    location: PropTypes.object.isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    nameKey: PropTypes.string,
    onAdd: PropTypes.func,
    onClick: PropTypes.func,
    onClone: PropTypes.func,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func.isRequired,
    paneSetWidth: PropTypes.string,
    paneTitle: PropTypes.node,
    paneWidth: PropTypes.string.isRequired,
    parentMutator: PropTypes.object.isRequired,
    parentResources: PropTypes.object,
    resourcePath: PropTypes.string,
    permissions: PropTypes.object,
    prohibitItemDelete: PropTypes.shape({
      close: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.string,
      ]),
      label: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.string,
      ]),
      message: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.string,
      ]),
    }),
    rowFilter: PropTypes.element,
    rowFilterFunction: PropTypes.func,
    stripes: PropTypes.object,
  };

  static defaultProps = {
    editable: true,
    nameKey: 'name',
    paneSetWidth: 'fill',
    permissions: {},
    isEntryInUse: () => false,
    prohibitItemDelete: {
      close: '',
      label: '',
      message: '',
    }
  };

  constructor(props) {
    super(props);

    this.activeLink = this.activeLink.bind(this);
    this.linkPath = this.linkPath.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      prohibitDelete: false,
      confirmDelete: false,
    };
  }

  filteredRows(rows) {
    if (!this.props.rowFilterFunction) {
      return rows;
    }

    return rows.filter(row => this.props.rowFilterFunction(row));
  }

  linkPath(id) {
    return `${this.props.match.path}/${id}`;
  }

  activeLink(links) {
    return this.props.location.pathname || this.linkPath(links[0].key);
  }

  onClose() {
    this.props.history.push(`${this.props.match.path}`);
  }

  onClick(item) {
    if (this.props.onClick) {
      this.props.onClick(item);
    }
  }

  getActionMenu = item => ({ onToggle }) => {
    const {
      onClone,
      onEdit,
      permissions,
      isEntryInUse,
    } = this.props;

    return (
      <>
        <IfPermission perm={permissions.post}>
          <IfPermission perm={permissions.put}>
            <Button
              buttonStyle="dropdownItem"
              id="dropdown-clickable-duplicate-item"
              onClick={() => {
                onClone(item);
                onToggle();
              }}
            >
              <Icon icon="duplicate">
                <FormattedMessage id="stripes-smart-components.settings.common.duplicate" />
              </Icon>
            </Button>
          </IfPermission>
        </IfPermission>
        <IfPermission perm={permissions.post}>
          <Button
            buttonStyle="dropdownItem"
            id="dropdown-clickable-edit-item"
            onClick={() => {
              onEdit(item);
              onToggle();
            }}
          >
            <Icon icon="edit">
              <FormattedMessage id="stripes-smart-components.settings.common.edit" />
            </Icon>
          </Button>
        </IfPermission>
        <IfPermission perm={permissions.delete}>
          <Button
            buttonStyle="dropdownItem"
            id="dropdown-clickable-delete-item"
            onClick={() => {
              onToggle();
              if (isEntryInUse(item.id)) {
                this.changeProhibitDeleteState(true);
              } else {
                this.changeDeleteState(true);
              }
            }}
          >
            <Icon icon="trash">
              <FormattedMessage id="stripes-smart-components.settings.common.delete" />
            </Icon>
          </Button>
        </IfPermission>
      </>
    );
  };

  changeDeleteState = (confirmDelete) => {
    this.setState({ confirmDelete });
  }

  changeProhibitDeleteState = (prohibitDelete) => {
    this.setState({ prohibitDelete });
  }

  confirmDelete = (confirmation, item = {}) => {
    if (confirmation) {
      this.props.onRemove(item);
    }

    this.changeDeleteState(false);
  }

  renderDetail(item) {
    const {
      detailPaneTitle,
      stripes,
      paneWidth,
      detailComponent,
      parentMutator,
      resourcePath,
      editable,
      parentResources,
      enableDetailsActionMenu,
      prohibitItemDelete,
      nameKey
    } = this.props;

    const {
      confirmDelete,
      prohibitDelete,
    } = this.state;

    const ComponentToRender = resourcePath ? ConnectedWrapper : detailComponent;

    const lastMenu = (
      <PaneMenu>
        <FormattedMessage id="stripes-components.button.edit">
          {([ariaLabel]) => (
            editable && (
              <Button
                onClick={() => this.props.onEdit(item)}
                id="clickable-edit-item"
                aria-label={ariaLabel}
                buttonStyle="primary"
                marginBottom0
              >
                <FormattedMessage id="stripes-core.button.edit" />
              </Button>
            )
          )}
        </FormattedMessage>
      </PaneMenu>
    );

    return (
      <Pane
        paneTitle={detailPaneTitle}
        actionMenu={enableDetailsActionMenu && this.getActionMenu(item)}
        lastMenu={!enableDetailsActionMenu ? lastMenu : undefined}
        defaultWidth={paneWidth}
        dismissible
        onClose={this.onClose}
      >
        <ComponentToRender
          {...this.props}
          stripes={stripes}
          parentResources={parentResources}
          initialValues={item}
          parentMutator={parentMutator}
          resourcePath={this.props.resourcePath}
          underlyingComponent={detailComponent}
        />
        <ConfirmationModal
          id="delete-item-confirmation"
          open={confirmDelete}
          heading={(
            <FormattedMessage
              id="stripes-core.button.deleteEntry"
              values={{ entry: this.props.entryLabel }}
            />
          )}
          message={(
            <FormattedMessage
              id="stripes-core.label.confirmDeleteEntry"
              values={{
                name: item[nameKey] || <FormattedMessage id="stripes-core.untitled" />,
              }}
            />
          )}
          confirmLabel={<FormattedMessage id="stripes-core.button.delete" />}
          cancelLabel={<FormattedMessage id="stripes-core.button.cancel" />}
          onConfirm={() => { this.confirmDelete(true, item); }}
          onCancel={() => { this.confirmDelete(false); }}
        />
        <Modal
          open={prohibitDelete}
          id="prohibit-item-delete"
          label={prohibitItemDelete.label}
          size="medium"
          footer={(
            <div data-test-prohibit-delete-modal-close-button>
              <Button
                buttonStyle="primary"
                marginBottom0
                onClick={() => { this.changeProhibitDeleteState(false); }}
              >
                {prohibitItemDelete.close}
              </Button>
            </div>
          )}
        >
          <div data-test-prohibit-delete-modal-message>
            {prohibitItemDelete.message}
          </div>
        </Modal>
      </Pane>
    );
  }

  render() {
    const {
      addButtonTitle,
      contentData,
      paneTitle,
      nameKey,
      addMenu,
      paneSetWidth
    } = this.props;

    const rows = this.filteredRows(contentData);
    const links = _.sortBy(rows, [record => record[nameKey].toLowerCase()]).map(item => (
      <div data-test-nav-list-item key={item.id}>
        <NavListItem
          to={this.linkPath(item.id)}
          onClick={() => this.props.onClick(item)}
        >
          {item[nameKey] || '[unnamed]'}
        </NavListItem>
      </div>
    ));

    const routes = rows.map(item => (
      <Route
        key={item.id}
        path={this.linkPath(item.id)}
        render={() => this.renderDetail(item)}
      />
    ));

    const LastMenu = addMenu || (
      <PaneMenu>
        <Button ariaLabel={addButtonTitle} onClick={this.props.onAdd} buttonStyle="primary paneHeaderNewButton">
          <Icon icon="plus-sign">
            <FormattedMessage id="stripes-components.button.new" />
          </Icon>
        </Button>
      </PaneMenu>
    );

    return (
      <Paneset defaultWidth={paneSetWidth} data-test-entry-manager>
        <Pane
          defaultWidth="fill"
          lastMenu={LastMenu}
          paneTitle={paneTitle}
          onMount={this.handlePaneFocus}
          paneTitleRef={this.paneTitleRef}
        >
          {this.props.rowFilter}
          <NavList>
            <NavListSection activeLink={this.activeLink(links)} className={contentData.length ? 'hasEntries' : ''}>
              {links}
            </NavListSection>
          </NavList>
        </Pane>

        <Switch>
          {routes}
        </Switch>

        {this.props.children}
      </Paneset>
    );
  }
}

export default EntrySelector;
