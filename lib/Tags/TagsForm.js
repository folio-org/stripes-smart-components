import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import stripesForm from '@folio/stripes-form';
import Button from '@folio/stripes-components/lib/Button';
import TextArea from '@folio/stripes-components/lib/TextArea';

class TagsForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }),
    }).isRequired,
    editMode: PropTypes.bool,
    onCancel: PropTypes.func,
    textRows: PropTypes.string,
    form: PropTypes.string,
    handleSubmit: PropTypes.func,
    reset: PropTypes.func,
    submitting: PropTypes.bool,
    pristine: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClickSubmit = this.handleClickSubmit.bind(this);
  }

  handleClickSubmit() {
    this.props.handleSubmit();
    this.props.reset();
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      this.props.handleSubmit();
      this.props.reset();
    }
  }

  render() {
    const {
      form,
      pristine,
      submitting,
      textRows,
      editMode,
      onCancel,
    } = this.props;

    const formatMsg = this.props.stripes.intl.formatMessage;

    return (
      <form>
        <Field
          name="tags"
          placeholder={formatMsg({ id: 'stripes-smart-components.enterANote' })}
          aria-label={formatMsg({ id: 'stripes-smart-components.notesTextArea' })}
          fullWidth
          id="tags_textarea"
          component={TextArea}
          onKeyDown={this.handleKeyDown}
          rows={textRows}
        />
        <div style={{ textAlign: 'right' }}>
          {editMode &&
            <Button buttonStyle="hover" onClick={onCancel} aria-label={formatMsg({ id: 'stripes-smart-components.cancelEdit' })}>
              <FormattedMessage id="stripes-components.button.cancel" />
            </Button>
          }
          <Button disabled={pristine || submitting} onClick={this.handleClickSubmit} aria-label={formatMsg({ id: 'stripes-smart-components.postNote' })}>
            <FormattedMessage id="stripes-smart-components.post" />
          </Button>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'TagsForm',
  enableReinitialize: true,
})(TagsForm);
