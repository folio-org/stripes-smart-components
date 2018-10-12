import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import stripesForm from '@folio/stripes-form';
import { Button, TextArea } from '@folio/stripes-components';

class NotesForm extends React.Component {
  static propTypes = {
    editMode: PropTypes.bool,
    form: PropTypes.string,
    handleSubmit: PropTypes.func,
    intl: intlShape,
    onCancel: PropTypes.func,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired,
    submitting: PropTypes.bool,
    textRows: PropTypes.string,
    values: PropTypes.object,
  }

  render() {
    const {
      form,
      handleSubmit,
      intl: { formatMessage },
      pristine,
      submitting,
      textRows,
      editMode,
      onCancel,
    } = this.props;

    const handleKeyDown = (e, handler) => {
      if (e.key === 'Enter' && e.shiftKey === false) {
        e.preventDefault();
        handler(this.props.values);
      }
    };

    const handleClickSubmit = () => {
      handleSubmit();
      this.props.reset();
    };

    return (
      <form>
        <Field
          name="text"
          placeholder={formatMessage({ id: 'stripes-smart-components.enterANote' })}
          aria-label={formatMessage({ id: 'stripes-smart-components.notesTextArea' })}
          fullWidth
          id="note_textarea"
          component={TextArea}
          onKeyDown={(e) => { handleKeyDown(e, handleClickSubmit); }}
          rows={textRows}
        />
        <div style={{ textAlign: 'right' }}>
          {editMode &&
            <Button
              buttonStyle="hover"
              onClick={onCancel}
              aria-label={formatMessage({ id: 'stripes-smart-components.cancelEdit' })}
            >
              <FormattedMessage id="stripes-components.button.cancel" />
            </Button>
          }
          <Button
            disabled={pristine || submitting}
            onClick={handleClickSubmit}
            aria-label={formatMessage({ id: 'stripes-smart-components.postNote' })}
          >
            <FormattedMessage id="stripes-smart-components.post" />
          </Button>
        </div>
      </form>
    );
  }
}

export default stripesForm({
  form: 'NotesForm',
  enableReinitialize: true,
})(injectIntl(NotesForm));
