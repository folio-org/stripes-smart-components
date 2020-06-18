import { chunk } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, RadioButton, Row } from '@folio/stripes-components';
import { getFullName, isProxyExpired, isSponsorExpired, isRequestForSponsorInvalid } from './proxyUtil';
import css from './ProxyForm.css';

function renderEnabledRadio(proxy) {
  return (
    <Field
      component={RadioButton}
      type="radio"
      id={`proxy-${proxy.id}`}
      key={`proxy-${proxy.id}`}
      name="sponsorId"
      label={getFullName(proxy)}
      value={proxy.id}
      data-test-acting-as-proxy
    />
  );
}

class ProxyForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    patron: PropTypes.object,
    proxies: PropTypes.arrayOf(PropTypes.object),
    proxiesFor: PropTypes.arrayOf(PropTypes.object),
    sponsorOf: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    const { proxiesFor, sponsorOf } = props;

    this.proxiesMap = proxiesFor.reduce((memo, p) => {
      memo[p.userId] = p;
      return memo;
    }, {});

    this.sponsorsMap = sponsorOf.reduce((memo, s) => {
      memo[s.proxyUserId] = s;
      return memo;
    }, {});

    this.handleSubmitLocal = this.handleSubmitLocal.bind(this);
  }

  renderDisabledRadio(proxy, sponsor, proxyMap) {
    let message;

    if (isProxyExpired(proxy, proxyMap)) {
      message = <FormattedMessage id="stripes-smart-components.pm.proxyExpired" />;
    } else if (isSponsorExpired(sponsor)) {
      message = <FormattedMessage id="stripes-smart-components.pm.sponsorExpired" />;
    } else if (isRequestForSponsorInvalid(proxy, proxyMap)) {
      message = <FormattedMessage id="stripes-smart-components.pm.cannotRequestFoSponsor" />;
    }

    return message && (
      <div>
        <input id={`proxy-${proxy.id}`} type="radio" disabled className={css.disabled} />
        <label htmlFor={`proxy-${proxy.id}`} className={css.label}>{getFullName(proxy)}</label>
        <div className={css.error}>{message}</div>
      </div>
    );
  }

  // This form, if invoked and then saved from within another form (such as the ui-requests form),
  // triggers a cascading form submission that saves and closes the main form as well.
  // This is not a good thing, so we want to stop the event from bubbling up to the outer form.
  handleSubmitLocal(e) {
    this.props.handleSubmit();
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const { onCancel, patron, proxies } = this.props;
    const proxiesList = chunk(proxies, 3).map((group, i) => (
      <Row key={`row-${i}`}>
        {group.map(proxy => (
          <Col xs={12} key={`col-${proxy.id}`}>
            {
              this.renderDisabledRadio(proxy, patron, this.proxiesMap) ||
              renderEnabledRadio(proxy)
            }
          </Col>
        ))}
      </Row>
    ));

    return (
      <form id="proxy-form" onSubmit={this.handleSubmitLocal}>
        <Row>
          <Col xs={12}>
            <FormattedMessage
              id="stripes-smart-components.isActingAs"
              values={{ name: <strong>{getFullName(patron)}</strong> }}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              component={RadioButton}
              type="radio"
              id={`sponsor-${patron.id}`}
              key={`sponsor-${patron.id}`}
              name="sponsorId"
              label={<FormattedMessage id="stripes-smart-components.self" />}
              value={patron.id}
              data-test-acting-as-self
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <FormattedMessage id="stripes-smart-components.actingAsProxyFor" tagName="strong" />
          </Col>
        </Row>
        {proxiesList}
        <br />
        <Row>
          <Col xs={3}>
            <Button onClick={onCancel} buttonStyle="secondary" fullWidth data-test-cancel-button>
              <FormattedMessage id="stripes-smart-components.pm.cancel" />
            </Button>
          </Col>
          <Col xs={3}>
            <Button type="submit" fullWidth data-test-continue-button>
              <FormattedMessage id="stripes-smart-components.pm.continue" />
            </Button>
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'proxyForm',
})(ProxyForm);
