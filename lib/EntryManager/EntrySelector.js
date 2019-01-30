import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes-core';
import {
  Button,
  Icon,
  IconButton,
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  PaneMenu,
  Paneset
} from '@folio/stripes-components';

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
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    isActionMenuActive: PropTypes.bool,
    location: PropTypes.object.isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    nameKey: PropTypes.string,
    onAdd: PropTypes.func,
    onClick: PropTypes.func,
    onClone: PropTypes.func,
    onEdit: PropTypes.func,
    paneSetWidth: PropTypes.string,
    paneTitle: PropTypes.node,
    paneWidth: PropTypes.string.isRequired,
    parentMutator: PropTypes.object.isRequired,
    parentResources: PropTypes.object,
    permissions: PropTypes.object,
    rowFilter: PropTypes.element,
    rowFilterFunction: PropTypes.func,
    stripes: PropTypes.object,
  };

  static defaultProps = {
    editable: true,
    nameKey: 'name',
    paneSetWidth: 'fill',
    permissions: {},
  };

  constructor(props) {
    super(props);

    this.activeLink = this.activeLink.bind(this);
    this.linkPath = this.linkPath.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onClick = this.onClick.bind(this);
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
      onRemove,
      permissions,
    } = this.props;

    return (
      <React.Fragment>
        <IfPermission perm={permissions.delete}>
          <Button
            buttonStyle="dropdownItem"
            onClick={() => {
              onRemove(item);
              onToggle();
            }}
          >
            <Icon icon="trash">
              <FormattedMessage id="ui-circulation.settings.common.delete" />
            </Icon>
          </Button>
        </IfPermission>
        <IfPermission perm={permissions.post}>
          <Button
            buttonStyle="dropdownItem"
            onClick={() => {
              onEdit(item);
              onToggle();
            }}
          >
            <Icon icon="edit">
              <FormattedMessage id="ui-circulation.settings.common.edit" />
            </Icon>
          </Button>
        </IfPermission>
        <IfPermission perm={permissions.post}>
          <IfPermission perm={permissions.put}>
            <Button
              buttonStyle="dropdownItem"
              onClick={() => {
                onClone(item);
                onToggle();
              }}
            >
              <Icon icon="duplicate">
                <FormattedMessage id="ui-circulation.settings.common.duplicate" />
              </Icon>
            </Button>
          </IfPermission>
        </IfPermission>
      </React.Fragment>
    );
  };

  renderDetail(item) {
    const {
      detailPaneTitle,
      stripes,
      paneWidth,
      detailComponent,
      parentMutator,
      editable,
      parentResources,
      isActionMenuActive,
    } = this.props;
    const ComponentToRender = detailComponent;

    const lastMenu = (
      <PaneMenu>
        <FormattedMessage id="stripes-components.button.edit">
          {ariaLabel => (
            editable && <IconButton
              icon="edit"
              onClick={() => this.props.onEdit(item)}
              id="clickable-edit-item"
              ariaLabel={ariaLabel}
              size="medium"
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );

    return (
      <Pane
        paneTitle={detailPaneTitle}
        actionMenu={isActionMenuActive && this.getActionMenu(item)}
        lastMenu={lastMenu}
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
        />
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
      <NavListItem
        key={item.id}
        to={this.linkPath(item.id)}
        onClick={() => this.props.onClick(item)}
      >
        {item[nameKey] || '[unnamed]'}
      </NavListItem>
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
      <Paneset defaultWidth={paneSetWidth}>
        <Pane defaultWidth="fill" lastMenu={LastMenu} paneTitle={paneTitle}>
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
