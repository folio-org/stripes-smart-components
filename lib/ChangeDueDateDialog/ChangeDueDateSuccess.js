import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Button from '@folio/stripes-components/lib/Button';
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
    loanPolicies: PropTypes.object,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    loans: [],
  }

  render() {
    const { loans } = this.props;

    return (
      <div>
        { loans.length > 1 ?
          <p>
            <SafeHTMLMessage
              id="stripes-smart-components.cddd.changeSucceededWithCount"
              values={{ count: loans.length }}
            />
          </p>
          : null
        }
        <LoanList
          stripes={this.props.stripes}
          alerts={this.props.alerts}
          allowSelection={false}
          loans={loans}
          loanPolicies={this.props.loanPolicies}
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
