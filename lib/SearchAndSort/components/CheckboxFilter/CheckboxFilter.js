import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from '@folio/stripes-components';
import { kebabCase } from 'lodash';

export default class CheckboxFilter extends React.Component {
  static propTypes = {
    dataOptions: PropTypes.arrayOf(PropTypes.shape({
      disabled: PropTypes.bool,
      label: PropTypes.node,
      readOnly: PropTypes.bool,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedValues: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  };

  static defaultProps = {
    selectedValues: [],
  }

  createOnChangeHandler = (filterValue) => (e) => {
    const {
      name,
      selectedValues,
      onChange,
    } = this.props;

    const newValues = e.target.checked
      ? [...selectedValues, filterValue]
      : selectedValues.filter((value) => value !== filterValue);

    onChange({
      name,
      values: newValues,
    });
  };

  render() {
    const {
      dataOptions,
      selectedValues,
      ...rest
    } = this.props;

    return (
      dataOptions.map(({ value, label, disabled, readOnly }) => {
        const name = typeof label === 'string' ? label : value;
        return (
          <Checkbox
            {...rest}
            id={`clickable-filter-${this.props.name}-${kebabCase(name)}`}
            data-test-checkbox-filter-data-option={value}
            key={value}
            label={label}
            name={name}
            disabled={disabled}
            readOnly={readOnly}
            checked={selectedValues.includes(value)}
            onChange={this.createOnChangeHandler(value)}
          />
        );
      })
    );
  }
}
