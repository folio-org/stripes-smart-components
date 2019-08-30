import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';
import noop from 'lodash/noop';

import { Button } from '@folio/stripes-components';

import css from './PluginFindRecord.css';

class PluginFindRecord extends React.Component {
  state = {
    openModal: false,
  }

  getStyle() {
    const { marginBottom0, marginTop0 } = this.props;

    return className(
      css.searchControl,
      { [css.marginBottom0]: marginBottom0 },
      { [css.marginTop0]: marginTop0 },
    );
  }

  openModal = () => this.setState({
    openModal: true,
  });

  closeModal = () => this.setState({
    openModal: false,
  });

  passRecordsOut = records => {
    this.props.selectRecordsCb(records);
    this.closeModal();
  }

  passRecordOut = (e, record) => {
    this.passRecordsOut([record]);
  }

  render() {
    const {
      children,
      disabled,
      searchButtonStyle,
      searchLabel,
    } = this.props;

    return (
      <div className={this.getStyle()}>
        <Button
          data-test-plugin-find-record-button
          buttonStyle={searchButtonStyle}
          disabled={disabled}
          key="searchButton"
          onClick={this.openModal}
        >
          {searchLabel}
        </Button>
        {this.state.openModal && children({
          onSaveMultiple: this.passRecordsOut,
          onSelectRow: this.passRecordOut,
          closeModal: this.closeModal,
        })}
      </div>
    );
  }
}

PluginFindRecord.propTypes = {
  children: PropTypes.func,
  disabled: PropTypes.bool,
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
  searchButtonStyle: PropTypes.string,
  searchLabel: PropTypes.node.isRequired,
  selectRecordsCb: PropTypes.func,
};

PluginFindRecord.defaultProps = {
  disabled: false,
  marginBottom0: true,
  marginTop0: true,
  searchButtonStyle: 'primary',
  selectRecordsCb: noop,
};

export default PluginFindRecord;
