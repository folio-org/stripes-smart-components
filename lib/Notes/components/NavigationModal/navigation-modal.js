import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';
import { withRouter } from 'react-router';

import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes-components';

const historyActions = {
  PUSH: 'PUSH',
  REPLACE: 'REPLACE',
};

const INITIAL_MODAL_STATE = {
  nextLocation: null,
  openModal: false,
};

class NavigationModal extends Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    historyAction: PropTypes.string,
    when: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = INITIAL_MODAL_STATE;
  }

  componentDidMount() {
    this.unblock = this.props.history.block((nextLocation) => {
      if (this.props.when) {
        this.setState({
          openModal: true,
          nextLocation
        });
      }
      return !this.props.when;
    });
  }

  componentWillUnmount() {
    this.unblock();
  }

  onCancel = () => {
    this.setState(INITIAL_MODAL_STATE);
  };

  onConfirm = () => {
    this.navigateToNextLocation();
  };

  navigateToNextLocation() {
    const {
      historyAction,
      history: {
        action,
        replace,
        push,
      },
    } = this.props;

    const { nextLocation } = this.state;

    this.unblock();

    const replaceActionRequired =
      (historyAction && historyAction === historyActions.REPLACE)
      || action === historyActions.REPLACE;

    if (replaceActionRequired) {
      replace(nextLocation);
    } else {
      push(nextLocation);
    }
  }

  render() {
    return (
      <Modal
        id="navigation-modal"
        size="small"
        open={this.state.openModal}
        label={<FormattedMessage id="stripes-smart-components.notes.navModal.modalLabel" />}
        role="dialog"
        footer={(
          <ModalFooter>
            <Button
              data-test-navigation-modal-dismiss
              buttonStyle="primary"
              onClick={this.onCancel}
            >
              <FormattedMessage id="stripes-smart-components.notes.navModal.dismissLabel" />
            </Button>
            <Button
              data-test-navigation-modal-continue
              onClick={this.onConfirm}
            >
              <FormattedMessage id="stripes-smart-components.notes.navModal.continueLabel" />
            </Button>
          </ModalFooter>
        )}
      >
        <FormattedMessage id="stripes-smart-components.notes.navModal.unsavedChangesMsg" />
      </Modal>
    );
  }
}

export default withRouter(NavigationModal);
