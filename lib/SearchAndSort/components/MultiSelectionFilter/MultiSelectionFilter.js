import React from 'react';
import PropTypes from 'prop-types';

import { MultiSelection } from '@folio/stripes-components';

export default class MultiSelectionFilter extends React.Component {
  static propTypes = {
    dataOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any,
    })).isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedValues: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    selectedValues: [],
  }

  onChangeHandler = (selectedDataOptions) => {
    const {
      name,
      onChange,
    } = this.props;

    onChange({
      name,
      values: selectedDataOptions.map((option) => option.value),
    });
  };

  getSelectedDataOptions() {
    const {
      selectedValues,
      dataOptions,
    } = this.props;

    return selectedValues
      .map((curValue) => dataOptions.find((curAvailableValue) => curAvailableValue.value === curValue));
  }

  render() {
    return (
      <MultiSelection
        {...this.props}
        value={this.getSelectedDataOptions()}
        onChange={this.onChangeHandler}
      />
    );
  }
}
