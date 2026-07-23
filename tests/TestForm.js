/*
  Basic harness prop for testing redux-form functionality
  children should be a <Field> component with the tested component passed
  as the 'children' prop.
*/

import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import { reduxForm } from 'redux-form';
import { Form } from 'react-final-form';

class TestForm extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  render() {
    return this.props.children;
  }
}

export default reduxForm({
  form: 'formsDemo'
})(TestForm);

export const TestFinalForm = ({ children, ...formProps }) => (
  <Form onSubmit={formProps.onSubmit || noop}>
    { children }
  </Form>
);
