import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Modal } from '@folio/stripes-components';
import ProxyForm from './ProxyForm';

class ProxyModal extends React.Component {
  static propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    onContinue: PropTypes.func,
    open: PropTypes.bool,
    patron: PropTypes.object,
  };

  render() {
    const { onClose, open, patron, onContinue, intl: { formatMessage } } = this.props;

    return (
      <Modal
        onClose={onClose}
        open={open}
        size="small"
        label={formatMessage({ id: 'stripes-smart-components.whoAreYouActingAs' })}
        dismissible
      >
        <ProxyForm
          onSubmit={onContinue}
          initialValues={{ sponsorId: patron.id }}
          onCancel={onClose}
          intl={this.props.intl}
          {...this.props}
        />
      </Modal>
    );
  }
}


export default injectIntl(ProxyModal);
