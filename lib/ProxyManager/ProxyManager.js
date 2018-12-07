import { find, isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import ProxyModal from './ProxyModal';

class ProxyManager extends React.Component {
  static manifest = Object.freeze({
    proxies: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    proxiesFor: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
    sponsorOf: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: 'true',
      fetch: false,
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      proxiesFor: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      sponsorOf: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
    }).isRequired,
    onClose: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onSelectPatron: PropTypes.func.isRequired,
    patron: PropTypes.object.isRequired,
    proxy: PropTypes.object,
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
  };

  constructor(props) {
    super(props);

    this.toggleModal = this.toggleModal.bind(this);
    this.onContinue = this.onContinue.bind(this);
    this.onClose = this.onClose.bind(this);
    this.state = { showModal: false };
  }

  componentDidMount() {
    this.loadSponsorOf();
    this.loadProxiesFor();
  }

  loadSponsorOf() {
    const { mutator, patron } = this.props;
    const query = `query=(userId==${patron.id})`;
    mutator.sponsorOf.reset();
    mutator.sponsorOf.GET({ params: { query } });
  }

  loadProxiesFor() {
    const { mutator, patron } = this.props;
    const query = `query=(proxyUserId==${patron.id})`;

    mutator.proxiesFor.reset();
    mutator.proxiesFor.GET({ params: { query } })
      .then(records => this.loadProxies(records));
  }

  loadProxies(proxiesFor) {
    const { mutator, proxy } = this.props;
    const ids = proxiesFor.map(p => `id==${p.userId}`).join(' or ');
    if (!ids) return;

    const query = `query=(${ids})`;
    mutator.proxies.reset();
    mutator.proxies.GET({ params: { query } });

    if (isEmpty(proxy)) {
      this.setState({ showModal: true });
    }
  }

  onClose() {
    this.toggleModal(false);
    this.props.onClose();
  }

  onContinue(data) {
    const { resources, onSelectPatron, patron } = this.props;
    const proxies = (resources.proxies || {}).records || [];
    const selPatron = (patron.id === data.sponsorId)
      ? patron
      : find(proxies, s => s.id === data.sponsorId);

    onSelectPatron(selPatron);
    this.toggleModal(false);
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
