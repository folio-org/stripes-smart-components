import { find, isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import ProxyModal from './ProxyModal';

class ProxyManager extends React.Component {
  static propTypes = {
    patron: PropTypes.object.isRequired,
    proxy: PropTypes.object,
    onSelectPatron: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      proxies: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      proxiesFor: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      sponsorOf: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      sponorQuery: PropTypes.shape({
        replace: PropTypes.func,
      }),
      proxiesFor: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      sponsorOf: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    sponorQuery: {
      initialValue: {},
    },
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(%{sponorQuery.ids})',
    },
    proxiesFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor?query=(proxyUserId=!{patron.id})',
    },
    sponsorOf: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor?query=(userId=!{patron.id})',
    },
  });

  constructor(props) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
    this.onClose = this.onClose.bind(this);
    this.state = { showModal: false };
  }

  componentWillReceiveProps(nextProps) {
    const { patron, resources, mutator, proxy } = nextProps;
    const proxiesFor = (resources.proxiesFor || {}).records || [];
    const { sponorQuery } = resources;
    const hasProxy = !!(proxiesFor.length);

    if (!hasProxy) return;

    if (hasProxy && isEmpty(proxy)) {
      this.toggleModal(true);
    }

    const ids = proxiesFor.map(p => `id=${p.userId}`).join(' or ');

    if (sponorQuery.patronId !== patron.id || sponorQuery.ids !== ids) {
      mutator.sponorQuery.replace({ ids, patronId: patron.id });
    }
  }

  onContinue(data) {
    const { resources, onSelectPatron, patron } = this.props;
    const proxies = (resources.proxies || {}).records || [];
    const selPatron = (patron.id === data.sponsorId)
      ? patron
      : find(proxies, s => s.id === data.sponsorId);

    onSelectPatron(selPatron);
    setTimeout(() => this.toggleModal(false));
  }

  onClose() {
    this.toggleModal(false);
    this.props.onClose();
  }

  toggleModal(showModal) {
    this.setState({ showModal });
  }

  render() {
    const { patron, resources } = this.props;
    const proxies = (resources.proxies || {}).records || [];
    const proxiesFor = (resources.proxiesFor || {}).records || [];
    const sponsorOf = (resources.sponsorOf || {}).records || [];
    const showModal = this.state.showModal;

    return (
      <ProxyModal
        patron={patron}
        proxies={proxies}
        proxiesFor={proxiesFor}
        sponsorOf={sponsorOf}
        open={showModal}
        onContinue={this.onContinue}
        onClose={this.onClose}
      />
    );
  }
}

export default ProxyManager;
