import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Button, Icon, Layout } from '@folio/stripes-components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import LoanList from './LoanList';

class ChangeDueDateSuccess extends React.Component {
  static propTypes = {
    alerts: PropTypes.object,
    dueDatesChanged: PropTypes.shape({
      numSucceeded: PropTypes.number,
      numFailed: PropTypes.number,
    }),
    loans: PropTypes.arrayOf(
      PropTypes.shape({
        dueDate: PropTypes.string,
        id: PropTypes.string,
        itemId: PropTypes.string,
        loanDate: PropTypes.string,
      }),
    ),
    onCancel: PropTypes.func,
    requestCounts: PropTypes.object.isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    })
  }

  static defaultProps = {
    loans: [],
  }

  constructor(props) {
    super(props);

    this.connectedLoanList = props.stripes.connect(LoanList);
  }

  render() {
    const { numSucceeded, numFailed } = this.props.dueDatesChanged;
    return (
      <div>
        { numFailed > 1
          ? <p>
              <Icon size="medium" icon="check-circle" status="success" />
              <SafeHTMLMessage
                id="stripes-smart-components.cddd.changeSucceededWithFailures"
                values={{
                  succeeded: numSucceeded,
                  failed: numFailed,
                }}
              />
            </p>
          : <p>
            <Icon size="medium" icon="check-circle" status="success" />
            <SafeHTMLMessage
              id="stripes-smart-components.cddd.changeSucceededWithCount"
              values={{ succeeded: numSucceeded }}
            />
          </p>
        }
        <this.connectedLoanList
          stripes={this.props.stripes}
          alerts={this.props.alerts}
          allowSelection={false}
          loans={this.props.loans}
          requestCounts={this.props.requestCounts}
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
