import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Layout from '@folio/stripes-components/lib/Layout';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import LoanList from '../LoanList';

class ChangeDueDateSuccess extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    alerts: PropTypes.object,
    loans: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        itemId: PropTypes.string,
        loanDate: PropTypes.string,
        dueDate: PropTypes.string,
      }),
    ),
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    loans: [],
  }

  constructor(props) {
    super(props);

    this.connectedLoanList = props.stripes.connect(LoanList);
  }

  render() {
    const { loans } = this.props;

    return (
      <div>
        { loans.length > 1 ?
          <p>
            <Icon size="small" icon="validation-check" color="green" />
            <SafeHTMLMessage
              id="stripes-smart-components.cddd.changeSucceededWithCount"
              values={{ count: loans.length }}
            />
          </p>
          : null
        }
        <this.connectedLoanList
          stripes={this.props.stripes}
          alerts={this.props.alerts}
          allowSelection={false}
          loans={loans}
        />
        <Layout className="textRight">
          <Button buttonStyle="primary" onClick={this.props.onCancel}>
            <FormattedMessage id="stripes-core.button.close" />
          </Button>
        </Layout>
      </div>
    );
  }
}

export default ChangeDueDateSuccess;
