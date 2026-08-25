import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { withStripes } from '@folio/stripes-core';
import {
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  PaneBackLink,
} from '@folio/stripes-components';

class Settings extends Component {
  constructor(props) {
    super(props);
    const stripes = props.stripes;

    this.paneTitleRef = props.paneTitleRef || React.createRef();

    this.sections = props.sections;

    // if props.section was not provided, push props.pages into an array
    // so it can act like props.sections. this allows all the logic here to
    // act like we have an array of sections containing an array of
    // { label: string, pages: array } objects, which is simpler than
    // separate logic for props.sections and props.pages.
    if (!this.sections) {
      this.sections = [{
        label: '',
        pages: props.pages || [],
      }];
    }

    // this.routes contains routes from all pages across all sections
    this.routes = [];
    this.sections.forEach(section => {
      const sectionRoutes = section.pages
        .filter(p => !p.perm || stripes.hasPerm(p.perm))
        .filter(p => !p.iface || stripes.hasInterface(p.iface))
        .map(page => ({
          page,
          component: stripes.connect(page.component, { dataKey: page.route }),
        }));
      this.routes = [...this.routes, ...sectionRoutes];
    });
  }

  handlePaneFocus = ({ paneTitleRef }) => {
    if (paneTitleRef) paneTitleRef.current.focus();
  }

  render() {
    const props = this.props;
    const stripes = props.stripes;
    const { additionalRoutes } = props;
    let { activeLink } = this.props;

    // links in a given section
    const navlinks = (section) => {
      const navItems = section.pages.map((p) => {
        const search = props.location.search || '';
        const link = `${props.match.path}/${p.route}`;
        let href = link;
        let isActive = false;

        // NavListItem can derive active state from `activeLink` context, but that
        // relies on exact href matching which breaks when the location includes a
        // query string or sub-route path. So we determine active state explicitly
        // here using the pathname alone: exact match, or a sub-route beneath this
        // link. The path-segment boundary check (link + '/') prevents a route from
        // falsely matching another route that shares its prefix
        // (e.g. 'custom-fields-po' must not match 'custom-fields-pol').
        if (props.location.pathname === link || props.location.pathname.startsWith(link + '/')) {
          // apply the query string for the active link only.
          href = link + search;
          activeLink = link;
          isActive = true;
        }
        if (p.perm && !stripes.hasPerm(p.perm)) return null;

        return (
          <NavListItem
            key={p.route}
            to={href}
            isActive={isActive}
          >
            {p.label}
          </NavListItem>
        );
      }).filter(x => x !== null);

      return (
        <NavListSection activeLink={activeLink} label={section.label}>
          {navItems}
        </NavListSection>
      );
    };

    let Saved;
    const routes = this.routes.map((p) => {
      const Current = p.component;
      if (!Saved) Saved = Current;
      return (<Route
        key={p.page.route}
        path={`${props.match.path}/${p.page.route}`}
        render={props2 => <Current {...props2} stripes={stripes} label={p.page.label} />}
      />);
    });

    return (
      <>
        <Pane
          defaultWidth={props.navPaneWidth}
          paneTitle={props.paneTitle || 'Module Settings'}
          firstMenu={<PaneBackLink to={props.paneBackLink} />}
          paneTitleRef={this.paneTitleRef}
          onMount={this.handlePaneFocus}
          id="app-settings-nav-pane"
        >
          {this.sections.map((section, index) => {
            const {
              label: {
                props: sectionProps,
              },
            } = section;
            const id = sectionProps && sectionProps.id ? sectionProps.id : 'Module Settings';

            return (
              <NavList
                key={index}
                aria-label={id}
              >
                {navlinks(section)}
              </NavList>
            );
          })
          }
        </Pane>
        <Switch>
          {additionalRoutes}
          {routes}
        </Switch>
      </>
    );
  }
}

Settings.propTypes = {
  activeLink: PropTypes.string,
  additionalRoutes: PropTypes.arrayOf(
    PropTypes.object.isRequired,
  ),
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  navPaneWidth: PropTypes.string,
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.func.isRequired,
      label: PropTypes.node.isRequired,
      perm: PropTypes.string,
      route: PropTypes.string.isRequired,
    }),
  ),
  paneBackLink: PropTypes.string,
  paneTitle: PropTypes.node,
  paneTitleRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      pages: PropTypes.arrayOf(
        PropTypes.shape({
          component: PropTypes.func.isRequired,
          label: PropTypes.node.isRequired,
          perm: PropTypes.string,
          route: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ),
  stripes: PropTypes.shape({
    connect: PropTypes.func.isRequired,
    hasPerm: PropTypes.func.isRequired,
    hasInterface: PropTypes.func.isRequired,
  }).isRequired,
};

Settings.defaultProps = {
  navPaneWidth: '30%',
  paneBackLink: '/settings',
};

export default withStripes(Settings);
