import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@folio/stripes-components/lib/Modal';
import ProxyForm from './ProxyForm';
import { intlShape } from 'react-intl';

class ProxyModal extends React.Component {
  static propTypes = {
    patron: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onContinue: PropTypes.func,
  };

  static contextTypes = {
    intl: intlShape,
  }

  render() {
    const { onClose, open, patron, onContinue } = this.props;
    const formatMsg = this.context.intl.formatMessage;

    return (
      <Modal onClose={onClose} open={open} size="small" label={formatMsg({ id: 'stripes-smart-components.whoAreYouActingAs' })} dismissible>
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
