import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import ProxyForm from './ProxyForm';

class ProxyModal extends React.Component {
  static propTypes = {
    patron: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onContinue: PropTypes.func,
  };

  render() {
    const { onClose, open, patron, onContinue } = this.props;

    return (
      <Modal onClose={onClose} open={open} size="small" label="Who are you acting as?" dismissible>
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
