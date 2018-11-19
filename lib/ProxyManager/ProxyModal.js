import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from '@folio/stripes-components';
import ProxyForm from './ProxyForm';

class ProxyModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    onContinue: PropTypes.func,
    open: PropTypes.bool,
    patron: PropTypes.object,
  };

  render() {
    const { onClose, open, patron, onContinue } = this.props;

    return (
      <Modal
        onClose={onClose}
        open={open}
        size="small"
        label={<FormattedMessage id="stripes-smart-components.whoAreYouActingAs" />}
        dismissible
      >
        <ProxyForm
          onSubmit={onContinue}
          initialValues={{ sponsorId: patron.id }}
          onCancel={onClose}
          {...this.props}
        />
      </Modal>
    );
  }
}


export default ProxyModal;
